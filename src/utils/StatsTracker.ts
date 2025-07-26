interface FileStats {
    secretsMasked: number;
    lastUpdated: number;
}

export class StatsTracker {
    private files: Map<string, FileStats> = new Map();
    private totalSecretsMasked: number = 0;
    private lastScanTime: number = 0;

    /**
     * Track a file that has been processed
     * @param filePath Path to the file
     */
    public trackFile(filePath: string): void {
        if (!this.files.has(filePath)) {
            this.files.set(filePath, {
                secretsMasked: 0,
                lastUpdated: Date.now()
            });
        } else {
            const stats = this.files.get(filePath)!;
            stats.lastUpdated = Date.now();
        }
        
        this.lastScanTime = Date.now();
    }

    /**
     * Track the number of secrets masked in a file
     * @param filePath Path to the file
     * @param count Number of secrets masked
     */
    public trackSecrets(filePath: string, count: number): void {
        if (!this.files.has(filePath)) {
            this.trackFile(filePath);
        }
        
        const stats = this.files.get(filePath)!;
        const previousCount = stats.secretsMasked;
        
        // Update the total count by the difference
        this.totalSecretsMasked += (count - previousCount);
        
        // Update the file's stats
        stats.secretsMasked = count;
        stats.lastUpdated = Date.now();
        this.lastScanTime = Date.now();
    }

    /**
     * Get the current statistics
     */
    public getStats() {
        return {
            protectedFilesCount: this.files.size,
            secretsMaskedCount: this.totalSecretsMasked,
            lastScanTime: this.lastScanTime
        };
    }

    /**
     * Reset all statistics
     */
    public reset(): void {
        this.files.clear();
        this.totalSecretsMasked = 0;
        this.lastScanTime = 0;
    }

    /**
     * Get statistics for a specific file
     * @param filePath Path to the file
     */
    public getFileStats(filePath: string): FileStats | undefined {
        return this.files.get(filePath);
    }

    /**
     * Remove a file from tracking
     * @param filePath Path to the file to remove
     */
    public removeFile(filePath: string): void {
        if (this.files.has(filePath)) {
            const stats = this.files.get(filePath)!;
            this.totalSecretsMasked -= stats.secretsMasked;
            this.files.delete(filePath);
        }
    }
}
