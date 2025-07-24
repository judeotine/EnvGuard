import * as vscode from 'vscode';
import { SettingsManager } from '../managers/SettingsManager';

export class ClipboardProtector implements vscode.Disposable {
    private disposables: vscode.Disposable[] = [];

    constructor(private settingsManager: SettingsManager) {}

    public initialize(): void {
        // Monitor text selection and copying
        const onDidChangeTextEditorSelection = vscode.window.onDidChangeTextEditorSelection((event) => {
            this.handleSelectionChange(event);
        });

        this.disposables.push(onDidChangeTextEditorSelection);

        // Hook into copy commands
        const copyCommand = vscode.commands.registerCommand('envguard.interceptCopy', () => {
            this.handleCopyAttempt();
        });

        this.disposables.push(copyCommand);
    }

    private handleSelectionChange(event: vscode.TextEditorSelectionChangeEvent): void {
        const clipboardProtection = this.settingsManager.getSetting<boolean>('clipboardProtection', true);
        if (!clipboardProtection) {
            return;
        }

        const editor = event.textEditor;
        const document = editor.document;
        
        // Check if this is an .env file
        if (!this.isEnvFile(document)) {
            return;
        }

        // Check if selection contains sensitive values
        const selections = event.selections;
        for (const selection of selections) {
            if (this.containsSensitiveValue(document, selection)) {
                // Show warning but don't prevent selection
                this.showClipboardWarning();
                break;
            }
        }
    }

    private handleCopyAttempt(): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const clipboardProtection = this.settingsManager.getSetting<boolean>('clipboardProtection', true);
        if (!clipboardProtection) {
            // Execute normal copy
            vscode.commands.executeCommand('editor.action.clipboardCopyAction');
            return;
        }

        const document = editor.document;
        if (!this.isEnvFile(document)) {
            // Execute normal copy for non-env files
            vscode.commands.executeCommand('editor.action.clipboardCopyAction');
            return;
        }

        // Check if any selection contains sensitive values
        const hasSensitiveContent = editor.selections.some(selection => 
            this.containsSensitiveValue(document, selection)
        );

        if (hasSensitiveContent) {
            vscode.window.showWarningMessage(
                'EnvGuard: Clipboard protection is active. Sensitive values cannot be copied.',
                'Disable Protection',
                'Keep Protection'
            ).then(selection => {
                if (selection === 'Disable Protection') {
                    this.settingsManager.setSetting('clipboardProtection', false);
                    vscode.window.showInformationMessage('EnvGuard: Clipboard protection disabled');
                }
            });
        } else {
            // Safe to copy - no sensitive content
            vscode.commands.executeCommand('editor.action.clipboardCopyAction');
        }
    }

    private isEnvFile(document: vscode.TextDocument): boolean {
        const supportedExtensions = this.settingsManager.getSetting<string[]>('supportedFileExtensions', [
            '.env', '.env.local', '.env.development', '.env.production', '.env.staging', '.env.test'
        ]);

        const fileName = document.fileName.toLowerCase();
        return supportedExtensions.some(ext => fileName.endsWith(ext)) || 
               fileName.includes('.env');
    }

    private containsSensitiveValue(document: vscode.TextDocument, selection: vscode.Selection): boolean {
        const selectedText = document.getText(selection);
        const lines = selectedText.split('\n');

        return lines.some(line => {
            const match = line.match(/^([^#\s][^=]*?)=(.+)$/);
            if (match) {
                const [, key, value] = match;
                // Check if this key would be masked according to current settings
                return this.wouldBeMasked(key.trim());
            }
            return false;
        });
    }

    private wouldBeMasked(key: string): boolean {
        const whitelist = this.settingsManager.getSetting<string[]>('whitelist', []);
        const patterns = this.settingsManager.getSetting<string[]>('patterns', []);
        const maskAllValues = this.settingsManager.getSetting<boolean>('maskAllValues', false);

        // Check whitelist first
        if (whitelist.some(whiteKey => key.toUpperCase().includes(whiteKey.toUpperCase()))) {
            return false;
        }

        // If mask all values is enabled
        if (maskAllValues) {
            return true;
        }

        // Check patterns
        const upperKey = key.toUpperCase();
        return patterns.some(pattern => upperKey.includes(pattern.toUpperCase()));
    }

    private showClipboardWarning(): void {
        // Debounce warnings to avoid spam
        if (this.warningTimeout) {
            return;
        }

        vscode.window.showWarningMessage('EnvGuard: Selection contains sensitive values');
        
        this.warningTimeout = setTimeout(() => {
            this.warningTimeout = undefined;
        }, 2000);
    }

    private warningTimeout: NodeJS.Timeout | undefined;

    dispose(): void {
        this.disposables.forEach(d => d.dispose());
        if (this.warningTimeout) {
            clearTimeout(this.warningTimeout);
        }
    }
}