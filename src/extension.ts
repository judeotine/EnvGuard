import * as vscode from 'vscode';
import { EnvMaskingProvider } from './providers/EnvMaskingProvider';
import { StatusBarProvider } from './providers/StatusBarProvider';
import { SidebarProvider } from './providers/SidebarProvider';
import { SettingsManager } from './managers/SettingsManager';
import { PatternMatcher } from './utils/PatternMatcher';
import { ClipboardProtector } from './utils/ClipboardProtector';

export function activate(context: vscode.ExtensionContext) {
    console.log('EnvGuard extension is now active!');

    // Initialize managers and providers
    const settingsManager = new SettingsManager();
    const patternMatcher = new PatternMatcher(settingsManager);
    const envMaskingProvider = new EnvMaskingProvider(settingsManager, patternMatcher);
    const statusBarProvider = new StatusBarProvider(envMaskingProvider);
    const sidebarProvider = new SidebarProvider(context, envMaskingProvider, settingsManager);
    const clipboardProtector = new ClipboardProtector(settingsManager);

    // Register commands
    const toggleMaskingCommand = vscode.commands.registerCommand('envguard.toggleMasking', () => {
        envMaskingProvider.toggleMasking();
        statusBarProvider.updateStatusBar();
    });

    const enableStreamingModeCommand = vscode.commands.registerCommand('envguard.enableStreamingMode', () => {
        envMaskingProvider.enableStreamingMode();
        statusBarProvider.updateStatusBar();
        vscode.window.showInformationMessage('EnvGuard: Streaming mode enabled - all secrets are now masked');
    });

    const disableStreamingModeCommand = vscode.commands.registerCommand('envguard.disableStreamingMode', () => {
        envMaskingProvider.disableStreamingMode();
        statusBarProvider.updateStatusBar();
        vscode.window.showInformationMessage('EnvGuard: Streaming mode disabled');
    });

    const refreshPatternsCommand = vscode.commands.registerCommand('envguard.refreshPatterns', () => {
        patternMatcher.refreshPatterns();
        envMaskingProvider.refreshAllDecorations();
        vscode.window.showInformationMessage('EnvGuard: Patterns refreshed');
    });

    const openSettingsCommand = vscode.commands.registerCommand('envguard.openSettings', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'envguard');
    });

    // Register event listeners
    const onDidOpenTextDocument = vscode.workspace.onDidOpenTextDocument((document) => {
        if (envMaskingProvider.isEnvFile(document)) {
            envMaskingProvider.applyMasking(document);
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

    // Register sidebar provider
    vscode.window.registerTreeDataProvider('envguard', sidebarProvider);

    // Add all disposables to context
    context.subscriptions.push(
        toggleMaskingCommand,
        enableStreamingModeCommand,
        disableStreamingModeCommand,
        refreshPatternsCommand,
        openSettingsCommand,
        onDidOpenTextDocument,
        onDidChangeTextDocument,
        onDidChangeActiveTextEditor,
        onDidChangeConfiguration,
        statusBarProvider,
        envMaskingProvider,
        clipboardProtector
    );

    // Update status bar initially
    statusBarProvider.updateStatusBar();
}

export function deactivate() {
    console.log('EnvGuard extension is now deactivated');
}