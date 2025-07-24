import * as vscode from 'vscode';
import { SettingsManager } from '../managers/SettingsManager';
import { PatternMatcher } from '../utils/PatternMatcher';

export class EnvMaskingProvider implements vscode.Disposable {
    private decorationType: vscode.TextEditorDecorationType | undefined;
    private blurDecorationType: vscode.TextEditorDecorationType | undefined;
    private isEnabled: boolean = true;
    private isStreamingMode: boolean = false;
    private autoLockTimer: NodeJS.Timeout | undefined;
    private debounceTimer: Map<string, NodeJS.Timeout> = new Map();

    constructor(
        private settingsManager: SettingsManager,
        private patternMatcher: PatternMatcher
    ) {
        this.createDecorationTypes();
        this.isEnabled = this.settingsManager.getSetting<boolean>('enabled', true);
        this.setupAutoLockTimer();
    }

    private createDecorationTypes() {
        const maskStyle = this.settingsManager.getSetting<string>('maskStyle', 'dots');
        
        let decorationOptions: vscode.DecorationRenderOptions;
        
        switch (maskStyle) {
            case 'asterisks':
                decorationOptions = {
                    after: {
                        contentText: '••••••••',
                        color: '#666',
                        fontWeight: 'bold'
                    },
                    textDecoration: 'none; opacity: 0;'
                };
                break;
            case 'dots':
                decorationOptions = {
                    after: {
                        contentText: '••••••••',
                        color: '#888',
                        fontWeight: 'normal'
                    },
                    textDecoration: 'none; opacity: 0;'
                };
                break;
            case 'blur':
                decorationOptions = {
                    textDecoration: 'none; filter: blur(4px); opacity: 0.3;'
                };
                break;
            default:
                decorationOptions = {
                    after: {
                        contentText: '••••••••',
                        color: '#888'
                    },
                    textDecoration: 'none; opacity: 0;'
                };
        }

        this.decorationType?.dispose();
        this.decorationType = vscode.window.createTextEditorDecorationType(decorationOptions);

        this.blurDecorationType?.dispose();
        this.blurDecorationType = vscode.window.createTextEditorDecorationType({
            textDecoration: 'none; filter: blur(4px); opacity: 0.3;'
        });
    }

    public isEnvFile(document: vscode.TextDocument): boolean {
        const supportedExtensions = this.settingsManager.getSetting<string[]>('supportedFileExtensions', [
            '.env', '.env.local', '.env.development', '.env.production', '.env.staging', '.env.test'
        ]);

        const fileName = document.fileName.toLowerCase();
        return supportedExtensions.some(ext => fileName.endsWith(ext)) || 
               fileName.includes('.env');
    }

    public applyMasking(document: vscode.TextDocument) {
        if (!this.isEnabled && !this.isStreamingMode) {
            this.clearDecorations(document);
            return;
        }

        const autoMaskOnOpen = this.settingsManager.getSetting<boolean>('autoMaskOnOpen', true);
        if (!autoMaskOnOpen && !this.isStreamingMode) {
            return;
        }

        const editor = vscode.window.visibleTextEditors.find(e => e.document === document);
        if (!editor) return;

        const decorations: vscode.DecorationOptions[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        lines.forEach((line, lineIndex) => {
            const match = line.match(/^([^#\s][^=]*?)=(.+)$/);
            if (match) {
                const [, key, value] = match;
                const trimmedKey = key.trim();
                
                if (this.shouldMaskValue(trimmedKey, value)) {
                    const valueStartIndex = line.indexOf('=') + 1;
                    const startPos = new vscode.Position(lineIndex, valueStartIndex);
                    const endPos = new vscode.Position(lineIndex, line.length);
                    
                    decorations.push({
                        range: new vscode.Range(startPos, endPos),
                        hoverMessage: this.getHoverMessage(trimmedKey, value)
                    });
                }
            }
        });

        const decorationType = this.settingsManager.getSetting<string>('maskStyle', 'dots') === 'blur' 
            ? this.blurDecorationType || this.decorationType
            : this.decorationType;
            
        if (decorationType) {
            editor.setDecorations(decorationType, decorations);
        }
    }

    private shouldMaskValue(key: string, value: string): boolean {
        const whitelist = this.settingsManager.getSetting<string[]>('whitelist', []);
        const maskAllValues = this.settingsManager.getSetting<boolean>('maskAllValues', false);
        
        // Check whitelist first
        if (whitelist.some(whiteKey => key.toUpperCase().includes(whiteKey.toUpperCase()))) {
            return false;
        }

        // If streaming mode is on, mask everything (except whitelisted)
        if (this.isStreamingMode) {
            return true;
        }

        // If mask all values is enabled
        if (maskAllValues) {
            return true;
        }

        // Use pattern matching
        return this.patternMatcher.shouldMask(key);
    }

    private getHoverMessage(key: string, value: string): vscode.MarkdownString | undefined {
        const hoverRevealDuration = this.settingsManager.getSetting<number>('hoverRevealDuration', 3);
        
        if (hoverRevealDuration === 0 || this.isStreamingMode) {
            return new vscode.MarkdownString(`**${key}**: *[Protected by EnvGuard]*`);
        }

        return new vscode.MarkdownString(
            `**${key}**: \`${value}\`\n\n*Value will be masked again in ${hoverRevealDuration} seconds*`
        );
    }

    public debouncedApplyMasking(document: vscode.TextDocument) {
        const uri = document.uri.toString();
        
        // Clear existing timer for this document
        const existingTimer = this.debounceTimer.get(uri);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        // Set new timer
        const timer = setTimeout(() => {
            this.applyMasking(document);
            this.debounceTimer.delete(uri);
        }, 300);

        this.debounceTimer.set(uri, timer);
    }

    private clearDecorations(document: vscode.TextDocument) {
        const editor = vscode.window.visibleTextEditors.find(e => e.document === document);
        if (editor && this.decorationType && this.blurDecorationType) {
            editor.setDecorations(this.decorationType, []);
            editor.setDecorations(this.blurDecorationType, []);
        }
    }

    public toggleMasking() {
        this.isEnabled = !this.isEnabled;
        this.refreshAllDecorations();
        this.resetAutoLockTimer();
    }

    public enableStreamingMode() {
        this.isStreamingMode = true;
        this.refreshAllDecorations();
    }

    public disableStreamingMode() {
        this.isStreamingMode = false;
        this.refreshAllDecorations();
    }

    public refreshAllDecorations() {
        // Recreate decoration types with current settings
        this.createDecorationTypes();
        
        // Apply to all open .env files
        vscode.workspace.textDocuments.forEach(document => {
            if (this.isEnvFile(document)) {
                try {
                    this.applyMasking(document);
                } catch (error) {
                    console.warn('EnvGuard: Failed to apply masking to document:', error);
                }
            }
        });
    }

    private setupAutoLockTimer() {
        const autoLockTimer = this.settingsManager.getSetting<number>('autoLockTimer', 5);
        if (autoLockTimer > 0) {
            this.resetAutoLockTimer();
        }
    }

    private resetAutoLockTimer() {
        if (this.autoLockTimer) {
            clearTimeout(this.autoLockTimer);
        }

        const autoLockTimer = this.settingsManager.getSetting<number>('autoLockTimer', 5);
        if (autoLockTimer > 0) {
            this.autoLockTimer = setTimeout(() => {
                if (!this.isEnabled) {
                    this.isEnabled = true;
                    this.refreshAllDecorations();
                    vscode.window.showInformationMessage('EnvGuard: Auto-lock activated - secrets are now masked');
                }
            }, autoLockTimer * 60 * 1000);
        }
    }

    public getStatus(): { enabled: boolean; streamingMode: boolean } {
        return {
            enabled: this.isEnabled || this.isStreamingMode,
            streamingMode: this.isStreamingMode
        };
    }

    dispose() {
        this.decorationType?.dispose();
        this.blurDecorationType?.dispose();
        if (this.autoLockTimer) {
            clearTimeout(this.autoLockTimer);
        }
        this.debounceTimer.forEach(timer => clearTimeout(timer));
        this.debounceTimer.clear();
    }
}