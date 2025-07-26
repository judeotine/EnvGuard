// Outgoing messages (extension to webview)
export interface WebviewMessage {
    command: string;
    [key: string]: any;
}

export interface UpdateStatusMessage extends WebviewMessage {
    command: 'updateStatus';
    status: 'Active' | 'Inactive';
    isMaskingEnabled: boolean;
    isStreamingMode: boolean;
}

export interface UpdateStatsMessage extends WebviewMessage {
    command: 'updateStats';
    protectedFilesCount: number;
    secretsMaskedCount: number;
    lastScanTime: number;
}

export interface UpdateMaskStyleMessage extends WebviewMessage {
    command: 'updateMaskStyle';
    maskStyle: 'dots' | 'asterisks' | 'blur';
}

// Incoming messages (webview to extension)
export interface WebviewCommand {
    command: string;
    [key: string]: any;
}

export interface ToggleCommand extends WebviewCommand {
    command: 'toggleMasking' | 'toggleStreamingMode';
    value: boolean;
}

export interface ChangeMaskStyleCommand extends WebviewCommand {
    command: 'changeMaskStyle';
    value: 'dots' | 'asterisks' | 'blur';
}

export interface ButtonCommand extends WebviewCommand {
    command: 'refreshPatterns' | 'scanWorkspace' | 'exportConfig' | 'viewLogs' | 'openSettings' | 'getStatus' | 'getStats';
}

// Type guards
export function isUpdateStatusMessage(message: WebviewMessage): message is UpdateStatusMessage {
    return message.command === 'updateStatus';
}

export function isUpdateStatsMessage(message: WebviewMessage): message is UpdateStatsMessage {
    return message.command === 'updateStats';
}

export function isUpdateMaskStyleMessage(message: WebviewMessage): message is UpdateMaskStyleMessage {
    return message.command === 'updateMaskStyle';
}

export function isToggleCommand(command: WebviewCommand): command is ToggleCommand {
    return command.command === 'toggleMasking' || command.command === 'toggleStreamingMode';
}

export function isChangeMaskStyleCommand(command: WebviewCommand): command is ChangeMaskStyleCommand {
    return command.command === 'changeMaskStyle';
}

export function isButtonCommand(command: WebviewCommand): command is ButtonCommand {
    return [
        'refreshPatterns',
        'scanWorkspace',
        'exportConfig',
        'viewLogs',
        'openSettings',
        'getStatus',
        'getStats'
    ].includes(command.command);
}
