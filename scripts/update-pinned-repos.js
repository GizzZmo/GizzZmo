#!/usr/bin/env node

/**
 * Pinned Repositories Updater
 * Fetches pinned repositories from GitHub and updates README.md
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const README_PATH = path.join(__dirname, '..', 'README.md');
const USERNAME = 'GizzZmo';
const PINNED_REPOS_START = '<!-- DYNAMIC_REPOS_START -->';
const PINNED_REPOS_END = '<!-- DYNAMIC_REPOS_END -->';

/**
 * Fetch pinned repositories using GitHub GraphQL API
 */
async function fetchPinnedRepositories() {
  console.log('📌 Fetching pinned repositories from GitHub...');
  
  const query = `
    query {
      user(login: "${USERNAME}") {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              description
              url
              stargazerCount
              primaryLanguage {
                name
              }
            }
          }
        }
      }
    }
  `;
  
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.log('⚠️ No GitHub token found, using REST API fallback...');
    return await fetchPinnedReposRestAPI();
  }
  
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });
    
    const options = {
      hostname: 'api.github.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'User-Agent': 'GizzZmo-Profile-Generator',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          
          if (response.errors) {
            console.error('❌ GraphQL errors:', response.errors);
            console.log('⚠️ Falling back to REST API...');
            resolve(fetchPinnedReposRestAPI());
            return;
          }
          
          if (!response.data || !response.data.user || !response.data.user.pinnedItems) {
            console.error('❌ Invalid response structure');
            resolve(fetchPinnedReposRestAPI());
            return;
          }
          
          const pinnedRepos = response.data.user.pinnedItems.nodes;
          console.log(`✅ Fetched ${pinnedRepos.length} pinned repositories`);
          resolve(pinnedRepos);
        } catch (error) {
          console.error('❌ Error parsing GraphQL response:', error.message);
          resolve(fetchPinnedReposRestAPI());
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Error fetching pinned repos:', error.message);
      resolve(fetchPinnedReposRestAPI());
    });
    
    req.write(data);
    req.end();
  });
}

/**
 * Fallback: Use REST API to get top starred repos as "pinned"
 */
async function fetchPinnedReposRestAPI() {
  console.log('📚 Using REST API fallback for pinned repositories...');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/users/${USERNAME}/repos?per_page=100&sort=stars`,
      method: 'GET',
      headers: {
        'User-Agent': 'GizzZmo-Profile-Generator'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const repos = JSON.parse(data);
          
          if (!Array.isArray(repos)) {
            console.error('❌ Invalid response from GitHub API');
            resolve([]);
            return;
          }
          
          // Get top 6 starred repos that aren't forks or archived
          const topRepos = repos
            .filter(repo => !repo.private && !repo.fork && !repo.archived)
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 6)
            .map(repo => ({
              name: repo.name,
              description: repo.description,
              url: repo.html_url,
              stargazerCount: repo.stargazers_count,
              primaryLanguage: repo.language ? { name: repo.language } : null
            }));
          
          console.log(`✅ Using top ${topRepos.length} starred repos as pinned repos`);
          resolve(topRepos);
        } catch (error) {
          console.error('❌ Error parsing REST API response:', error.message);
          resolve([]);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Error fetching from REST API:', error.message);
      resolve([]);
    });
    
    req.end();
  });
}

/**
 * Get language badge for a programming language
 */
function getLanguageBadge(language) {
  if (!language) return '![N/A](https://img.shields.io/badge/N/A-gray?style=flat-square)';
  
  const languageColors = {
    'JavaScript': { color: 'F7DF1E', logo: 'javascript', logoColor: 'black' },
    'TypeScript': { color: '3178C6', logo: 'typescript', logoColor: 'white' },
    'Python': { color: '3776AB', logo: 'python', logoColor: 'white' },
    'C++': { color: '00599C', logo: 'c%2B%2B', logoColor: 'white' },
    'Java': { color: '007396', logo: 'java', logoColor: 'white' },
    'C#': { color: '239120', logo: 'c-sharp', logoColor: 'white' },
    'Go': { color: '00ADD8', logo: 'go', logoColor: 'white' },
    'Rust': { color: '000000', logo: 'rust', logoColor: 'white' },
    'Swift': { color: 'FA7343', logo: 'swift', logoColor: 'white' },
    'Kotlin': { color: '0095D5', logo: 'kotlin', logoColor: 'white' },
    'Ruby': { color: 'CC342D', logo: 'ruby', logoColor: 'white' },
    'PHP': { color: '777BB4', logo: 'php', logoColor: 'white' },
    'HTML': { color: 'E34F26', logo: 'html5', logoColor: 'white' },
    'CSS': { color: '1572B6', logo: 'css3', logoColor: 'white' },
    'Shell': { color: '89E051', logo: 'gnu-bash', logoColor: 'black' },
    'Markdown': { color: '000000', logo: 'markdown', logoColor: 'white' },
    'Solidity': { color: '363636', logo: 'solidity', logoColor: 'white' },
    'Move': { color: '4B32C3', logo: 'ethereum', logoColor: 'white' },
    'Scala': { color: 'DC322F', logo: 'scala', logoColor: 'white' },
    'Clojure': { color: '5881D8', logo: 'clojure', logoColor: 'white' },
    'Lua': { color: '2C2D72', logo: 'lua', logoColor: 'white' }
  };
  
  const config = languageColors[language] || { color: 'gray', logo: 'code', logoColor: 'white' };
  return `![${language}](https://img.shields.io/badge/${encodeURIComponent(language)}-${config.color}?style=flat-square&logo=${config.logo}&logoColor=${config.logoColor})`;
}

/**
 * Generate pinned repositories markdown
 */
function generatePinnedReposMarkdown(repos) {
  console.log('📝 Generating pinned repositories markdown...');
  
  if (!repos || repos.length === 0) {
    console.log('⚠️ No pinned repositories found');
    return `| Repository | Description | Language | Stars |
|:-----------|:------------|:---------|:------|
| *No pinned repositories* | Update your pinned repositories on GitHub | - | - |`;
  }
  
  let markdown = `| Repository | Description | Language | Stars |
|:-----------|:------------|:---------|:------|
`;
  
  repos.forEach(repo => {
    const name = repo.name;
    const description = (repo.description || 'No description')
      .replace(/\|/g, '\\|')
      .replace(/\n/g, ' ')
      .substring(0, 100) + (repo.description && repo.description.length > 100 ? '...' : '');
    const language = repo.primaryLanguage ? getLanguageBadge(repo.primaryLanguage.name) : '![N/A](https://img.shields.io/badge/N/A-gray?style=flat-square)';
    const stars = `![Stars](https://img.shields.io/github/stars/${USERNAME}/${name}?style=flat-square)`;
    const url = repo.url;
    
    markdown += `| 📝 **[${name}](${url})** | ${description} | ${language} | ${stars} |\n`;
  });
  
  return markdown;
}

/**
 * Update README with pinned repositories
 */
function updateReadme(pinnedReposMarkdown) {
  console.log('📄 Updating README with pinned repositories...');
  
  try {
    let readmeContent = fs.readFileSync(README_PATH, 'utf8');
    
    if (!readmeContent.includes(PINNED_REPOS_START) || !readmeContent.includes(PINNED_REPOS_END)) {
      console.error('❌ Pinned repos markers not found in README');
      return false;
    }
    
    const regex = new RegExp(
      `${PINNED_REPOS_START}[\\s\\S]*?${PINNED_REPOS_END}`,
      'g'
    );
    
    readmeContent = readmeContent.replace(
      regex,
      `${PINNED_REPOS_START}\n${pinnedReposMarkdown}\n${PINNED_REPOS_END}`
    );
    
    fs.writeFileSync(README_PATH, readmeContent);
    console.log('✅ README updated successfully with pinned repositories');
    
    return true;
  } catch (error) {
    console.error('❌ Error updating README:', error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting pinned repositories update...\n');
  
  // Fetch pinned repositories
  const pinnedRepos = await fetchPinnedRepositories();
  
  if (!pinnedRepos || pinnedRepos.length === 0) {
    console.log('⚠️ No pinned repositories found');
    console.log('ℹ️  Make sure you have pinned repositories on your GitHub profile');
    console.log('ℹ️  Or ensure GH_TOKEN is set for authenticated API access');
  }
  
  // Generate markdown
  const markdown = generatePinnedReposMarkdown(pinnedRepos);
  
  // Update README
  const success = updateReadme(markdown);
  
  if (success) {
    console.log('\n🎉 Pinned repositories update completed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Failed to update README with pinned repositories');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  fetchPinnedRepositories,
  generatePinnedReposMarkdown,
  updateReadme,
  main
};
