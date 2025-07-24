import * as vscode from 'vscode';
import { EnvMaskingProvider } from './EnvMaskingProvider';

export class StatusBarProvider implements vscode.Disposable {
    private statusBarItem: vscode.StatusBarItem;

    constructor(private envMaskingProvider: EnvMaskingProvider) {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'envguard.toggleMasking';
        this.statusBarItem.show();
    }

    public updateStatusBar() {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !this.envMaskingProvider.isEnvFile(editor.document)) {
            this.statusBarItem.hide();
            return;
        }

        const status = this.envMaskingProvider.getStatus();
        
        if (status.streamingMode) {
            this.statusBarItem.text = '$(eye-closed) EnvGuard: Streaming';
            this.statusBarItem.tooltip = 'EnvGuard: Streaming mode active - all secrets masked';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        } else if (status.enabled) {
            this.statusBarItem.text = '$(shield) EnvGuard: On';
            this.statusBarItem.tooltip = 'EnvGuard: Masking enabled - click to toggle';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
        } else {
            this.statusBarItem.text = '$(eye) EnvGuard: Off';
            this.statusBarItem.tooltip = 'EnvGuard: Masking disabled - click to toggle';
            this.statusBarItem.backgroundColor = undefined;
        }

        this.statusBarItem.show();
    }

    dispose() {
        this.statusBarItem.dispose();
    }
}