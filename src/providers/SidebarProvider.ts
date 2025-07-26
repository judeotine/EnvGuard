import * as vscode from 'vscode';
import { EnvMaskingProvider } from './EnvMaskingProvider';
import { SettingsManager } from '../managers/SettingsManager';

// Type definitions for better type safety
interface MaskingStatus {
    enabled: boolean;
    streamingMode: boolean;
}

interface MaskingStats {
    protectedFilesCount: number;
    secretsMaskedCount: number;
    lastScanTime: string;
}

// More specific message types for better type safety
type ToggleMessage = 
    | { command: 'toggleMasking'; value: boolean }
    | { command: 'toggleStreamingMode'; value: boolean };

type StyleMessage = { command: 'updateMaskStyle'; style: string };

type ActionMessage = 
    | { command: 'scanWorkspace' }
    | { command: 'refreshPatterns' }
    | { command: 'exportConfig' }
    | { command: 'importConfig' }
    | { command: 'openSettings' }
    | { command: 'getStatus' };

type WebviewMessage = ToggleMessage | StyleMessage | ActionMessage;

type WebviewUpdate = 
    | { command: 'updateStatus'; status: MaskingStatus; maskStyle: string }
    | { command: 'updateStats'; stats: MaskingStats }
    | { command: 'showMessage'; type: 'info' | 'error'; message: string };

// Type guards for better message handling
function isToggleCommand(message: WebviewMessage): message is ToggleMessage {
    return (message.command === 'toggleMasking' || message.command === 'toggleStreamingMode') && 
           'value' in message && typeof message.value === 'boolean';
}

function isStyleCommand(message: WebviewMessage): message is StyleMessage {
    return message.command === 'updateMaskStyle' && 'style' in message && typeof message.style === 'string';
}

function isActionCommand(message: WebviewMessage): message is ActionMessage {
    return ['scanWorkspace', 'refreshPatterns', 'exportConfig', 'importConfig', 'openSettings', 'getStatus']
        .includes(message.command);
}

export class SidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'envguard.view';
    
    private _view?: vscode.WebviewView;
    private readonly disposables: vscode.Disposable[] = [];

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly envMaskingProvider: EnvMaskingProvider,
        private readonly settingsManager: SettingsManager
    ) {
        // Listen for configuration changes
        this.disposables.push(
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('envguard')) {
                    this.updateWebviewContent();
                }
            })
        );
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        console.log('Resolving webview...');
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri]
        };

        // Set up message handling
        this.disposables.push(
            webviewView.webview.onDidReceiveMessage((message: WebviewMessage) => {
                console.log('Received message from webview:', message);
                this.handleWebviewMessage(message);
            })
        );

        // Clean up when webview is disposed
        webviewView.onDidDispose(() => {
            console.log('Webview disposed');
            this.dispose();
        });

        // Initialize webview content first, then send initial state
        try {
            console.log('Updating webview content...');
            this.updateWebviewContent();
            // Give webview a moment to load before sending initial state
            setTimeout(() => {
                console.log('Sending initial state...');
                this.sendInitialState();
            }, 300); // Increased timeout to ensure webview is ready
        } catch (error) {
            console.error('Error initializing webview:', error);
            // Fallback: try to set a minimal HTML content
            this.setFallbackContent();
        }
    }

    public refresh(): void {
        this.updateWebviewContent();
        this.updateStats();
    }

    private sendInitialState(): void {
        if (!this._view) {
            console.warn('Cannot send initial state: Webview not available');
            return;
        }

        try {
            console.log('Getting initial status...');
            const status = this.safeGetStatus();
            console.log('Current status:', status);
            
            const maskStyle = this.settingsManager.getSetting<string>('maskStyle', 'dots');
            console.log('Current mask style:', maskStyle);

            console.log('Posting updateStatus message...');
            this.postMessage({
                command: 'updateStatus',
                status,
                maskStyle
            });

            console.log('Updating stats...');
            this.updateStats();
        } catch (error) {
            console.error('Error in sendInitialState:', error);
            this.postMessage({
                command: 'showMessage',
                type: 'error',
                message: 'Failed to initialize sidebar: ' + (error instanceof Error ? error.message : String(error))
            });
        }
    }

    private updateStats(): void {
        if (!this._view) return;
        
        const stats = this.safeGetStats();
        this.postMessage({
            command: 'updateStats',
            stats
        });
    }

    private postMessage(message: WebviewUpdate): void {
        this._view?.webview.postMessage(message);
    }

    private updateWebviewContent(): void {
        if (!this._view) {
            console.warn('Webview not available');
            return;
        }

        try {
            const status = this.safeGetStatus();
            const maskStyle = this.settingsManager?.getSetting<string>('maskStyle', 'dots') || 'dots';
            const version = this.context.extension?.packageJSON?.version || '1.0.0';

            console.log('Updating webview content with:', { status, maskStyle, version });
            this._view.webview.html = this.getWebviewContent(status, maskStyle, version);
        } catch (error) {
            console.error('Error updating webview content:', error);
            this.setFallbackContent();
        }
    }

    private setFallbackContent(): void {
        if (!this._view) return;
        
        const nonce = this.getNonce();
        this._view.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EnvGuard</title>
    <style nonce="${nonce}">
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-foreground);
            text-align: center;
        }
        .loading {
            margin: 20px 0;
        }
        .error {
            color: var(--vscode-errorForeground);
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <h2>EnvGuard</h2>
    <div class="loading">Loading extension...</div>
    <div class="error">If this message persists, please check the extension logs.</div>
    <script nonce="${nonce}">
        console.log('EnvGuard webview fallback loaded');
        // Try to request status after a delay
        setTimeout(() => {
            const vscode = acquireVsCodeApi();
            vscode.postMessage({ command: 'getStatus' });
        }, 1000);
    </script>
</body>
</html>`;
    }

    private getWebviewContent(status: MaskingStatus, maskStyle: string, version: string): string {
        if (!this._view) {
            throw new Error('Webview not available');
        }

        const nonce = this.getNonce();
        const cspSource = this._view.webview.cspSource;
        const statusClass = this.getStatusClass(status);
        const statusText = this.getStatusText(status);

        console.log('Generating webview content with:', { statusClass, statusText, maskStyle, version });

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EnvGuard</title>
    <style nonce="${nonce}">
        :root {
            --primary: var(--vscode-button-background);
            --primary-hover: var(--vscode-button-hoverBackground);
            --text: var(--vscode-foreground);
            --bg: var(--vscode-editor-background);
            --bg-panel: var(--vscode-sideBar-background);
            --border: var(--vscode-widget-border, #454545);
            --success: #28a745;
            --warning: #ffc107;
            --danger: #dc3545;
        }
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: var(--vscode-font-family);
            padding: 0;
            margin: 0;
            color: var(--text);
            background-color: var(--bg);
            font-size: 13px;
            line-height: 1.4;
        }
        
        .container {
            padding: 12px;
        }
        
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--border);
        }
        
        .header h2 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
        }
        
        .version {
            font-size: 11px;
            opacity: 0.7;
        }
        
        .card {
            background-color: var(--bg-panel);
            border: 1px solid var(--border);
            border-radius: 6px;
            margin-bottom: 12px;
            overflow: hidden;
        }
        
        .card-header {
            padding: 10px 12px;
            font-weight: 600;
            font-size: 12px;
            background-color: var(--vscode-tab-activeBackground);
            border-bottom: 1px solid var(--border);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .card-content {
            padding: 12px;
        }
        
        .status-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
        }
        
        .status-active .status-dot {
            background-color: var(--success);
        }
        
        .status-inactive .status-dot {
            background-color: var(--danger);
        }
        
        .status-streaming .status-dot {
            background-color: var(--warning);
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .toggle-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 12px 0;
            padding: 8px 0;
        }
        
        .toggle-info {
            flex: 1;
        }
        
        .toggle-title {
            font-weight: 500;
            margin-bottom: 2px;
        }
        
        .toggle-description {
            font-size: 11px;
            opacity: 0.7;
            line-height: 1.3;
        }
        
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
            flex-shrink: 0;
        }
        
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--vscode-input-background);
            border: 1px solid var(--border);
            transition: 0.3s;
            border-radius: 12px;
        }
        
        .toggle-slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 2px;
            bottom: 2px;
            background-color: var(--text);
            transition: 0.3s;
            border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
            background-color: var(--primary);
            border-color: var(--primary);
        }
        
        input:checked + .toggle-slider:before {
            transform: translateX(20px);
            background-color: white;
        }
        
        .btn {
            display: block;
            width: 100%;
            padding: 8px 12px;
            margin: 6px 0;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: background-color 0.2s;
        }
        
        .btn:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        .btn:active {
            transform: translateY(1px);
        }
        
        .form-group {
            margin: 12px 0;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 4px;
            font-weight: 500;
            font-size: 12px;
        }
        
        .form-control {
            width: 100%;
            padding: 6px 8px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--border);
            border-radius: 3px;
            font-size: 12px;
        }
        
        .stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin: 12px 0;
        }
        
        .stat-item {
            text-align: center;
            padding: 8px;
            background-color: var(--vscode-input-background);
            border-radius: 4px;
        }
        
        .stat-value {
            font-size: 18px;
            font-weight: 600;
            color: var(--primary);
        }
        
        .stat-label {
            font-size: 10px;
            opacity: 0.7;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
        }
        
        .divider {
            height: 1px;
            background-color: var(--border);
            margin: 12px 0;
        }
        
        .footer {
            text-align: center;
            font-size: 10px;
            opacity: 0.5;
            padding: 12px;
            border-top: 1px solid var(--border);
        }
        
        .last-scan {
            text-align: center;
            font-size: 10px;
            opacity: 0.6;
            margin-top: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>EnvGuard</h2>
            <span class="version">v${version}</span>
        </div>
        
        <!-- Status Card -->
        <div class="card">
            <div class="card-header">Status</div>
            <div class="card-content">
                <div id="statusIndicator" class="status-indicator ${statusClass}">
                    <div class="status-dot"></div>
                    <span id="statusText">${statusText}</span>
                </div>
            </div>
        </div>
        
        <!-- Controls Card -->
        <div class="card">
            <div class="card-header">Controls</div>
            <div class="card-content">
                <div class="toggle-row">
                    <div class="toggle-info">
                        <div class="toggle-title">Mask Sensitive Data</div>
                        <div class="toggle-description">Hide sensitive values in .env files</div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="maskingToggle" ${status.enabled ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                
                <div class="toggle-row">
                    <div class="toggle-info">
                        <div class="toggle-title">Streaming Mode</div>
                        <div class="toggle-description">Monitor and mask new values continuously</div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="streamingToggle" ${status.streamingMode ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
        </div>
        
        <!-- Settings Card -->
        <div class="card">
            <div class="card-header">Settings</div>
            <div class="card-content">
                <div class="form-group">
                    <label for="maskStyleSelect">Masking Style</label>
                    <select id="maskStyleSelect" class="form-control">
                        <option value="dots" ${maskStyle === 'dots' ? 'selected' : ''}>Dots (•••••)</option>
                        <option value="asterisks" ${maskStyle === 'asterisks' ? 'selected' : ''}>Asterisks (*****)</option>
                        <option value="blur" ${maskStyle === 'blur' ? 'selected' : ''}>Blur Effect</option>
                    </select>
                </div>
                
                <button class="btn" id="openSettingsBtn">Open Extension Settings</button>
            </div>
        </div>
        
        <!-- Actions Card -->
        <div class="card">
            <div class="card-header">Quick Actions</div>
            <div class="card-content">
                <button class="btn" id="scanWorkspaceBtn">Scan Workspace</button>
                <button class="btn" id="refreshPatternsBtn">Refresh Patterns</button>
                <button class="btn" id="exportConfigBtn">Export Configuration</button>
                <button class="btn" id="importConfigBtn">Import Configuration</button>
            </div>
        </div>
        
        <!-- Statistics Card -->
        <div class="card">
            <div class="card-header">Statistics</div>
            <div class="card-content">
                <div class="stats">
                    <div class="stat-item">
                        <div id="protectedFilesCount" class="stat-value">0</div>
                        <div class="stat-label">Protected Files</div>
                    </div>
                    <div class="stat-item">
                        <div id="secretsMaskedCount" class="stat-value">0</div>
                        <div class="stat-label">Secrets Masked</div>
                    </div>
                </div>
                <div class="divider"></div>
                <div id="lastScanTime" class="last-scan">Last scan: Never</div>
            </div>
        </div>
    </div>
    
    <div class="footer">
        EnvGuard • Protecting your environment variables
    </div>
    
    <script nonce="${nonce}">
        (function() {
            console.log('EnvGuard webview script loaded');
            
            const vscode = acquireVsCodeApi();
            
            // Utility functions
            function getStatusClass(status) {
                if (status.streamingMode) return 'status-streaming';
                return status.enabled ? 'status-active' : 'status-inactive';
            }
            
            function getStatusText(status) {
                if (status.streamingMode) return 'Streaming Mode Active';
                return status.enabled ? 'Protection Active' : 'Protection Inactive';
            }
            
            function updateStatus(status, maskStyle) {
                console.log('Updating status:', status, maskStyle);
                
                const statusIndicator = document.getElementById('statusIndicator');
                const statusText = document.getElementById('statusText');
                const maskingToggle = document.getElementById('maskingToggle');
                const streamingToggle = document.getElementById('streamingToggle');
                const maskStyleSelect = document.getElementById('maskStyleSelect');
                
                if (statusIndicator && statusText) {
                    statusIndicator.className = 'status-indicator ' + getStatusClass(status);
                    statusText.textContent = getStatusText(status);
                }
                
                if (maskingToggle) maskingToggle.checked = status.enabled;
                if (streamingToggle) streamingToggle.checked = status.streamingMode;
                if (maskStyleSelect) maskStyleSelect.value = maskStyle;
            }
            
            function updateStats(stats) {
                console.log('Updating stats:', stats);
                
                const protectedFiles = document.getElementById('protectedFilesCount');
                const secretsMasked = document.getElementById('secretsMaskedCount');
                const lastScan = document.getElementById('lastScanTime');
                
                if (protectedFiles) protectedFiles.textContent = stats.protectedFilesCount || 0;
                if (secretsMasked) secretsMasked.textContent = stats.secretsMaskedCount || 0;
                if (lastScan) lastScan.textContent = 'Last scan: ' + (stats.lastScanTime || 'Never');
            }
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeEventListeners);
            } else {
                initializeEventListeners();
            }
            
            function initializeEventListeners() {
                console.log('Initializing event listeners');
                
                // Toggle event listeners
                const maskingToggle = document.getElementById('maskingToggle');
                const streamingToggle = document.getElementById('streamingToggle');
                const maskStyleSelect = document.getElementById('maskStyleSelect');
                
                if (maskingToggle) {
                    maskingToggle.addEventListener('change', (e) => {
                        vscode.postMessage({
                            command: 'toggleMasking',
                            value: e.target.checked
                        });
                    });
                }
                
                if (streamingToggle) {
                    streamingToggle.addEventListener('change', (e) => {
                        vscode.postMessage({
                            command: 'toggleStreamingMode',
                            value: e.target.checked
                        });
                    });
                }
                
                if (maskStyleSelect) {
                    maskStyleSelect.addEventListener('change', (e) => {
                        vscode.postMessage({
                            command: 'updateMaskStyle',
                            style: e.target.value
                        });
                    });
                }
                
                // Button event listeners
                const buttons = [
                    { id: 'openSettingsBtn', command: 'openSettings' },
                    { id: 'scanWorkspaceBtn', command: 'scanWorkspace' },
                    { id: 'refreshPatternsBtn', command: 'refreshPatterns' },
                    { id: 'exportConfigBtn', command: 'exportConfig' },
                    { id: 'importConfigBtn', command: 'importConfig' }
                ];
                
                buttons.forEach(({ id, command }) => {
                    const button = document.getElementById(id);
                    if (button) {
                        button.addEventListener('click', () => {
                            vscode.postMessage({ command });
                        });
                    }
                });
                
                // Request initial status
                console.log('Requesting initial status');
                vscode.postMessage({ command: 'getStatus' });
            }
            
            // Handle messages from extension
            window.addEventListener('message', (event) => {
                const message = event.data;
                console.log('Received message:', message);
                
                switch (message.command) {
                    case 'updateStatus':
                        updateStatus(message.status, message.maskStyle);
                        break;
                    case 'updateStats':
                        updateStats(message.stats);
                        break;
                    case 'showMessage':
                        console.log(\`\${message.type}: \${message.message}\`);
                        break;
                    default:
                        console.log('Unknown message:', message);
                }
            });
            
        })();
    </script>
</body>
</html>`;
    }

    private getStatusClass(status: MaskingStatus): string {
        if (status.streamingMode) return 'status-streaming';
        return status.enabled ? 'status-active' : 'status-inactive';
    }

    private getStatusText(status: MaskingStatus): string {
        if (status.streamingMode) return 'Streaming Mode Active';
        return status.enabled ? 'Protection Active' : 'Protection Inactive';
    }

    private handleWebviewMessage(message: WebviewMessage): void {
        try {
            if (isToggleCommand(message)) {
                this.handleToggleCommand(message);
            } else if (isStyleCommand(message)) {
                this.handleStyleCommand(message);
            } else if (isActionCommand(message)) {
                this.handleActionCommand(message);
            } else {
                // This should never happen with proper typing, but just in case
                console.warn('Unknown message type received:', message);
            }
        } catch (error) {
            console.error('Error handling webview message:', error);
            vscode.window.showErrorMessage(
                `EnvGuard: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
            );
        }
    }

    private handleToggleCommand(message: ToggleMessage): void {
        switch (message.command) {
            case 'toggleMasking':
                if (message.value) {
                    this.safeCallProviderMethod('enable');
                } else {
                    this.safeCallProviderMethod('disable');
                }
                break;
            case 'toggleStreamingMode':
                this.safeCallProviderMethod('setStreamingMode', message.value);
                break;
        }
        
        // Update webview with new status
        this.sendInitialState();
    }

    private handleStyleCommand(message: StyleMessage): void {
        try {
            this.settingsManager.setSetting('maskStyle', message.style);
            // Safely call updateMaskStyle if it exists
            this.safeCallProviderMethod('updateMaskStyle', message.style);
            this.sendInitialState();
        } catch (error) {
            console.error('Error updating mask style:', error);
            vscode.window.showErrorMessage('Failed to update mask style');
        }
    }

    private async handleActionCommand(message: ActionMessage): Promise<void> {
        switch (message.command) {
            case 'scanWorkspace':
                try {
                    await vscode.commands.executeCommand('envguard.scanWorkspace');
                    this.updateStats();
                    vscode.window.showInformationMessage('Workspace scan completed');
                } catch (error) {
                    console.error('Error scanning workspace:', error);
                    vscode.window.showErrorMessage('Failed to scan workspace');
                }
                break;

            case 'refreshPatterns':
                try {
                    await vscode.commands.executeCommand('envguard.refreshPatterns');
                    vscode.window.showInformationMessage('Patterns refreshed');
                } catch (error) {
                    console.error('Error refreshing patterns:', error);
                    vscode.window.showErrorMessage('Failed to refresh patterns');
                }
                break;

            case 'exportConfig':
                try {
                    await vscode.commands.executeCommand('envguard.exportConfig');
                } catch (error) {
                    console.error('Error exporting config:', error);
                    vscode.window.showErrorMessage('Failed to export configuration');
                }
                break;

            case 'importConfig':
                try {
                    await vscode.commands.executeCommand('envguard.importConfig');
                    this.updateStats();
                } catch (error) {
                    console.error('Error importing config:', error);
                    vscode.window.showErrorMessage('Failed to import configuration');
                }
                break;

            case 'openSettings':
                try {
                    await vscode.commands.executeCommand('workbench.action.openSettings', 'envguard');
                } catch (error) {
                    console.error('Error opening settings:', error);
                    vscode.window.showErrorMessage('Failed to open settings');
                }
                break;

            case 'getStatus':
                this.sendInitialState();
                break;

            default:
                // Type-safe exhaustive check
                const _exhaustiveCheck: never = message;
                console.warn('Unknown command received:', _exhaustiveCheck);
        }
    }

    private getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    private dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this._view = undefined;
    }

    // Additional helper methods for proper error handling and type safety
    private safeGetStats(): MaskingStats {
        try {
            const stats = this.envMaskingProvider.getStats();
            // Ensure we return an object that matches MaskingStats interface
            return {
                protectedFilesCount: stats?.protectedFilesCount || 0,
                secretsMaskedCount: stats?.secretsMaskedCount || 0,
                lastScanTime: stats?.lastScanTime 
                    ? (typeof stats.lastScanTime === 'number' 
                        ? new Date(stats.lastScanTime).toLocaleString() 
                        : String(stats.lastScanTime))
                    : 'Never'
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            return {
                protectedFilesCount: 0,
                secretsMaskedCount: 0,
                lastScanTime: 'Error retrieving data'
            };
        }
    }

    private safeGetStatus(): MaskingStatus {
        try {
            return this.envMaskingProvider.getStatus();
        } catch (error) {
            console.error('Error getting status:', error);
            return {
                enabled: false,
                streamingMode: false
            };
        }
    }

    // Method to handle potential missing methods in envMaskingProvider
    private safeCallProviderMethod(methodName: string, ...args: any[]): boolean {
        try {
            const method = (this.envMaskingProvider as any)[methodName];
            if (typeof method === 'function') {
                method.apply(this.envMaskingProvider, args);
                return true;
            } else {
                console.warn(`Method ${methodName} not found in EnvMaskingProvider`);
                return false;
            }
        } catch (error) {
            console.error(`Error calling ${methodName}:`, error);
            return false;
        }
    }
}