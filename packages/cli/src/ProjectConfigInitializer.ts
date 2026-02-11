import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ConsoleLogger, ProcessorConfig } from 'phylo-processor';

/**
 * Initializes project configuration files
 */
export class ProjectConfigInitializer {
  private readonly configPath: string;

  constructor(workingDirectory: string = process.cwd()) {
    this.configPath = join(workingDirectory, 'phylo.config.json');
  }

  /**
   * Initialize project configuration
   */
  async initialize(logger: ConsoleLogger): Promise<void> {
    if (this.configExists()) {
      logger.error(`Config file already exists: ${this.configPath}`);
      process.exit(1);
    }

    await this.createConfigFile();
    this.showSuccessMessage(logger);
  }

  /**
   * Check if config already exists
   */
  private configExists(): boolean {
    return existsSync(this.configPath);
  }

  /**
   * Create default configuration file
   */
  private async createConfigFile(): Promise<void> {
    const defaultConfig = this.getDefaultConfig();
    await writeFile(this.configPath, JSON.stringify(defaultConfig, null, 2), {
      encoding: 'utf-8',
    });
  }

  /**
   * Get default configuration structure
   */
  private getDefaultConfig(): ProcessorConfig {
    return {
      input_folder: './input',
      max_batch_size: null,
      last_processed_file: null,
      input_file_pattern: '**/*.md',
      processors: {
        main: {
          prompt_files: ['prompts/instructions.md'],
          model: 'gpt-4o',
          output_folder: './output',
          output_file_extension: '.md',
        },
      },
      env: {
        OPENAI_API_KEY: '',
        ANTHROPIC_API_KEY: '',
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
   * Show success message with usage instructions
   */
  private showSuccessMessage(logger: ConsoleLogger): void {
    logger.success(`Created config file: ${this.configPath}`);
    logger.info('');
    logger.warn('IMPORTANT: Add to .gitignore to avoid committing secrets:');
    logger.dim('  phylo.config.json');
    logger.dim('  .env');
    logger.info('');
    logger.info('Edit the file to configure your input folder, processors, and prompts.');
    logger.info('');
    this.showApiKeyInstructions(logger);
    this.showProcessorChainingInfo(logger);
  }

  /**
   * Show API key configuration instructions
   */
  private showApiKeyInstructions(logger: ConsoleLogger): void {
    logger.info('To set API keys, choose one of these methods:');
    logger.info('');
    logger.info('1. Environment variables (RECOMMENDED - most secure):');
    logger.dim('   export ANTHROPIC_API_KEY="sk-ant-..."');
    logger.dim('   Add to ~/.zshrc or ~/.bashrc to persist');
    logger.info('');
    logger.info('2. Global config file:');
    logger.dim('   phylo-cli --setup-keys');
    logger.dim('   Creates ~/.phylo/config with secure permissions');
    logger.info('');
    logger.info('3. Project .env file (not recommended for CLI):');
    logger.dim('   Create .env in this directory');
    logger.dim('   WARNING: Never commit to git');
    logger.info('');
    logger.info('4. Config file env object (for automation only):');
    logger.dim('   Add "env" object to phylo.config.json');
    logger.dim('   WARNING: Never commit to git');
    logger.info('');
  }

  /**
   * Show processor chaining information
   */
  private showProcessorChainingInfo(logger: ConsoleLogger): void {
    logger.info('To chain multiple processors, add more entries to "processors" and use "output_processor":');
    logger.dim('  "analysis": { "prompt_files": [...], "output_processor": "refinement" }');
    logger.dim('  "refinement": { "prompt_files": [...], "output_folder": "./output" }');
  }
}
