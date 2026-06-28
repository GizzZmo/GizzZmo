#!/usr/bin/env node

/**
 * README Update Script
 * Automatically updates dynamic content in README.md
 */

const fs = require('fs');
const path = require('path');

// Configuration
const README_PATH = path.join(__dirname, '..', 'README.md');
const GITHUB_API = 'https://api.github.com';

/**
 * Update the date placeholder in README
 */
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

    // Replace the date placeholder
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

/**
 * Validate README structure
 */
function validateReadme() {
  console.log('🔍 Validating README structure...');

  try {
    const readmeContent = fs.readFileSync(README_PATH, 'utf8');

    // Check for required sections
    const requiredSections = [
      '## 📖 Introduction',
      '## ✨ Features',
      '## 🛠️ Tech Stack & Skills',
      '## 🚀 Usage',
      '## 🌟 Future Plans',
      '## 🤝 Connect With Me'
    ];

    let allSectionsPresent = true;
    requiredSections.forEach(section => {
      if (!readmeContent.includes(section)) {
        console.log(`❌ Missing section: ${section}`);
        allSectionsPresent = false;
      }
    });

    if (allSectionsPresent) {
      console.log('✅ All required sections present');
    }

    // Check README length
    const wordCount = readmeContent.split(/\s+/).length;
    console.log(`📊 README stats: ${wordCount} words, ${readmeContent.length} characters`);

    if (wordCount < 100) {
      console.log('⚠️ README might be too short');
    } else if (wordCount > 2000) {
      console.log('⚠️ README might be too long - consider breaking into sections');
    } else {
      console.log('✅ README length is appropriate');
    }

    return allSectionsPresent;
  } catch (error) {
    console.error('❌ Error validating README:', error.message);
    return false;
  }
}

/**
 * Check for broken links in README
 */
function checkLinks() {
  console.log('🔗 Checking for potential link issues...');

  try {
    const readmeContent = fs.readFileSync(README_PATH, 'utf8');

    // Find all markdown links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [];
    let match;

    while ((match = linkRegex.exec(readmeContent)) !== null) {
      links.push({
        text: match[1],
        url: match[2]
      });
    }

    console.log(`📊 Found ${links.length} links in README`);

    // Check for common issues
    links.forEach(link => {
      if (link.url.includes('localhost') || link.url.includes('127.0.0.1')) {
        console.log(`⚠️ Potential localhost link: ${link.text} -> ${link.url}`);
      }
      if (link.url.includes('example.com') || link.url.includes('placeholder')) {
        console.log(`⚠️ Potential placeholder link: ${link.text} -> ${link.url}`);
      }
    });

    console.log('✅ Link check completed');
    return true;
  } catch (error) {
    console.error('❌ Error checking links:', error.message);
    return false;
  }
}

/**
 * Main function
 */
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

  const allSuccessful = Object.values(results).every(result => result);

  if (allSuccessful) {
    console.log('\n🎉 README update completed successfully!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some issues were found during README update');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  updateDate,
  validateReadme,
  checkLinks,
  main
};