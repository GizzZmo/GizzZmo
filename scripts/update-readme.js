#!/usr/bin/env node

/**
 * README Update Script
 * Updates only dynamic markers in README.md — does not rewrite curated content.
 */

const fs = require('fs');
const path = require('path');

const README_PATH = path.join(__dirname, '..', 'README.md');

function updateDate() {
  console.log('📅 Updating date in README...');

  try {
    let readmeContent = fs.readFileSync(README_PATH, 'utf8');
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short'
    });

    if (!readmeContent.includes('<!-- DYNAMIC_DATE -->')) {
      console.log('⚠️ DYNAMIC_DATE markers not found — skipping');
      return true;
    }

    readmeContent = readmeContent.replace(
      /<!-- DYNAMIC_DATE -->.*?<!-- \/DYNAMIC_DATE -->/s,
      `<!-- DYNAMIC_DATE -->${currentDate}<!-- /DYNAMIC_DATE -->`
    );

    fs.writeFileSync(README_PATH, readmeContent);
    console.log('✅ Date updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error updating date:', error.message);
    return false;
  }
}

function validateReadme() {
  console.log('🔍 Validating README structure...');

  try {
    const readmeContent = fs.readFileSync(README_PATH, 'utf8');

    // Markers required for automation (curated README relies on these)
    const requiredMarkers = [
      '<!-- DYNAMIC_DATE -->',
      '<!-- STATS_BADGES_START -->',
      '<!-- STATS_BADGES_END -->',
      '<!-- DYNAMIC_REPOS_START -->',
      '<!-- DYNAMIC_REPOS_END -->',
      '<!-- REPO_INDEX_START -->',
      '<!-- REPO_INDEX_END -->'
    ];

    let ok = true;
    requiredMarkers.forEach((marker) => {
      if (!readmeContent.includes(marker)) {
        console.log(`❌ Missing marker: ${marker}`);
        ok = false;
      } else {
        console.log(`✅ ${marker}`);
      }
    });

    // Soft checks for curated identity (do not fail the job)
    const softSections = ['Who I am', 'Flagship projects', 'Connect'];
    softSections.forEach((s) => {
      if (!readmeContent.includes(s)) {
        console.log(`⚠️ Soft section missing: ${s}`);
      }
    });

    const wordCount = readmeContent.split(/\s+/).length;
    console.log(`📊 README: ${wordCount} words, ${readmeContent.length} characters`);

    if (readmeContent.length > 200000) {
      console.log('⚠️ README is very large');
    }

    return ok;
  } catch (error) {
    console.error('❌ Error validating README:', error.message);
    return false;
  }
}

function checkLinks() {
  console.log('🔗 Checking for potential link issues...');

  try {
    const readmeContent = fs.readFileSync(README_PATH, 'utf8');
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [];
    let match;

    while ((match = linkRegex.exec(readmeContent)) !== null) {
      links.push({ text: match[1], url: match[2] });
    }

    console.log(`📊 Found ${links.length} links in README`);

    links.forEach((link) => {
      if (link.url.includes('localhost') || link.url.includes('127.0.0.1')) {
        console.log(`⚠️ localhost link: ${link.text} -> ${link.url}`);
      }
      if (link.url.includes('example.com') || link.url.includes('placeholder')) {
        console.log(`⚠️ placeholder link: ${link.text} -> ${link.url}`);
      }
    });

    console.log('✅ Link check completed');
    return true;
  } catch (error) {
    console.error('❌ Error checking links:', error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Starting README update process...\n');

  const results = {
    dateUpdate: updateDate(),
    validation: validateReadme(),
    linkCheck: checkLinks()
  };

  console.log('\n📊 Update Summary:');
  console.log(`Date update: ${results.dateUpdate ? '✅' : '❌'}`);
  console.log(`Validation: ${results.validation ? '✅' : '❌'}`);
  console.log(`Link check: ${results.linkCheck ? '✅' : '❌'}`);

  const allSuccessful = Object.values(results).every(Boolean);

  if (allSuccessful) {
    console.log('\n🎉 README update completed successfully!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some issues were found during README update');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  updateDate,
  validateReadme,
  checkLinks,
  main
};
