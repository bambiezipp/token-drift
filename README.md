# token-drift

> CLI tool to detect and diff design token changes across versions

## Installation

```bash
npm install -g token-drift
```

## Usage

Compare two versions of your design token files to detect additions, removals, and value changes:

```bash
token-drift diff tokens-v1.json tokens-v2.json
```

**Example output:**

```
~ color.primary.500   #3B82F6 → #2563EB
+ color.accent.300    #6EE7B7
- color.deprecated.100 #F3F4F6

3 changes detected (1 modified, 1 added, 1 removed)
```

### Options

| Flag | Description |
|------|-------------|
| `--format` | Output format: `text` (default), `json`, `markdown` |
| `--only` | Filter by change type: `added`, `removed`, `modified` |
| `--silent` | Suppress output, exit code only |

```bash
token-drift diff tokens-v1.json tokens-v2.json --format json --only modified
```

## License

MIT