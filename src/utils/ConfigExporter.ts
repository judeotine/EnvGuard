import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SettingsManager } from '../managers/SettingsManager';

export class ConfigExporter {
    constructor(private settingsManager: SettingsManager) {}

    /**
     * Export the current configuration to a file
     */
    public async exportConfig(): Promise<void> {
        try {
            // Get the current workspace folder
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                throw new Error('No workspace folder is open');
            }

            // Prepare the configuration data
            const config = {
                version: '1.0',
                settings: {
                    patterns: this.settingsManager.getSetting<string[]>('patterns', []),
                    whitelist: this.settingsManager.getSetting<string[]>('whitelist', []),
                    maskStyle: this.settingsManager.getSetting<string>('maskStyle', 'dots'),
                    autoMaskOnOpen: this.settingsManager.getSetting<boolean>('autoMaskOnOpen', true),
                    hoverRevealDuration: this.settingsManager.getSetting<number>('hoverRevealDuration', 3),
                    autoLockTimer: this.settingsManager.getSetting<number>('autoLockTimer', 5)
                },
                metadata: {
                    exportedAt: new Date().toISOString(),
                    extensionVersion: vscode.extensions.getExtension('jude-otine.envguard')?.packageJSON.version || 'unknown'
                }
            };

            // Show save dialog
            const configJson = JSON.stringify(config, null, 2);
            const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file(path.join(workspaceFolders[0].uri.fsPath, 'envguard-config.json')),
                filters: {
                    'JSON': ['json']
                },
                saveLabel: 'Export Configuration'
            });

            if (uri) {
                await fs.promises.writeFile(uri.fsPath, configJson, 'utf8');
                vscode.window.showInformationMessage(`Configuration exported to ${path.basename(uri.fsPath)}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            vscode.window.showErrorMessage(`Failed to export configuration: ${errorMessage}`);
            console.error('Export configuration error:', error);
        }
    }

    /**
     * Import configuration from a file
     */
    public async importConfig(): Promise<void> {
        try {
            // Show open dialog
            const uri = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                filters: {
                    'JSON': ['json']
                },
                openLabel: 'Import Configuration'
            });

            if (uri && uri[0]) {
                // Read the file
                const fileContent = await fs.promises.readFile(uri[0].fsPath, 'utf8');
                const config = JSON.parse(fileContent);

                // Validate the configuration
                if (!config.settings) {
                    throw new Error('Invalid configuration file: missing settings');
                }

                // Update settings
                await this.settingsManager.updateSetting('patterns', config.settings.patterns || []);
                await this.settingsManager.updateSetting('whitelist', config.settings.whitelist || []);
                await this.settingsManager.updateSetting('maskStyle', config.settings.maskStyle || 'dots');
                await this.settingsManager.updateSetting('autoMaskOnOpen', config.settings.autoMaskOnOpen !== false);
                await this.settingsManager.updateSetting('hoverRevealDuration', config.settings.hoverRevealDuration || 3);
                await this.settingsManager.updateSetting('autoLockTimer', config.settings.autoLockTimer || 5);

                vscode.window.showInformationMessage('Configuration imported successfully');
                
                // Refresh the UI
                vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            vscode.window.showErrorMessage(`Failed to import configuration: ${errorMessage}`);
            console.error('Import configuration error:', error);
        }
    }
}
