import { writeFile, chmod, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { ConsoleLogger } from 'phylo-processor';

/**
 * Manages global API key configuration at ~/.phylo/config
 */
export class GlobalConfigManager {
  private readonly globalConfigDir: string;
  private readonly globalConfigPath: string;

  constructor() {
    this.globalConfigDir = join(homedir(), '.phylo');
    this.globalConfigPath = join(this.globalConfigDir, 'config');
  }

  /**
   * Create global config file for API keys
   */
  async setup(logger: ConsoleLogger): Promise<void> {
    await this.ensureDirectory();

    if (this.configExists()) {
      this.showExistingConfigMessage(logger);
      return;
    }

    await this.createConfigFile();
    this.showSuccessMessage(logger);
  }

  /**
   * Ensure ~/.phylo directory exists
   */
  private async ensureDirectory(): Promise<void> {
    if (!existsSync(this.globalConfigDir)) {
      await mkdir(this.globalConfigDir, { recursive: true, mode: 0o700 });
    }
  }

  /**
   * Check if config already exists
   */
  private configExists(): boolean {
    return existsSync(this.globalConfigPath);
  }

  /**
   * Show message when config already exists
   */
  private showExistingConfigMessage(logger: ConsoleLogger): void {
    logger.warn(`Global config already exists: ${this.globalConfigPath}`);
    logger.info('Edit the file manually to update your API keys.');
    logger.info('');
    logger.info('Example format:');
    logger.dim(
      JSON.stringify(
        {
          api_keys: {
            ANTHROPIC_API_KEY: 'sk-ant-...',
            OPENAI_API_KEY: 'sk-...',
          },
        },
        null,
        2,
      ),
    );
  }

  /**
   * Create template config file
   */
  private async createConfigFile(): Promise<void> {
    const templateConfig = this.getTemplateConfig();

    await writeFile(this.globalConfigPath, JSON.stringify(templateConfig, null, 2), {
      encoding: 'utf-8',
      mode: 0o600,
    });

    await chmod(this.globalConfigPath, 0o600);
  }

  /**
   * Get template configuration structure
   */
  private getTemplateConfig(): object {
    return {
      api_keys: {
        ANTHROPIC_API_KEY: '',
        OPENAI_API_KEY: '',
        GOOGLE_API_KEY: '',
        MISTRAL_API_KEY: '',
        GROQ_API_KEY: '',
        OPENROUTER_API_KEY: '',
        COHERE_API_KEY: '',
        TOGETHER_API_KEY: '',
        PERPLEXITY_API_KEY: '',
        FIREWORKS_API_KEY: '',
      },
    };
  }

  /**
   * Show success message after creation
   */
  private showSuccessMessage(logger: ConsoleLogger): void {
    logger.success(`Created global config: ${this.globalConfigPath}`);
    logger.info('');
    logger.info('Edit this file to add your API keys. Only add the keys you need.');
    logger.info('File permissions are set to 0600 (read/write for owner only).');
    logger.info('');
    logger.warn('SECURITY: Never commit this file to git or share it publicly.');
  }
}
