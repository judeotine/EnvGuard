import * as vscode from 'vscode';
import { EnvMaskingProvider } from './EnvMaskingProvider';
import { SettingsManager } from '../managers/SettingsManager';

export class SidebarProvider implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(
        private context: vscode.ExtensionContext,
        private envMaskingProvider: EnvMaskingProvider,
        private settingsManager: SettingsManager
    ) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TreeItem): TreeItem[] {
        if (!element) {
            return this.getRootItems();
        }
        return [];
    }

    private getRootItems(): TreeItem[] {
        const status = this.envMaskingProvider.getStatus();
        const items: TreeItem[] = [];

        // Status section
        items.push(new TreeItem(
            status.streamingMode ? 'Status: Streaming Mode' : 
            status.enabled ? 'Status: Active' : 'Status: Inactive',
            vscode.TreeItemCollapsibleState.None,
            status.streamingMode ? 'streaming' : status.enabled ? 'active' : 'inactive'
        ));

        // Quick actions
        items.push(new TreeItem(
            'Toggle Masking',
            vscode.TreeItemCollapsibleState.None,
            'toggle',
            {
                command: 'envguard.toggleMasking',
                title: 'Toggle Masking'
            }
        ));

        if (!status.streamingMode) {
            items.push(new TreeItem(
                'Enable Streaming Mode',
                vscode.TreeItemCollapsibleState.None,
                'streaming-enable',
                {
                    command: 'envguard.enableStreamingMode',
                    title: 'Enable Streaming Mode'
                }
            ));
        } else {
            items.push(new TreeItem(
                'Disable Streaming Mode',
                vscode.TreeItemCollapsibleState.None,
                'streaming-disable',
                {
                    command: 'envguard.disableStreamingMode',
                    title: 'Disable Streaming Mode'
                }
            ));
        }

        // Settings
        items.push(new TreeItem(
            'Open Settings',
            vscode.TreeItemCollapsibleState.None,
            'settings',
            {
                command: 'envguard.openSettings',
                title: 'Open Settings'
            }
        ));

        // Current configuration preview
        const maskStyle = this.settingsManager.getSetting<string>('maskStyle', 'dots');
        const patterns = this.settingsManager.getSetting<string[]>('patterns', []);
        
        items.push(new TreeItem(
            `Mask Style: ${maskStyle}`,
            vscode.TreeItemCollapsibleState.None,
            'info'
        ));

        items.push(new TreeItem(
            `Patterns: ${patterns.length} active`,
            vscode.TreeItemCollapsibleState.None,
            'info'
        ));

        return items;
    }
}

class TreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        private readonly type: string,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        
        this.tooltip = this.label;
        this.contextValue = type;
        
        // Set icons based on type
        switch (type) {
            case 'active':
                this.iconPath = new vscode.ThemeIcon('shield', new vscode.ThemeColor('charts.green'));
                break;
            case 'inactive':
                this.iconPath = new vscode.ThemeIcon('eye', new vscode.ThemeColor('charts.red'));
                break;
            case 'streaming':
                this.iconPath = new vscode.ThemeIcon('broadcast', new vscode.ThemeColor('charts.orange'));
                break;
            case 'toggle':
                this.iconPath = new vscode.ThemeIcon('symbol-boolean');
                break;
            case 'streaming-enable':
                this.iconPath = new vscode.ThemeIcon('eye-closed');
                break;
            case 'streaming-disable':
                this.iconPath = new vscode.ThemeIcon('eye');
                break;
            case 'settings':
                this.iconPath = new vscode.ThemeIcon('gear');
                break;
            case 'info':
                this.iconPath = new vscode.ThemeIcon('info');
                break;
        }
    }
}