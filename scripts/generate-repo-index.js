#!/usr/bin/env node

/**
 * Repository Index Generator
 * Fetches all repositories from GitHub profile and generates an index with statistics
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const README_PATH = path.join(__dirname, '..', 'README.md');
const USERNAME = 'GizzZmo';
const REPO_INDEX_START = '<!-- REPO_INDEX_START -->';
const REPO_INDEX_END = '<!-- REPO_INDEX_END -->';
const STATS_BADGES_START = '<!-- STATS_BADGES_START -->';
const STATS_BADGES_END = '<!-- STATS_BADGES_END -->';

/**
 * Execute a command and return the output
 */
function execCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return null;
  }
}

/**
 * Fetch all repositories using GitHub CLI
 */
function fetchRepositories() {
  console.log('📚 Fetching repositories from GitHub...');
  
  try {
    // Use gh CLI to fetch repositories
    const command = `gh repo list ${USERNAME} --limit 100 --json name,description,url,stargazerCount,forkCount,primaryLanguage,isPrivate,isFork,isArchived,updatedAt,createdAt,pushedAt --jq 'sort_by(.stargazerCount) | reverse'`;
    const output = execCommand(command);
    
    if (!output) {
      console.error('❌ Failed to fetch repositories');
      return null;
    }
    
    const repos = JSON.parse(output);
    console.log(`✅ Fetched ${repos.length} repositories`);
    
    // Filter out private repos and return
    const publicRepos = repos.filter(repo => !repo.isPrivate);
    console.log(`📊 ${publicRepos.length} public repositories`);
    
    return publicRepos;
  } catch (error) {
    console.error('❌ Error fetching repositories:', error.message);
    return null;
  }
}

/**
 * Calculate aggregate statistics
 */
function calculateStats(repos) {
  console.log('📊 Calculating statistics...');
  
  const stats = {
    totalRepos: repos.length,
    totalStars: repos.reduce((sum, repo) => sum + (repo.stargazerCount || 0), 0),
    totalForks: repos.reduce((sum, repo) => sum + (repo.forkCount || 0), 0),
    originalRepos: repos.filter(repo => !repo.isFork).length,
    forkedRepos: repos.filter(repo => repo.isFork).length,
    archivedRepos: repos.filter(repo => repo.isArchived).length,
    languages: {}
  };
  
  // Count languages
  repos.forEach(repo => {
    if (repo.primaryLanguage && repo.primaryLanguage.name) {
      const lang = repo.primaryLanguage.name;
      stats.languages[lang] = (stats.languages[lang] || 0) + 1;
    }
  });
  
  // Get most used language
  const sortedLanguages = Object.entries(stats.languages)
    .sort((a, b) => b[1] - a[1]);
  
  stats.topLanguage = sortedLanguages.length > 0 ? sortedLanguages[0][0] : 'N/A';
  stats.topLanguageCount = sortedLanguages.length > 0 ? sortedLanguages[0][1] : 0;
  
  console.log(`✅ Total: ${stats.totalRepos} repos, ${stats.totalStars} stars, ${stats.totalForks} forks`);
  console.log(`✅ Top language: ${stats.topLanguage} (${stats.topLanguageCount} repos)`);
  
  return stats;
}

/**
 * Generate badges markdown for statistics
 */
function generateStatsBadges(stats) {
  console.log('🎨 Generating statistics badges...');
  
  const badges = `
## 📊 Profile Statistics

<div align="center">

![Total Repositories](https://img.shields.io/badge/Total_Repositories-${stats.totalRepos}-blue?style=for-the-badge&logo=github)
![Total Stars](https://img.shields.io/badge/Total_Stars-${stats.totalStars}-yellow?style=for-the-badge&logo=star)
![Total Forks](https://img.shields.io/badge/Total_Forks-${stats.totalForks}-green?style=for-the-badge&logo=git)
![Top Language](https://img.shields.io/badge/Top_Language-${encodeURIComponent(stats.topLanguage)}-red?style=for-the-badge&logo=code)

</div>

### Repository Breakdown

- **Original Repositories**: ${stats.originalRepos}
- **Forked Repositories**: ${stats.forkedRepos}
- **Archived Repositories**: ${stats.archivedRepos}

### Language Distribution

${Object.entries(stats.languages)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([lang, count]) => `- **${lang}**: ${count} ${count === 1 ? 'repository' : 'repositories'}`)
  .join('\n')}
`;
  
  return badges;
}

/**
 * Generate repository index markdown
 */
function generateRepoIndex(repos) {
  console.log('📝 Generating repository index...');
  
  let indexMd = `
## 📚 Complete Repository Index

<details>
<summary><b>Click to expand full repository list</b> (${repos.length} repositories)</summary>

### All Public Repositories

| # | Repository | Description | Language | Stars | Forks | Updated |
|:-:|:-----------|:------------|:---------|:-----:|:-----:|:--------|
`;

  repos.forEach((repo, index) => {
    const name = repo.name;
    const description = (repo.description || 'No description').replace(/\|/g, '\\|');
    const language = repo.primaryLanguage ? repo.primaryLanguage.name : 'N/A';
    const stars = repo.stargazerCount || 0;
    const forks = repo.forkCount || 0;
    const url = repo.url;
    const updatedDate = new Date(repo.updatedAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    // Add emoji for special repos
    let emoji = '📦';
    if (repo.isFork) emoji = '🔱';
    if (repo.isArchived) emoji = '📁';
    if (stars > 10) emoji = '⭐';
    if (stars > 50) emoji = '🌟';
    if (stars > 100) emoji = '✨';
    
    indexMd += `| ${index + 1} | ${emoji} [**${name}**](${url}) | ${description} | ${language} | ${stars} | ${forks} | ${updatedDate} |\n`;
  });
  
  indexMd += `
</details>

### Featured Projects

Here are some of the most popular repositories:

`;

  // Add top 5 repos by stars
  const topRepos = repos
    .filter(repo => !repo.isArchived)
    .slice(0, 5);
  
  topRepos.forEach((repo, index) => {
    const name = repo.name;
    const description = repo.description || 'No description';
    const language = repo.primaryLanguage ? repo.primaryLanguage.name : 'N/A';
    const stars = repo.stargazerCount || 0;
    const url = repo.url;
    
    indexMd += `${index + 1}. **[${name}](${url})** - ${description}\n`;
    indexMd += `   - 💻 Language: ${language}\n`;
    indexMd += `   - ⭐ Stars: ${stars}\n\n`;
  });
  
  return indexMd;
}

/**
 * Update README with generated content
 */
function updateReadme(statsBadges, repoIndex) {
  console.log('📄 Updating README...');
  
  try {
    let readmeContent = fs.readFileSync(README_PATH, 'utf8');
    
    // Update stats badges section
    if (readmeContent.includes(STATS_BADGES_START) && readmeContent.includes(STATS_BADGES_END)) {
      const statsRegex = new RegExp(
        `${STATS_BADGES_START}[\\s\\S]*?${STATS_BADGES_END}`,
        'g'
      );
      readmeContent = readmeContent.replace(
        statsRegex,
        `${STATS_BADGES_START}\n${statsBadges}\n${STATS_BADGES_END}`
      );
      console.log('✅ Updated stats badges section');
    } else {
      console.log('⚠️ Stats badges markers not found, adding before statistics section');
      // Add before GitHub Statistics section
      const statsSection = '## 📊 GitHub Statistics';
      if (readmeContent.includes(statsSection)) {
        readmeContent = readmeContent.replace(
          statsSection,
          `${STATS_BADGES_START}\n${statsBadges}\n${STATS_BADGES_END}\n\n---\n\n${statsSection}`
        );
      }
    }
    
    // Update repo index section
    if (readmeContent.includes(REPO_INDEX_START) && readmeContent.includes(REPO_INDEX_END)) {
      const indexRegex = new RegExp(
        `${REPO_INDEX_START}[\\s\\S]*?${REPO_INDEX_END}`,
        'g'
      );
      readmeContent = readmeContent.replace(
        indexRegex,
        `${REPO_INDEX_START}\n${repoIndex}\n${REPO_INDEX_END}`
      );
      console.log('✅ Updated repository index section');
    } else {
      console.log('⚠️ Repo index markers not found, adding after pinned repositories');
      // Add after Pinned Repositories section
      const pinnedSection = '<!-- DYNAMIC_REPOS_END -->';
      if (readmeContent.includes(pinnedSection)) {
        readmeContent = readmeContent.replace(
          pinnedSection,
          `${pinnedSection}\n\n---\n\n${REPO_INDEX_START}\n${repoIndex}\n${REPO_INDEX_END}`
        );
      }
    }
    
    fs.writeFileSync(README_PATH, readmeContent);
    console.log('✅ README updated successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Error updating README:', error.message);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Starting repository index generation...\n');
  
  // Fetch repositories
  const repos = fetchRepositories();
  if (!repos || repos.length === 0) {
    console.error('❌ No repositories found or failed to fetch');
    process.exit(1);
  }
  
  // Calculate statistics
  const stats = calculateStats(repos);
  
  // Generate content
  const statsBadges = generateStatsBadges(stats);
  const repoIndex = generateRepoIndex(repos);
  
  // Update README
  const success = updateReadme(statsBadges, repoIndex);
  
  if (success) {
    console.log('\n🎉 Repository index generation completed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Failed to update README');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  fetchRepositories,
  calculateStats,
  generateStatsBadges,
  generateRepoIndex,
  updateReadme,
  main
};
