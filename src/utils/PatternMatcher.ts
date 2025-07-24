import { SettingsManager } from '../managers/SettingsManager';

export class PatternMatcher {
    private patterns: string[] = [];

    constructor(private settingsManager: SettingsManager) {
        this.refreshPatterns();
    }

    public refreshPatterns(): void {
        this.patterns = this.settingsManager.getSetting<string[]>('patterns', [
            'SECRET', 'KEY', 'TOKEN', 'PASSWORD', 'PASS', 'API_KEY', 'AUTH', 'PRIVATE'
        ]);
    }

    public shouldMask(key: string): boolean {
        if (this.patterns.length === 0) {
            return false;
        }

        const upperKey = key.toUpperCase();
        return this.patterns.some(pattern => {
            const upperPattern = pattern.toUpperCase();
            
            // Support regex patterns (enclosed in forward slashes)
            if (pattern.startsWith('/') && pattern.endsWith('/')) {
                try {
                    const regex = new RegExp(pattern.slice(1, -1), 'i');
                    return regex.test(key);
                } catch (error) {
                    console.warn(`EnvGuard: Invalid regex pattern: ${pattern}`);
                    return false;
                }
            }
            
            // Support glob-like patterns with wildcards
            if (pattern.includes('*')) {
                const regexPattern = upperPattern.replace(/\*/g, '.*');
                const regex = new RegExp(`^${regexPattern}$`, 'i');
                return regex.test(upperKey);
            }
            
            // Simple substring matching
            return upperKey.includes(upperPattern);
        });
    }

    public getPatterns(): string[] {
        return [...this.patterns];
    }

    public addPattern(pattern: string): void {
        if (!this.patterns.includes(pattern)) {
            this.patterns.push(pattern);
            this.updateSettings();
        }
    }

    public removePattern(pattern: string): void {
        const index = this.patterns.indexOf(pattern);
        if (index > -1) {
            this.patterns.splice(index, 1);
            this.updateSettings();
        }
    }

    private async updateSettings(): Promise<void> {
        await this.settingsManager.setSetting('patterns', this.patterns);
    }
}