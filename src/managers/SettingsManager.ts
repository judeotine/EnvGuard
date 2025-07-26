import * as vscode from 'vscode';

export class SettingsManager {
    private configuration: vscode.WorkspaceConfiguration;

    constructor() {
        this.configuration = vscode.workspace.getConfiguration('envguard');
    }

    public getSetting<T>(key: string, defaultValue: T): T {
        return this.configuration.get<T>(key, defaultValue);
    }

    public async setSetting<T>(key: string, value: T, target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Workspace): Promise<void> {
        await this.configuration.update(key, value, target);
        this.refreshSettings();
    }
    
    // Alias for setSetting for backward compatibility
    public async updateSetting<T>(key: string, value: T, target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Workspace): Promise<void> {
        return this.setSetting(key, value, target);
    }

    public refreshSettings(): void {
        this.configuration = vscode.workspace.getConfiguration('envguard');
    }

    public getAllSettings() {
        return {
            enabled: this.getSetting<boolean>('enabled', true),
            maskStyle: this.getSetting<string>('maskStyle', 'dots'),
            patterns: this.getSetting<string[]>('patterns', []),
            whitelist: this.getSetting<string[]>('whitelist', []),
            maskAllValues: this.getSetting<boolean>('maskAllValues', false),
            autoMaskOnOpen: this.getSetting<boolean>('autoMaskOnOpen', true),
            hoverRevealDuration: this.getSetting<number>('hoverRevealDuration', 3),
            autoLockTimer: this.getSetting<number>('autoLockTimer', 5),
            clipboardProtection: this.getSetting<boolean>('clipboardProtection', true),
            supportedFileExtensions: this.getSetting<string[]>('supportedFileExtensions', [])
        };
    }
}