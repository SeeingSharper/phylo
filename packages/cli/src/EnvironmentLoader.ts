import { readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import dotenv from 'dotenv';
import type { ConsoleLogger } from 'phylo-processor';

/**
 * Loads environment variables from multiple sources with proper priority
 */
export class EnvironmentLoader {
  private readonly globalConfigPath: string;

  constructor() {
    this.globalConfigPath = join(homedir(), '.phylo', 'config');
  }

  /**
   * Load environment variables from multiple sources
   * Priority (lowest to highest):
   * 1. System environment variables (already in process.env)
   * 2. Global config file (~/.phylo/config)
   * 3. Project .env file (current directory)
   * 4. Config JSON env object (handled by ConfigManager)
   */
  async load(logger: ConsoleLogger): Promise<void> {
    await this.loadGlobalConfig(logger);
    this.loadProjectEnv();
  }

  /**
   * Load global config file if it exists
   */
  private async loadGlobalConfig(logger: ConsoleLogger): Promise<void> {
    if (!existsSync(this.globalConfigPath)) {
      return;
    }

    try {
      this.checkPermissions(logger);
      const config = await this.readGlobalConfig();
      this.applyApiKeys(config);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`Warning: Failed to load global config: ${errorMessage}`);
    }
  }

  /**
   * Check file permissions for security
   */
  private checkPermissions(logger: ConsoleLogger): void {
    const stats = statSync(this.globalConfigPath);
    const mode = stats.mode & parseInt('777', 8);

    if (mode !== parseInt('600', 8)) {
      logger.warn(`WARNING: Global config file has insecure permissions (${mode.toString(8)})`);
      logger.warn(`Recommended: chmod 600 ${this.globalConfigPath}`);
      logger.warn('');
    }
  }

  /**
   * Read and parse global config file
   */
  private async readGlobalConfig(): Promise<{ api_keys?: Record<string, string> }> {
    const content = await readFile(this.globalConfigPath, { encoding: 'utf-8' });
    return JSON.parse(content);
  }

  /**
   * Apply API keys from config to process.env
   */
  private applyApiKeys(config: { api_keys?: Record<string, string> }): void {
    if (!config.api_keys) {
      return;
    }

    for (const [key, value] of Object.entries(config.api_keys)) {
      if (value && typeof value === 'string' && !process.env[key]) {
        process.env[key] = value;
      }
    }
  }

  /**
   * Load project .env file (dotenv will not override existing env vars)
   */
  private loadProjectEnv(): void {
    dotenv.config();
  }
}
