# phylo-cli

> Config-driven AI file processor CLI - process markdown files with OpenAI, Claude, Gemini, and more

A simple, powerful command-line tool for batch processing markdown files using AI models. Perfect for analyzing journals, transforming documents, generating summaries, and automating content workflows.

## Features

- 🤖 **Multi-provider support** - OpenAI, Anthropic Claude, Google Gemini, Mistral, Groq, and more via [abso-ai](https://github.com/dosco/abso)
- 📦 **Batch processing** - Process multiple files together for context-aware transformations
- 🔄 **Processor chaining** - Chain multiple AI processing steps together
- 💾 **Incremental processing** - Automatically tracks progress and resumes from failures
- 🔒 **Secure API key management** - Multiple secure options for storing credentials
- ⚙️ **Config-driven** - All settings in a single JSON file for easy automation
- 🔔 **Auto-update notifications** - Automatically checks for newer versions and notifies you

## Installation

### For End Users

Install globally with npm:

```bash
npm install -g phylo-cli
```

Verify installation:

```bash
phylo-cli --help
```

### For Development

Clone the repository and link locally:

```bash
git clone <repository-url>
cd packages/cli
npm install
npm run build
npm link
```

To unlink during development:

```bash
npm unlink -g phylo-cli
```

## Quick Start

1. **Create a config file**

```bash
phylo-cli --init
```

This creates `phylo.config.json` in your current directory.

2. **Set up API keys** (see [API Key Configuration](#api-key-configuration) below)

3. **Configure your project**

Edit `phylo.config.json`:

```json
{
  "input_folder": "./journals",
  "input_file_pattern": "**/*.md",
  "max_batch_size": null,
  "processors": {
    "main": {
      "prompt_files": ["prompts/analyze.md"],
      "model": "claude-sonnet-4-20250514",
      "output_folder": "./analysis",
      "output_file_extension": ".md"
    }
  }
}
```

4. **Run the processor**

```bash
phylo-cli --config phylo.config.json
```

## API Key Configuration

Choose the method that best fits your security requirements:

### Option 1: Environment Variables (RECOMMENDED)

**Most secure for personal use.** Set API keys in your shell profile:

```bash
# Add to ~/.zshrc or ~/.bashrc
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."
```

**Pros:**
- Keys only exist in shell environment
- No files to accidentally commit
- Standard practice for CLI tools

**Cons:**
- Need to set up on each machine
- Keys visible in process environment

### Option 2: Global Config File

**Balanced security for CLI tools.** Create a protected config file:

```bash
phylo-cli --setup-keys
```

This creates `~/.phylo/config` with 0600 permissions (read/write for owner only):

```json
{
  "api_keys": {
    "ANTHROPIC_API_KEY": "sk-ant-...",
    "OPENAI_API_KEY": "sk-..."
  }
}
```

**Pros:**
- Keys stored in one place for all projects
- Automatic permission checking
- Easy to manage

**Cons:**
- Keys stored in plaintext file
- Vulnerable if system is compromised
- Can be backed up to insecure locations

**Security checks:**
- File permissions verified on every run
- Warning displayed if permissions too permissive
- Must manually create/edit (never auto-populated)

### Option 3: Project .env File

**Not recommended for CLI tools** (better for per-project apps):

Create `.env` in your project directory:

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

⚠️ **WARNING:** Add `.env` to `.gitignore` to prevent committing secrets!

### Option 4: Config File Env Object

**For automation/CI only:**

Add directly to `phylo.config.json`:

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "sk-ant-...",
    "OPENAI_API_KEY": "sk-..."
  }
}
```

⚠️ **WARNING:** Never commit config files with API keys to git!

### Configuration Priority

When multiple sources are present, priority is (lowest to highest):

1. System environment variables
2. Global config (`~/.phylo/config`)
3. Project `.env` file
4. Config JSON `env` object (highest)

## Configuration

### Basic Configuration

```json
{
  "input_folder": "./input",
  "input_file_pattern": "**/*.md",
  "max_batch_size": null,
  "last_processed_file": null,
  "processors": {
    "main": {
      "prompt_files": ["prompts/instructions.md"],
      "model": "gpt-4o",
      "output_folder": "./output",
      "output_file_extension": ".md"
    }
  }
}
```

### Processor Options

Each processor can have:

- `prompt` - Inline prompt string
- `prompt_file` - Path to single prompt file
- `prompt_files` - Array of prompt files (concatenated)
- `model` - AI model to use (default: `gpt-4o`)
- `output_folder` - Where to save results (for final processor)
- `output_processor` - Name of next processor in chain
- `output_file_extension` - Extension for output files (default: `.txt`)

### Chaining Processors

Process files through multiple AI steps:

```json
{
  "processors": {
    "extract": {
      "prompt_files": ["prompts/extract-themes.md"],
      "model": "gpt-4o",
      "output_processor": "analyze"
    },
    "analyze": {
      "prompt_files": ["prompts/deep-analysis.md"],
      "model": "claude-sonnet-4-20250514",
      "output_processor": "summarize"
    },
    "summarize": {
      "prompt_files": ["prompts/create-summary.md"],
      "model": "gpt-4o",
      "output_folder": "./output",
      "output_file_extension": ".md"
    }
  }
}
```

### Batch Processing

Group multiple files into single AI requests:

```json
{
  "max_batch_size": 3
}
```

- `null` or `1` - Process files individually
- `> 1` - Group N files per request (concatenated together)

### Supported Models

Via [abso-ai](https://github.com/dosco/abso), supports:

**OpenAI:**
- `gpt-4o`, `gpt-4o-mini`
- `gpt-4-turbo`, `gpt-4`
- `o1-preview`, `o1-mini`
- `o3-mini`

**Anthropic:**
- `claude-sonnet-4-20250514`
- `claude-opus-4-20250514`
- `claude-3-5-sonnet-20241022`
- `claude-3-opus-20240229`

**Google:**
- `gemini-2.0-flash-exp`
- `gemini-1.5-pro`
- `gemini-1.5-flash`

**Others:**
- Mistral AI
- Groq
- Cohere
- Together AI
- Perplexity
- Fireworks
- OpenRouter (access to 100+ models)

## Commands

### `phylo-cli --init`

Generate a config file with all available options.

Creates `phylo.config.json` in current directory.

### `phylo-cli --config <path>`

Process files using the specified config file.

```bash
phylo-cli --config my-config.json
```

### `phylo-cli --setup-keys`

Create global API key configuration file.

Creates `~/.phylo/config` with secure permissions (0600).

## Usage Examples

### Journal Analysis

```bash
# Initialize config
phylo-cli --init

# Edit phylo.config.json
{
  "input_folder": "./journals/2024",
  "processors": {
    "analyze": {
      "prompt": "Analyze this journal entry for emotional themes and insights.",
      "model": "claude-sonnet-4-20250514",
      "output_folder": "./analysis"
    }
  }
}

# Run analysis
phylo-cli --config phylo.config.json
```

### Document Translation

```json
{
  "input_folder": "./docs/en",
  "processors": {
    "translate": {
      "prompt": "Translate this markdown document to Spanish. Preserve formatting.",
      "model": "gpt-4o",
      "output_folder": "./docs/es"
    }
  }
}
```

### Multi-Stage Processing

```json
{
  "input_folder": "./articles",
  "max_batch_size": 5,
  "processors": {
    "extract": {
      "prompt": "Extract key points from these articles.",
      "model": "gpt-4o-mini",
      "output_processor": "synthesize"
    },
    "synthesize": {
      "prompt": "Create a comprehensive synthesis of these key points.",
      "model": "claude-sonnet-4-20250514",
      "output_folder": "./summaries"
    }
  }
}
```

## Security Best Practices

### 1. File Permissions

The CLI automatically checks permissions on `~/.phylo/config`:

```bash
# Should be 0600 (rw-------)
ls -la ~/.phylo/config

# Fix if needed
chmod 600 ~/.phylo/config
```

### 2. Git Safety

Always add to `.gitignore`:

```gitignore
.env
*.config.json
phylo.config.json
```

The `--init` command creates this automatically.

### 3. API Key Validation

The CLI validates API key formats:

- Anthropic keys should start with `sk-ant-`
- OpenAI keys should start with `sk-`

Warnings are displayed for invalid formats.

### 4. Comparison of Methods

| Method | Security | Convenience | Use Case |
|--------|----------|-------------|----------|
| Environment Variables | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Personal laptop, most secure |
| Global Config | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | CLI tools, good balance |
| Project .env | ⭐⭐⭐ | ⭐⭐⭐⭐ | Per-project apps only |
| Config JSON | ⭐⭐ | ⭐⭐⭐⭐⭐ | CI/CD automation only |

### 5. What NOT to Do

❌ **Don't commit API keys to git**
- Check with: `git log --all -S "sk-ant-"`

❌ **Don't use config JSON for personal projects**
- Easy to accidentally commit

❌ **Don't share config files**
- Even in private messages

❌ **Don't use permissive file permissions**
- Never 0644 or 0666 on key files

## Auto-Update Notifications

The CLI automatically checks for updates on every run:

- Checks npm registry for latest version (3 second timeout)
- Compares with your installed version
- Displays update message if newer version available
- Non-blocking - runs in background and silently fails if network unavailable

Example output when update is available:

```
Update available: 1.0.0 → 1.2.0
Run: npm install -g phylo-cli
```

To update:

```bash
npm install -g phylo-cli
```

To check current version:

```bash
phylo-cli --version
```

## Troubleshooting

### "Config file already exists"

The `--init` command won't overwrite existing configs. Rename or delete the old one first.

### "WARNING: Global config file has insecure permissions"

Fix with:

```bash
chmod 600 ~/.phylo/config
```

### "No new items to process"

All files have been processed. To reprocess:

```json
{
  "last_processed_file": null
}
```

### API Key Not Found

Check priority order:

1. Is it in environment? `echo $ANTHROPIC_API_KEY`
2. Is it in `~/.phylo/config`? `cat ~/.phylo/config`
3. Is it in `.env`? `cat .env`
4. Is it in config JSON? Check `env` object

### Update Check Not Working

The update check:
- Times out after 3 seconds
- Fails silently if network unavailable
- Requires internet connection to npm registry
- Only runs when you execute a command

This is normal and won't affect functionality.

## Development

### Building

```bash
npm run build
```

### Testing Locally

```bash
npm link
phylo-cli --help
```

### Publishing to npm

1. Update version in `package.json`
2. Build the package:

```bash
npm run build
```

3. Login to npm:

```bash
npm login
```

4. Publish:

```bash
npm publish
```

5. Verify:

```bash
npm install -g phylo-cli
```

## License

MIT

## Related Projects

- [abso-ai](https://github.com/dosco/abso) - Universal AI API client
- [phylo-processor](../processor/) - Core processing library

## Contributing

Contributions welcome! Please open an issue or PR.

## Support

For issues and questions:
- GitHub Issues: [repository issues URL]
- Documentation: [repository URL]
