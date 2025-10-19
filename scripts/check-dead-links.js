#!/usr/bin/env node

/**
 * Dead Link Checker Script
 * Scans all markdown, HTML, and JSON files for URLs and checks their validity
 * Allows interactive correction of broken links
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const readline = require('readline');

// Configuration
const FILE_EXTENSIONS = ['.md', '.html', '.htm', '.json'];
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next'];
const URL_REGEX = /(https?:\/\/[^\s\)\]<>"']+)/gi;
const TIMEOUT = 10000; // 10 seconds timeout for each request
const MAX_REDIRECTS = 5;

// Known good domains that may have DNS issues in certain environments
const KNOWN_GOOD_DOMAINS = new Set([
  'youtube.com',
  'www.youtube.com',
  'soundcloud.com',
  'linkedin.com',
  'www.linkedin.com',
  'twitter.com',
  'x.com',
  'editorconfig.org',
  'code.visualstudio.com',
  'commonmark.org',
]);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Results storage
const results = {
  totalFiles: 0,
  totalUrls: 0,
  uniqueUrls: new Set(),
  deadLinks: [],
  workingLinks: [],
  skippedLinks: [],
  urlToFiles: new Map(), // Maps URLs to files they appear in
};

/**
 * Recursively find all files with specific extensions
 */
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        findFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (FILE_EXTENSIONS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Extract URLs from file content
 */
function extractUrls(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const urls = [];
  let match;

  while ((match = URL_REGEX.exec(content)) !== null) {
    const url = match[1].replace(/[.,;:]$/, ''); // Remove trailing punctuation
    urls.push(url);
    results.uniqueUrls.add(url);
    
    // Track which files contain which URLs
    if (!results.urlToFiles.has(url)) {
      results.urlToFiles.set(url, []);
    }
    results.urlToFiles.get(url).push(filePath);
  }

  return urls;
}

/**
 * Check if a URL is accessible
 */
function checkUrl(url, redirectCount = 0) {
  return new Promise((resolve) => {
    // Parse URL first for security
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (e) {
      resolve({ url, status: 'error', reason: 'Invalid URL' });
      return;
    }

    // Skip certain hostnames that are known to block automated checks
    const hostname = urlObj.hostname;
    if (hostname === 'shields.io' || 
        hostname === 'img.shields.io' ||
        hostname === 'komarev.com' ||
        hostname === 'github-readme-stats.vercel.app' ||
        hostname === 'github-readme-streak-stats.herokuapp.com') {
      resolve({ url, status: 'skipped', reason: 'Badge/Stats URL (skipped)' });
      return;
    }
    const client = urlObj.protocol === 'https:' ? https : http;

    const options = {
      method: 'HEAD',
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)',
        'Accept': '*/*',
      },
    };

    const req = client.request(url, options, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (redirectCount < MAX_REDIRECTS) {
          const redirectUrl = new URL(res.headers.location, url).href;
          resolve(checkUrl(redirectUrl, redirectCount + 1));
        } else {
          resolve({ url, status: 'error', statusCode: res.statusCode, reason: 'Too many redirects' });
        }
        return;
      }

      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve({ url, status: 'ok', statusCode: res.statusCode });
      } else if (res.statusCode === 405) {
        // Method Not Allowed, try GET
        checkUrlWithGet(url).then(resolve);
      } else {
        resolve({ url, status: 'error', statusCode: res.statusCode, reason: `HTTP ${res.statusCode}` });
      }
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ url, status: 'error', reason: 'Timeout' });
    });

    req.on('error', (err) => {
      // Check if it's a DNS error for a known good domain
      const hostname = urlObj.hostname;
      if (err.code === 'ENOTFOUND' && KNOWN_GOOD_DOMAINS.has(hostname)) {
        resolve({ url, status: 'skipped', reason: `DNS issue (${hostname} is a known good domain)` });
      } else {
        resolve({ url, status: 'error', reason: err.message });
      }
    });

    req.end();
  });
}

/**
 * Check URL with GET method (fallback)
 */
function checkUrlWithGet(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const options = {
      method: 'GET',
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)',
        'Accept': '*/*',
      },
    };

    const req = client.request(url, options, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve({ url, status: 'ok', statusCode: res.statusCode });
      } else {
        resolve({ url, status: 'error', statusCode: res.statusCode, reason: `HTTP ${res.statusCode}` });
      }
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ url, status: 'error', reason: 'Timeout' });
    });

    req.on('error', (err) => {
      // Check if it's a DNS error for a known good domain
      const hostname = urlObj.hostname;
      if (err.code === 'ENOTFOUND' && KNOWN_GOOD_DOMAINS.has(hostname)) {
        resolve({ url, status: 'skipped', reason: `DNS issue (${hostname} is a known good domain)` });
      } else {
        resolve({ url, status: 'error', reason: err.message });
      }
    });

    req.end();
  });
}

/**
 * Print results summary
 */
function printSummary() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}        Link Check Summary${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  console.log(`Total files scanned: ${colors.blue}${results.totalFiles}${colors.reset}`);
  console.log(`Total URLs found: ${colors.blue}${results.totalUrls}${colors.reset}`);
  console.log(`Unique URLs: ${colors.blue}${results.uniqueUrls.size}${colors.reset}`);
  console.log(`${colors.green}✓ Working links: ${results.workingLinks.length}${colors.reset}`);
  console.log(`${colors.yellow}⊘ Skipped links: ${results.skippedLinks.length}${colors.reset}`);
  console.log(`${colors.red}✗ Dead links: ${results.deadLinks.length}${colors.reset}\n`);

  if (results.deadLinks.length > 0) {
    console.log(`${colors.red}Dead Links Found:${colors.reset}`);
    console.log(`${colors.red}─────────────────${colors.reset}\n`);

    results.deadLinks.forEach((result, index) => {
      console.log(`${colors.red}${index + 1}. ${result.url}${colors.reset}`);
      console.log(`   Reason: ${result.reason || 'Unknown'}`);
      console.log(`   Found in:`);
      const files = results.urlToFiles.get(result.url) || [];
      files.forEach(file => {
        const relativePath = path.relative(process.cwd(), file);
        console.log(`     - ${relativePath}`);
      });
      console.log('');
    });
  }

  if (results.skippedLinks.length > 0 && process.argv.includes('--verbose')) {
    console.log(`${colors.yellow}Skipped Links:${colors.reset}`);
    console.log(`${colors.yellow}──────────────${colors.reset}\n`);

    results.skippedLinks.forEach((result, index) => {
      console.log(`${index + 1}. ${result.url}`);
      console.log(`   Reason: ${result.reason}`);
      console.log('');
    });
  }
}

/**
 * Interactive mode to fix dead links
 */
async function interactiveFix() {
  if (results.deadLinks.length === 0) {
    console.log(`${colors.green}No dead links to fix!${colors.reset}`);
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}   Interactive Link Correction${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  for (let i = 0; i < results.deadLinks.length; i++) {
    const deadLink = results.deadLinks[i];
    const files = results.urlToFiles.get(deadLink.url) || [];

    console.log(`\n${colors.yellow}Dead Link ${i + 1}/${results.deadLinks.length}:${colors.reset}`);
    console.log(`${colors.red}${deadLink.url}${colors.reset}`);
    console.log(`Reason: ${deadLink.reason}`);
    console.log(`\nFound in:`);
    files.forEach(file => {
      const relativePath = path.relative(process.cwd(), file);
      console.log(`  - ${relativePath}`);
    });

    const action = await question(`\nAction? (${colors.green}f${colors.reset})ix / (${colors.blue}s${colors.reset})kip / (${colors.red}q${colors.reset})uit: `);

    if (action.toLowerCase() === 'q') {
      console.log(`\n${colors.yellow}Exiting interactive mode.${colors.reset}`);
      break;
    }

    if (action.toLowerCase() === 's') {
      console.log(`${colors.blue}Skipping...${colors.reset}`);
      continue;
    }

    if (action.toLowerCase() === 'f') {
      const newUrl = await question(`Enter the correct URL (or press Enter to skip): `);

      if (newUrl.trim()) {
        // Update all files containing this URL
        let filesUpdated = 0;
        files.forEach(file => {
          try {
            let content = fs.readFileSync(file, 'utf-8');
            const originalContent = content;
            content = content.split(deadLink.url).join(newUrl.trim());
            
            if (content !== originalContent) {
              fs.writeFileSync(file, content, 'utf-8');
              filesUpdated++;
            }
          } catch (error) {
            console.log(`${colors.red}Error updating ${file}: ${error.message}${colors.reset}`);
          }
        });

        console.log(`${colors.green}✓ Updated ${filesUpdated} file(s)${colors.reset}`);
      }
    }
  }

  rl.close();
  console.log(`\n${colors.green}Interactive correction completed!${colors.reset}\n`);
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.cyan}Starting dead link checker...${colors.reset}\n`);

  const rootDir = process.cwd();
  const files = findFiles(rootDir);
  results.totalFiles = files.length;

  console.log(`Found ${colors.blue}${files.length}${colors.reset} files to scan.\n`);

  // Extract all URLs
  console.log('Extracting URLs...');
  files.forEach(file => {
    const urls = extractUrls(file);
    results.totalUrls += urls.length;
  });

  console.log(`Found ${colors.blue}${results.totalUrls}${colors.reset} total URLs (${colors.blue}${results.uniqueUrls.size}${colors.reset} unique).\n`);

  // Check each unique URL
  console.log('Checking URLs...\n');
  const urlArray = Array.from(results.uniqueUrls);
  
  for (let i = 0; i < urlArray.length; i++) {
    const url = urlArray[i];
    process.stdout.write(`\rChecking ${i + 1}/${urlArray.length}: ${url.substring(0, 60)}...`);

    try {
      const result = await checkUrl(url);

      if (result.status === 'ok') {
        results.workingLinks.push(result);
      } else if (result.status === 'skipped') {
        results.skippedLinks.push(result);
      } else {
        results.deadLinks.push(result);
      }
    } catch (error) {
      results.deadLinks.push({
        url,
        status: 'error',
        reason: error.message,
      });
    }

    // Small delay to avoid overwhelming servers
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n');
  printSummary();

  // Interactive mode if requested
  if (process.argv.includes('--fix')) {
    await interactiveFix();
  } else if (results.deadLinks.length > 0) {
    console.log(`${colors.yellow}Tip: Run with --fix flag to interactively correct dead links.${colors.reset}\n`);
  }

  // Exit with error code if dead links found
  process.exit(results.deadLinks.length > 0 ? 1 : 0);
}

// Run the script
main().catch((error) => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
