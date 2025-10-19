# Scripts Documentation

This directory contains utility scripts for maintaining and managing the GitHub profile repository.

## 📋 Available Scripts

### 🔗 check-dead-links.js

A comprehensive dead link checker that scans all markdown, HTML, and JSON files in the repository to identify broken URLs and 404 errors. It provides an interactive mode to fix dead links.

#### Features

- **Automatic URL Extraction**: Scans `.md`, `.html`, `.htm`, and `.json` files
- **Smart URL Checking**: Uses HEAD requests for efficiency, falls back to GET when needed
- **Redirect Following**: Automatically follows redirects (up to 5 levels)
- **Badge URL Skipping**: Automatically skips checking badge URLs (shields.io, komarev.com, etc.) that often block automated checks
- **Interactive Fix Mode**: Allows you to correct dead links directly
- **Detailed Reporting**: Shows which files contain each broken URL
- **Colored Output**: Easy-to-read terminal output with color-coded results

#### Usage

##### Basic Link Check

```bash
npm run check-links
```

This will scan all files and report any dead links found.

##### Verbose Mode

```bash
npm run check-links:verbose
```

Shows additional information including skipped links.

##### Interactive Fix Mode

```bash
npm run fix-links
```

This will:
1. Scan all files for URLs
2. Check each URL for validity
3. For each dead link, prompt you to:
   - **Fix**: Enter the correct URL to replace the broken one
   - **Skip**: Skip this link and move to the next
   - **Quit**: Exit the interactive mode

When you choose to fix a link, the script will automatically update all files containing that URL.

#### Example Output

```
Starting dead link checker...

Found 12 files to scan.

Extracting URLs...
Found 161 total URLs (147 unique).

Checking URLs...

========================================
        Link Check Summary
========================================

Total files scanned: 12
Total URLs found: 161
Unique URLs: 147
✓ Working links: 135
⊘ Skipped links: 0
✗ Dead links: 12

Dead Links Found:
─────────────────

1. https://github.com/GizzZmo/VST3-Public-SDK
   Reason: HTTP 404
   Found in:
     - README.md

2. https://twitter.com/Jon_Arve
   Reason: HTTP 404
   Found in:
     - README.md

Tip: Run with --fix flag to interactively correct dead links.
```

#### Interactive Fix Example

```bash
$ npm run fix-links

Dead Link 1/12:
https://github.com/GizzZmo/VST3-Public-SDK
Reason: HTTP 404

Found in:
  - README.md

Action? (f)ix / (s)kip / (q)uit: f
Enter the correct URL (or press Enter to skip): https://github.com/GizzZmo/vst3sdk

✓ Updated 1 file(s)
```

#### Configuration

The script can be configured by editing `/home/runner/work/GizzZmo/GizzZmo/scripts/check-dead-links.js`:

- `FILE_EXTENSIONS`: File types to scan (default: `.md`, `.html`, `.htm`, `.json`)
- `EXCLUDE_DIRS`: Directories to exclude (default: `node_modules`, `.git`, `dist`, `build`, `.next`)
- `TIMEOUT`: Request timeout in milliseconds (default: 10000)
- `MAX_REDIRECTS`: Maximum number of redirects to follow (default: 5)

---

### 📊 generate-repo-index.js

Generates an automated index of all repositories for inclusion in the README.

**Usage:**
```bash
npm run generate-index
```

---

### 🔄 update-readme.js

Updates the README with dynamic content such as repository statistics and recent activity.

**Usage:**
```bash
npm run update-readme
```

---

### ✅ validate-templates.js

Validates configuration templates to ensure they are properly formatted and contain no errors.

**Usage:**
```bash
npm run validate-templates
```

---

## 🛠️ Development

### Adding New Scripts

When adding new scripts:

1. Create the script in the `/scripts` directory
2. Make it executable: `chmod +x scripts/your-script.js`
3. Add it to `package.json` scripts section
4. Document it in this README
5. Include a header comment explaining what the script does

### Script Template

```javascript
#!/usr/bin/env node

/**
 * Script Name
 * Brief description of what this script does
 */

// Your code here
```

---

## 📞 Support

If you encounter issues with any scripts:

1. Check the script's documentation above
2. Review the script's source code for configuration options
3. [Open an issue](https://github.com/GizzZmo/GizzZmo/issues) if you need help

---

*Last updated: October 19, 2025*
