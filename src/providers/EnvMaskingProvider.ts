import * as vscode from 'vscode';
import { SettingsManager } from '../managers/SettingsManager';
import { PatternMatcher } from '../utils/PatternMatcher';
import { StatsTracker } from '../utils/StatsTracker';

export class EnvMaskingProvider implements vscode.Disposable {
    private asterisksDecorationType: vscode.TextEditorDecorationType | undefined;
    private dotsDecorationType: vscode.TextEditorDecorationType | undefined;
    private blurDecorationType: vscode.TextEditorDecorationType | undefined;
    private isEnabled: boolean = true;
    private isStreamingMode: boolean = false;
    private autoLockTimer: NodeJS.Timeout | undefined;
    private statsTracker: StatsTracker;
    private debounceTimer: Map<string, NodeJS.Timeout> = new Map();

    constructor(
        private settingsManager: SettingsManager,
        private patternMatcher: PatternMatcher
    ) {
        this.createDecorationTypes();
        this.isEnabled = this.settingsManager.getSetting<boolean>('enabled', true);
        this.statsTracker = new StatsTracker();
        this.setupAutoLockTimer();
    }

    public createDecorationTypes() {
    // Only create once
    if (!this.asterisksDecorationType) {
        this.asterisksDecorationType = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: '********',
                color: '#666',
                fontWeight: 'bold',
                margin: '0 0 0 2px'
            },
            textDecoration: 'none; opacity: 0;'
        });
    }
    if (!this.dotsDecorationType) {
        this.dotsDecorationType = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: '••••••••',
                color: '#888',
                fontStyle: 'normal',
                margin: '0 0 0 2px'
            },
            textDecoration: 'none; opacity: 0;'
        });
    }
    if (!this.blurDecorationType) {
        this.blurDecorationType = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: '••••••••',
                color: 'rgba(136, 136, 136, 0.8)',
                backgroundColor: 'rgba(128, 128, 128, 0.2)',
                fontStyle: 'normal',
                margin: '0 0 0 2px'
            },
            textDecoration: 'none; opacity: 0;'
        });
    }
}

    private disposeDecorationTypes() {
    this.asterisksDecorationType?.dispose();
    this.asterisksDecorationType = undefined;
    this.dotsDecorationType?.dispose();
    this.dotsDecorationType = undefined;
    this.blurDecorationType?.dispose();
    this.blurDecorationType = undefined;
}

    public isEnvFile(document: vscode.TextDocument): boolean {
        const supportedExtensions = this.settingsManager.getSetting<string[]>('supportedFileExtensions', [
            '.env', '.env.local', '.env.development', '.env.production', '.env.staging', '.env.test'
        ]);

        const fileName = document.fileName.toLowerCase();
        return supportedExtensions.some(ext => fileName.endsWith(ext)) || 
               fileName.includes('.env');
    }

    public getStats() {
        return this.statsTracker.getStats();
    }

    public resetStats() {
        this.statsTracker.reset();
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

        // Track this file in our stats
        this.statsTracker.trackFile(document.uri.fsPath);

        const text = document.getText();
        const lines = text.split('\n');
        let secretsMaskedInFile = 0;

        // --- Atomic, synchronous masking logic ---
        // Collect all mask ranges and mask values
        const maskStyle = this.settingsManager.getSetting<string>('maskStyle', 'dots');
        const maskDecorations: vscode.DecorationOptions[] = [];
        lines.forEach((line, lineIndex) => {
            const match = line.match(/^([^#\s][^=]*?)=(.+)$/);
            if (match) {
                const [, key, value] = match;
                const trimmedKey = key.trim();
                if (this.shouldMaskValue(trimmedKey, value) && match.index !== undefined) {
                    // Calculate position right after the '=' character
                    const equalsPosition = line.indexOf('=');
                    const startPos = new vscode.Position(lineIndex, equalsPosition + 1);
                    const endPos = new vscode.Position(lineIndex, line.length);

                    // Determine masking content
                    let maskContent = '';
                    if (maskStyle === 'asterisks') {
                        maskContent = '*'.repeat(value.length);
                    } else if (maskStyle === 'dots' || maskStyle === 'blur') {
                        maskContent = '•'.repeat(value.length);
                    }

                    maskDecorations.push({
                        range: new vscode.Range(startPos, endPos),
                        hoverMessage: this.getHoverMessage(trimmedKey, value),
                        renderOptions: {
                            after: {
                                contentText: maskContent
                            }
                        }
                    });
                    secretsMaskedInFile++;
                }
            }
        });

        // Always clear all decoration types first (atomic update)
        if (this.asterisksDecorationType) editor.setDecorations(this.asterisksDecorationType, []);
        if (this.dotsDecorationType) editor.setDecorations(this.dotsDecorationType, []);
        if (this.blurDecorationType) editor.setDecorations(this.blurDecorationType, []);

        // Apply only the selected style
        let decorationType: vscode.TextEditorDecorationType | undefined = undefined;
        if (maskStyle === 'blur' && this.blurDecorationType) {
            decorationType = this.blurDecorationType;
        } else if (maskStyle === 'asterisks' && this.asterisksDecorationType) {
            decorationType = this.asterisksDecorationType;
        } else if (this.dotsDecorationType) {
            decorationType = this.dotsDecorationType;
        }
        if (decorationType) {
            editor.setDecorations(decorationType, maskDecorations);
        }
        // Update statistics for this file
        if (secretsMaskedInFile > 0) {
            this.statsTracker.trackSecrets(document.uri.fsPath, secretsMaskedInFile);
        }
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
        if (!editor) return;
        if (this.asterisksDecorationType) editor.setDecorations(this.asterisksDecorationType, []);
        if (this.dotsDecorationType) editor.setDecorations(this.dotsDecorationType, []);
        if (this.blurDecorationType) editor.setDecorations(this.blurDecorationType, []);
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
        
        // Reset stats since we're going to recount everything
        this.statsTracker.reset();
        
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
        this.asterisksDecorationType?.dispose();
        this.dotsDecorationType?.dispose();
        this.blurDecorationType?.dispose();
        if (this.autoLockTimer) {
            clearTimeout(this.autoLockTimer);
        }
        this.debounceTimer.forEach(timer => clearTimeout(timer));
        this.debounceTimer.clear();
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
}