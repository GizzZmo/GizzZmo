# Repository Index and Statistics Documentation

## Overview

This repository now includes automated generation of a comprehensive repository index with statistical information displayed via badges in the README.

## Features

### 📊 Profile Statistics Badges
- **Total Repositories**: Count of all public repositories
- **Total Stars**: Aggregate stars across all repositories
- **Total Forks**: Aggregate forks across all repositories
- **Top Language**: Most commonly used programming language

### 📚 Complete Repository Index
- Collapsible table showing all public repositories
- Sortable by stars (default: highest to lowest)
- Shows repository name, description, language, stars, forks, and last update date
- Uses emojis to indicate repository type (⭐ popular, 🔱 forked, 📁 archived)

### 🌟 Featured Projects
- Automatically highlights top 5 repositories by star count
- Excludes archived repositories
- Shows language and star count for each project

## How It Works

### Automated Updates via GitHub Actions

The repository index is automatically updated daily via GitHub Actions workflow (`.github/workflows/config.yml`):

1. **Schedule**: Runs at 00:00 UTC daily
2. **Triggers**: Also runs on push to main, pull requests, and manual workflow dispatch
3. **Authentication**: Uses `GITHUB_TOKEN` secret for API access

### Script: `scripts/generate-repo-index.js`

The main script performs the following operations:

1. **Fetch Repositories**: Uses GitHub CLI (`gh`) or falls back to GitHub REST API
2. **Calculate Statistics**: Aggregates data across all public repositories
3. **Generate Content**: Creates markdown for badges and repository tables
4. **Update README**: Inserts generated content between placeholder markers

### Placeholder Markers

The script looks for these markers in README.md:

- `<!-- STATS_BADGES_START -->` and `<!-- STATS_BADGES_END -->`: For statistics badges
- `<!-- REPO_INDEX_START -->` and `<!-- REPO_INDEX_END -->`: For repository index

## Manual Usage

You can manually run the script to update the README:

```bash
# Ensure you have Node.js installed
npm install

# Run the script (requires GH_TOKEN environment variable)
export GH_TOKEN="your_github_token"
npm run generate-index
```

### Local Testing

For local testing without GitHub credentials:

1. The script will attempt to use the GitHub CLI if available
2. If no credentials are available, it will try the public API
3. If blocked (e.g., by firewall), it exits gracefully with informational messages

## API Fallback

When `GH_TOKEN` is not available, the script uses the GitHub REST API:

```javascript
https://api.github.com/users/{USERNAME}/repos?per_page=100&sort=updated
```

This fallback:
- Works without authentication (subject to rate limits)
- Filters out private repositories
- Sorts by star count
- Maps API response to the expected format

## Customization

### Adjusting Statistics

Edit `calculateStats()` function in `scripts/generate-repo-index.js` to add custom metrics.

### Modifying Badge Appearance

Edit `generateStatsBadges()` function to:
- Change badge styles (e.g., `style=flat-square` instead of `for-the-badge`)
- Add/remove badges
- Customize colors

### Changing Repository Display

Edit `generateRepoIndex()` function to:
- Show more or fewer repositories in featured projects
- Change sorting order
- Modify table columns
- Customize emojis

## Troubleshooting

### Script Fails with "GH_TOKEN not found"

**Local Environment**: This is expected. The script requires GitHub authentication to fetch repository data. Run in GitHub Actions or provide `GH_TOKEN`.

**GitHub Actions**: Ensure the workflow has access to `secrets.GITHUB_TOKEN`.

### "Blocked by DNS monitoring proxy"

The GitHub API is blocked in some environments. This is normal for local development. The script will work in GitHub Actions.

### README Not Updating

1. Check that placeholder markers exist in README.md
2. Verify the workflow ran successfully in the Actions tab
3. Check workflow logs for errors

## Dependencies

- Node.js >= 14.0.0
- GitHub CLI (`gh`) - optional but recommended
- Internet access to shields.io for badge images

## File Structure

```
.
├── README.md                          # Main profile README with placeholders
├── .github/
│   └── workflows/
│       └── config.yml                 # GitHub Actions workflow
├── scripts/
│   ├── generate-repo-index.js         # Main index generation script
│   ├── update-readme.js               # Additional README utilities
│   └── validate-templates.js          # Template validation
└── package.json                       # Node.js dependencies and scripts
```

## Future Enhancements

Potential improvements:
- Add charts for language distribution
- Include contribution activity graphs
- Show repository health scores
- Add filters for repository types
- Export data to JSON for other tools
