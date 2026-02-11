import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ConsoleLogger } from '@phylo/processor';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Handles version checking and update notifications
 */
export class VersionChecker {
  private readonly packageName: string;
  private readonly timeoutMs: number;

  constructor(packageName: string = 'phylo-cli', timeoutMs: number = 3000) {
    this.packageName = packageName;
    this.timeoutMs = timeoutMs;
  }

  /**
   * Get current package version from package.json
   */
  getCurrentVersion(): string {
    try {
      const packageJsonPath = join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf-8' }));
      return packageJson.version;
    } catch {
      return '1.0.0';
    }
  }

  /**
   * Check for updates from npm registry
   * Runs asynchronously in background, doesn't block CLI
   */
  async checkForUpdates(logger: ConsoleLogger): Promise<void> {
    try {
      const currentVersion = this.getCurrentVersion();

      const response = await fetch(`https://registry.npmjs.org/${this.packageName}/latest`, {
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as { version: string };
      const latestVersion = data.version;

      if (latestVersion !== currentVersion && this.isNewerVersion(latestVersion, currentVersion)) {
        logger.warn('');
        logger.warn(`Update available: ${currentVersion} → ${latestVersion}`);
        logger.warn(`Run: npm install -g ${this.packageName}`);
        logger.warn('');
      }
    } catch {
      // Silently fail - don't interrupt user's workflow
    }
  }

  /**
   * Compare two semver versions
   * Returns true if version1 is newer than version2
   */
  private isNewerVersion(version1: string, version2: string): boolean {
    const v1parts = version1.split('.').map(Number);
    const v2parts = version2.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      const v1 = v1parts[i] || 0;
      const v2 = v2parts[i] || 0;

      if (v1 > v2) return true;
      if (v1 < v2) return false;
    }

    return false;
  }
}
