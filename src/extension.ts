import * as vscode from 'vscode';
import { EnvMaskingProvider } from './providers/EnvMaskingProvider';
import { StatusBarProvider } from './providers/StatusBarProvider';
import { SidebarProvider } from './providers/SidebarProvider';
import { SettingsManager } from './managers/SettingsManager';
import { PatternMatcher } from './utils/PatternMatcher';
import { ClipboardProtector } from './utils/ClipboardProtector';
import { ConfigExporter } from './utils/ConfigExporter';
import { ActivityLogger } from './utils/ActivityLogger';

export function activate(context: vscode.ExtensionContext) {
    console.log('EnvGuard extension is now active!');
    console.log('Extension context:', context.extension.extensionPath);
    console.log('Activation events:', context.extension.packageJSON.activationEvents);
    
    // Log all registered commands
    vscode.commands.getCommands().then(commands => {
        console.log('Available commands:', commands.filter(cmd => cmd.startsWith('envguard.')));
    });

    // Initialize managers and providers
    const settingsManager = new SettingsManager();
    const patternMatcher = new PatternMatcher(settingsManager);
    const envMaskingProvider = new EnvMaskingProvider(settingsManager, patternMatcher);
    const statusBarProvider = new StatusBarProvider(envMaskingProvider);
    const sidebarProvider = new SidebarProvider(context, envMaskingProvider, settingsManager);
    const clipboardProtector = new ClipboardProtector(settingsManager);
    const configExporter = new ConfigExporter(settingsManager);
    const activityLogger = ActivityLogger.getInstance();
    
    // Log activation
    activityLogger.info('EnvGuard extension activated');

    // Register the sidebar view provider
    try {
        console.log('Registering sidebar provider...');
        const sidebarRegistration = vscode.window.registerWebviewViewProvider(
            SidebarProvider.viewType,
            sidebarProvider
        );
        context.subscriptions.push(sidebarRegistration);
        console.log('Sidebar provider registered successfully');
        
        // Show the sidebar after a short delay to ensure it's ready
        setTimeout(async () => {
            try {
                await vscode.commands.executeCommand('workbench.view.extension.envguard-sidebar');
                console.log('Sidebar view revealed');
            } catch (err) {
                console.error('Failed to reveal sidebar view:', err);
            }
        }, 1000);
    } catch (error) {
        console.error('Failed to register sidebar provider:', error);
    }
    

    // Register focus command to show the sidebar
    const focusCommand = vscode.commands.registerCommand('envguard.focus', async () => {
        try {
            await vscode.commands.executeCommand('workbench.view.extension.envguard-sidebar');
            console.log('Sidebar view focused');
        } catch (error) {
            console.error('Failed to focus sidebar view:', error);
        }
    });

    // Register commands
    const toggleMaskingCommand = vscode.commands.registerCommand('envguard.toggleMasking', (value?: boolean) => {
        if (typeof value === 'boolean') {
            const currentStatus = envMaskingProvider.getStatus();
            if (currentStatus.enabled !== value) {
                envMaskingProvider.toggleMasking();
            }
        } else {
            envMaskingProvider.toggleMasking();
        }
        statusBarProvider.updateStatusBar();
        activityLogger.info(`Masking ${envMaskingProvider.getStatus().enabled ? 'enabled' : 'disabled'}`);
    });

    const toggleStreamingModeCommand = vscode.commands.registerCommand('envguard.toggleStreamingMode', (value?: boolean) => {
        const currentStatus = envMaskingProvider.getStatus();
        const shouldEnable = typeof value === 'boolean' ? value : !currentStatus.streamingMode;
        
        if (shouldEnable) {
            envMaskingProvider.enableStreamingMode();
            activityLogger.info('Streaming mode enabled');
        } else {
            envMaskingProvider.disableStreamingMode();
            activityLogger.info('Streaming mode disabled');
        }
        statusBarProvider.updateStatusBar();
    });

    const enableStreamingModeCommand = vscode.commands.registerCommand('envguard.enableStreamingMode', () => {
        envMaskingProvider.enableStreamingMode();
        statusBarProvider.updateStatusBar();
        activityLogger.info('Streaming mode enabled');
    });

    const disableStreamingModeCommand = vscode.commands.registerCommand('envguard.disableStreamingMode', () => {
        envMaskingProvider.disableStreamingMode();
        statusBarProvider.updateStatusBar();
        activityLogger.info('Streaming mode disabled');
    });

    const refreshPatternsCommand = vscode.commands.registerCommand('envguard.refreshPatterns', () => {
        patternMatcher.refreshPatterns();
        envMaskingProvider.refreshAllDecorations();
        activityLogger.info('Patterns refreshed');
    });

    const openSettingsCommand = vscode.commands.registerCommand('envguard.openSettings', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'envguard');
        activityLogger.info('Opened settings');
    });
    
    const scanWorkspaceCommand = vscode.commands.registerCommand('envguard.scanWorkspace', async () => {
        try {
            activityLogger.info('Starting workspace scan');
            // This would be implemented to scan the workspace for .env files
            // For now, we'll just refresh the current decorations
            envMaskingProvider.refreshAllDecorations();
            activityLogger.info('Workspace scan completed');
            return true;
        } catch (error) {
            activityLogger.error('Workspace scan failed', error);
            throw error;
        }
    });
    
    const exportConfigCommand = vscode.commands.registerCommand('envguard.exportConfig', async () => {
        try {
            await configExporter.exportConfig();
            activityLogger.info('Configuration exported');
        } catch (error) {
            activityLogger.error('Failed to export configuration', error);
            throw error;
        }
    });
    
    const importConfigCommand = vscode.commands.registerCommand('envguard.importConfig', async () => {
        try {
            await configExporter.importConfig();
            activityLogger.info('Configuration imported');
        } catch (error) {
            activityLogger.error('Failed to import configuration', error);
            throw error;
        }
    });
    
    const viewLogsCommand = vscode.commands.registerCommand('envguard.viewLogs', () => {
        activityLogger.showLogs();
    });

    // Open feature request page
    const openFeatureRequestCommand = vscode.commands.registerCommand('envguard.openFeatureRequest', () => {
        vscode.env.openExternal(vscode.Uri.parse('https://envguard.canny.io/feature-requests'));
    });

    // Register event handlers
    const onDidOpenTextDocument = vscode.workspace.onDidOpenTextDocument(document => {
        if (envMaskingProvider.isEnvFile(document)) {
            try {
                envMaskingProvider.applyMasking(document);
                activityLogger.info(`Opened file: ${document.fileName}`);
            } catch (error) {
                activityLogger.error(`Failed to apply masking to ${document.fileName}`, error);
            }
        }
    });

    const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument((event) => {
        if (envMaskingProvider.isEnvFile(event.document)) {
            envMaskingProvider.debouncedApplyMasking(event.document);
        }
    });

    const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && envMaskingProvider.isEnvFile(editor.document)) {
            envMaskingProvider.applyMasking(editor.document);
        }
        statusBarProvider.updateStatusBar();
    });

    const onDidChangeConfiguration = vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('envguard')) {
            settingsManager.refreshSettings();
            patternMatcher.refreshPatterns();
            envMaskingProvider.refreshAllDecorations();
            statusBarProvider.updateStatusBar();
        }
    });

    // Initialize clipboard protection
    clipboardProtector.initialize();

    // Apply masking to already open documents
    vscode.workspace.textDocuments.forEach(document => {
        if (envMaskingProvider.isEnvFile(document)) {
            envMaskingProvider.applyMasking(document);
        }
    });

    // Add all commands to subscriptions
    context.subscriptions.push(
        focusCommand,
        toggleMaskingCommand,
        toggleStreamingModeCommand,
        enableStreamingModeCommand,
        disableStreamingModeCommand,
        refreshPatternsCommand,
        openSettingsCommand,
        scanWorkspaceCommand,
        exportConfigCommand,
        importConfigCommand,
        viewLogsCommand,
        openFeatureRequestCommand,
        onDidOpenTextDocument,
        onDidChangeTextDocument,
        onDidChangeActiveTextEditor,
        onDidChangeConfiguration,
        statusBarProvider,
        envMaskingProvider,
        clipboardProtector
    );
    
    // Log extension activation completion
    activityLogger.info('EnvGuard extension activation completed');

    // Update status bar initially
    statusBarProvider.updateStatusBar();
}

export function deactivate() {
    const activityLogger = ActivityLogger.getInstance();
    activityLogger.info('EnvGuard extension deactivated');
    console.log('EnvGuard extension is now deactivated');
}