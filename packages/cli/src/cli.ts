#!/usr/bin/env node
import { Command } from 'commander';
import { ConfigManager, ProcessorFactory, ConsoleLogger } from 'phylo-processor';
import { VersionChecker } from './VersionChecker.js';
import { EnvironmentLoader } from './EnvironmentLoader.js';
import { GlobalConfigManager } from './GlobalConfigManager.js';
import { ProjectConfigInitializer } from './ProjectConfigInitializer.js';

/**
 * Main CLI application
 */
class PhyloCLI {
  private readonly program: Command;
  private readonly versionChecker: VersionChecker;
  private readonly environmentLoader: EnvironmentLoader;
  private readonly globalConfigManager: GlobalConfigManager;

  constructor() {
    this.program = new Command();
    this.versionChecker = new VersionChecker();
    this.environmentLoader = new EnvironmentLoader();
    this.globalConfigManager = new GlobalConfigManager();

    this.configureProgram();
  }

  /**
   * Configure command-line program
   */
  private configureProgram(): void {
    this.program
      .name('phylo-cli')
      .description('Config-driven AI file processor for markdown files')
      .version(this.versionChecker.getCurrentVersion());

    this.program
      .option('-c, --config <path>', 'Path to JSON config file')
      .option('--init', 'Generate a config file with all available options')
      .option('--setup-keys', 'Create global config file for API keys')
      .action(async (options) => this.handleCommand(options));
  }

  /**
   * Handle command execution
   */
  private async handleCommand(options: {
    config?: string;
    init?: boolean;
    setupKeys?: boolean;
  }): Promise<void> {
    const logger = new ConsoleLogger();

    try {
      // Check for updates in background (non-blocking)
      this.versionChecker.checkForUpdates(logger).catch(() => {
        // Silently fail
      });

      // Load environment variables
      await this.environmentLoader.load(logger);

      // Handle --setup-keys flag
      if (options.setupKeys) {
        await this.globalConfigManager.setup(logger);
        return;
      }

      // Handle --init flag
      if (options.init) {
        const initializer = new ProjectConfigInitializer();
        await initializer.initialize(logger);
        return;
      }

      // Process with config file
      if (!options.config) {
        logger.error('Error: --config <path> is required when not using --init or --setup-keys');
        process.exit(1);
      }

      await this.processFiles(options.config, logger);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error: ${errorMessage}`);
      process.exit(1);
    }
  }

  /**
   * Process files with the given config
   */
  private async processFiles(configPath: string, logger: ConsoleLogger): Promise<void> {
    const configManager = await ConfigManager.load(configPath, logger);
    const processor = ProcessorFactory.create(configManager, logger);
    await processor.process();
  }

  /**
   * Run the CLI application
   */
  run(): void {
    this.program.parse();
  }
}

// Bootstrap application
const cli = new PhyloCLI();
cli.run();
