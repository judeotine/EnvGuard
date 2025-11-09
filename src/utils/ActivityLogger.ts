import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: any;
}

export class ActivityLogger {
    private static instance: ActivityLogger;
    private logFile?: string;
    private logsEnabled: boolean = true;
    private maxLogEntries: number = 1000;
    private logEntries: LogEntry[] = [];
    private outputChannel: vscode.OutputChannel;

    private constructor() {
        this.outputChannel = vscode.window.createOutputChannel('EnvGuard Activity');
        
        // Attempt to create logs directory
        try {
            const extensionStorage = vscode.extensions.getExtension('jude-otine.envguard')?.extensionUri.fsPath || '';
            const logsDir = path.join(extensionStorage, '..', 'envguard-logs');
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }
            
            // Set up log file path
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            this.logFile = path.join(logsDir, `activity-${timestamp}.log`);
            
            // Load existing log entries if any
            this.loadLogs();
        } catch (error) {
            // If we cannot create or access the logs directory, disable file logging
            this.logsEnabled = false;
            this.logFile = undefined;
            console.warn('EnvGuard: Unable to create logs directory. File logging disabled.', error);
            this.outputChannel.appendLine('EnvGuard: Unable to create logs directory. File logging disabled.');
        }
    }

    public static getInstance(): ActivityLogger {
        if (!ActivityLogger.instance) {
            ActivityLogger.instance = new ActivityLogger();
        }
        return ActivityLogger.instance;
    }

    public info(message: string, context?: any): void {
        this.addLogEntry('info', message, context);
    }

    public warn(message: string, context?: any): void {
        this.addLogEntry('warn', message, context);
    }

    public error(message: string, error?: Error | unknown, context?: any): void {
        let errorMessage = message;
        
        if (error instanceof Error) {
            errorMessage += `: ${error.message}`;
            if (error.stack) {
                errorMessage += `\n${error.stack}`;
            }
        } else if (error) {
            errorMessage += `: ${String(error)}`;
        }
        
        this.addLogEntry('error', errorMessage, context);
    }

    public showLogs(): void {
        this.outputChannel.show(true);
    }

    public clearLogs(): void {
        this.logEntries = [];
        this.saveLogs();
        this.outputChannel.clear();
    }

    public getRecentLogs(count: number = 50): LogEntry[] {
        return [...this.logEntries].reverse().slice(0, count);
    }

    private addLogEntry(level: LogLevel, message: string, context?: any): void {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context
        };

        // Add to in-memory logs
        this.logEntries.push(entry);
        
        // Trim logs if needed
        if (this.logEntries.length > this.maxLogEntries) {
            this.logEntries = this.logEntries.slice(-this.maxLogEntries);
        }

        // Write to output channel
        const logLine = `[${entry.timestamp}] [${level.toUpperCase()}] ${message}`;
        if (level === 'error') {
            this.outputChannel.appendLine(logLine);
            if (context) {
                this.outputChannel.appendLine(`Context: ${JSON.stringify(context, null, 2)}`);
            }
        } else {
            this.outputChannel.appendLine(logLine);
        }

        // Save to file (if enabled)
        if (this.logsEnabled) {
            this.saveLogs();
        }
    }

    private saveLogs(): void {
        if (!this.logsEnabled || !this.logFile) {
            return;
        }
        try {
            const logContent = this.logEntries
                .map(entry => JSON.stringify(entry))
                .join('\n');
            
            fs.writeFileSync(this.logFile, logContent, 'utf8');
        } catch (error) {
            console.error('Failed to save logs:', error);
        }
    }

    private loadLogs(): void {
        if (!this.logsEnabled || !this.logFile) {
            return;
        }
        try {
            if (fs.existsSync(this.logFile)) {
                const logContent = fs.readFileSync(this.logFile, 'utf8');
                this.logEntries = logContent
                    .split('\n')
                    .filter(line => line.trim())
                    .map(line => {
                        try {
                            return JSON.parse(line) as LogEntry;
                        } catch {
                            return null;
                        }
                    })
                    .filter((entry): entry is LogEntry => entry !== null);
            }
        } catch (error) {
            console.error('Failed to load logs:', error);
        }
    }
}
