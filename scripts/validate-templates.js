#!/usr/bin/env node

/**
 * Template Validation Script
 * Validates configuration templates for correctness and best practices
 */

const fs = require('fs');
const path = require('path');

// Configuration
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

/**
 * Validate JSON syntax
 */
function validateJSON(filePath, content) {
  try {
    JSON.parse(content);
    return { valid: true, issues: [] };
  } catch (error) {
    return {
      valid: false,
      issues: [`JSON syntax error: ${error.message}`]
    };
  }
}

/**
 * Validate .gitignore template
 */
function validateGitignore(filePath, content) {
  const issues = [];

  // Check for common issues
  const lines = content.split('\n');
  const nodeModulesLines = lines.filter(line => !line.trim().startsWith('#') && line.includes('node_modules'));
  if (nodeModulesLines.length > 1) {
    issues.push('Redundant node_modules entries');
  }

  if (!content.includes('# ')) {
    issues.push('No comments found - consider adding section headers');
  }

  // Check for generic placeholder patterns
  const hasGenericSensitives = lines.some(line => {
    const trimmed = line.trim();
    return !trimmed.startsWith('#') && (trimmed === 'secret' || trimmed === 'secrets' || trimmed === 'password' || trimmed === 'passwords' || trimmed === 'key' || trimmed === 'keys');
  });
  if (hasGenericSensitives) {
    issues.push('Consider adding more specific patterns for sensitive files');
  }

  return {
    valid: issues.length === 0,
    issues: issues
  };
}

/**
 * Validate EditorConfig template
 */
function validateEditorConfig(filePath, content) {
  const issues = [];

  if (!content.includes('root = true')) {
    issues.push('Missing "root = true" directive');
  }

  if (!content.includes('[*]')) {
    issues.push('Missing universal section [*]');
  }

  const requiredProperties = ['charset', 'end_of_line', 'insert_final_newline'];
  requiredProperties.forEach(prop => {
    if (!content.includes(prop)) {
      issues.push(`Missing recommended property: ${prop}`);
    }
  });

  return {
    valid: issues.length === 0,
    issues: issues
  };
}

/**
 * Validate VSCode settings
 */
function validateVSCodeSettings(filePath, content) {
  const jsonValidation = validateJSON(filePath, content);
  if (!jsonValidation.valid) {
    return jsonValidation;
  }

  const issues = [];

  try {
    const settings = JSON.parse(content);

    // Check for common settings
    const recommendedSettings = [
      'editor.formatOnSave',
      'editor.tabSize',
      'files.autoSave'
    ];

    recommendedSettings.forEach(setting => {
      if (!(setting in settings)) {
        issues.push(`Consider adding recommended setting: ${setting}`);
      }
    });

    // Check for deprecated settings
    const deprecatedSettings = [
      'workbench.useExperimentalGridLayout',
      'editor.formatOnSaveTimeout'
    ];

    deprecatedSettings.forEach(setting => {
      if (setting in settings) {
        issues.push(`Deprecated setting found: ${setting}`);
      }
    });

  } catch (error) {
    issues.push(`Error parsing JSON: ${error.message}`);
  }

  return {
    valid: issues.length === 0,
    issues: issues
  };
}

/**
 * Validate file encoding and line endings
 */
function validateFileFormat(filePath, content) {
  const issues = [];

  // Check for BOM
  if (content.charCodeAt(0) === 0xFEFF) {
    issues.push('File contains BOM - consider removing for better compatibility');
  }

  // Check line endings
  const hasLF = content.includes('\n');
  const hasCRLF = content.includes('\r\n');

  if (hasCRLF && hasLF) {
    issues.push('Mixed line endings detected - standardize to LF');
  }

  // Check for trailing whitespace
  const lines = content.split('\n');
  const trailingWhitespaceLines = lines
    .map((line, index) => ({ line: line, number: index + 1 }))
    .filter(item => item.line.endsWith(' ') || item.line.endsWith('\t'))
    .slice(0, 5); // Show only first 5 occurrences

  if (trailingWhitespaceLines.length > 0) {
    issues.push(`Trailing whitespace found on lines: ${trailingWhitespaceLines.map(item => item.number).join(', ')}`);
  }

  return {
    valid: issues.length === 0,
    issues: issues
  };
}

/**
 * Validate a single template file
 */
function validateTemplate(filePath) {
  console.log(`\n🔍 Validating: ${path.relative(TEMPLATES_DIR, filePath)}`);

  if (!fs.existsSync(filePath)) {
    console.log('❌ File does not exist');
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const fileExt = path.extname(filePath);

  // File format validation
  const formatValidation = validateFileFormat(filePath, content);

  // Type-specific validation
  let typeValidation = { valid: true, issues: [] };

  if (fileName.includes('gitignore')) {
    typeValidation = validateGitignore(filePath, content);
  } else if (fileName.includes('editorconfig')) {
    typeValidation = validateEditorConfig(filePath, content);
  } else if (fileExt === '.json') {
    if (fileName.includes('settings')) {
      typeValidation = validateVSCodeSettings(filePath, content);
    } else {
      typeValidation = validateJSON(filePath, content);
    }
  }

  // Report results
  const allIssues = [...formatValidation.issues, ...typeValidation.issues];

  if (allIssues.length === 0) {
    console.log('✅ No issues found');
    return true;
  } else {
    console.log(`⚠️ ${allIssues.length} issue(s) found:`);
    allIssues.forEach(issue => {
      console.log(`   • ${issue}`);
    });
    return typeValidation.valid && formatValidation.valid;
  }
}

/**
 * Find all template files
 */
function findTemplateFiles(dir) {
  const files = [];

  if (!fs.existsSync(dir)) {
    console.log(`⚠️ Templates directory not found: ${dir}`);
    return files;
  }

  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);

    items.forEach(item => {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        scanDirectory(itemPath);
      } else if (stat.isFile()) {
        // Include template files and configuration files
        const isTemplate = item.includes('template') ||
                          item.includes('.gitignore') ||
                          item.includes('.editorconfig') ||
                          item.endsWith('.json');

        if (isTemplate) {
          files.push(itemPath);
        }
      }
    });
  }

  scanDirectory(dir);
  return files;
}

/**
 * Generate validation report
 */
function generateReport(results) {
  console.log('\n📊 Validation Report');
  console.log('==================');

  const totalFiles = results.length;
  const validFiles = results.filter(r => r.valid).length;
  const invalidFiles = totalFiles - validFiles;

  console.log(`Total files validated: ${totalFiles}`);
  console.log(`Valid files: ${validFiles} ✅`);
  console.log(`Files with issues: ${invalidFiles} ${invalidFiles > 0 ? '⚠️' : ''}`);

  if (invalidFiles > 0) {
    console.log('\nFiles with issues:');
    results
      .filter(r => !r.valid)
      .forEach(r => {
        console.log(`  • ${path.relative(TEMPLATES_DIR, r.file)}`);
      });
  }

  const successRate = ((validFiles / totalFiles) * 100);
  console.log(`\nSuccess rate: ${successRate.toFixed(1)}%`);

  if (successRate === 100) {
    console.log('\n🎉 All templates are valid!');
  } else if (successRate >= 80) {
    console.log('\n👍 Most templates are valid, minor issues found');
  } else {
    console.log('\n⚠️ Several issues found, please review templates');
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Starting template validation...');

  const templateFiles = findTemplateFiles(TEMPLATES_DIR);

  if (templateFiles.length === 0) {
    console.log('❌ No template files found to validate');
    process.exit(1);
  }

  console.log(`📁 Found ${templateFiles.length} template file(s) to validate`);

  const results = templateFiles.map(file => ({
    file: file,
    valid: validateTemplate(file)
  }));

  generateReport(results);

  const allValid = results.every(r => r.valid);
  process.exit(allValid ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  validateTemplate,
  findTemplateFiles,
  main
};