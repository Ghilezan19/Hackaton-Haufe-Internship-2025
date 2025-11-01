#!/usr/bin/env node

/**
 * Pre-commit code review script
 * Runs AI code review on staged files before commit
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
const AUTH_TOKEN = process.env.LINTORA_TOKEN || '';

// Get staged files
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
    });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error(`${colors.red}Error getting staged files:${colors.reset}`, error.message);
    return [];
  }
}

// Check if file is a code file
function isCodeFile(filename) {
  const codeExtensions = [
    '.js', '.jsx', '.ts', '.tsx',
    '.py', '.java', '.c', '.cpp', '.h', '.hpp',
    '.cs', '.php', '.rb', '.go', '.rs',
    '.swift', '.kt', '.scala'
  ];
  const ext = path.extname(filename).toLowerCase();
  return codeExtensions.includes(ext);
}

// Detect language from file extension
function detectLanguage(filename) {
  const ext = path.extname(filename).toLowerCase();
  const langMap = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.java': 'java',
    '.c': 'c',
    '.cpp': 'cpp',
    '.h': 'cpp',
    '.hpp': 'cpp',
    '.cs': 'csharp',
    '.php': 'php',
    '.rb': 'ruby',
    '.go': 'go',
    '.rs': 'rust',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.scala': 'scala',
  };
  return langMap[ext] || 'javascript';
}

// Review code using API
async function reviewCode(code, language, filename) {
  try {
    const response = await fetch(`${API_BASE_URL}/review/code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(AUTH_TOKEN ? { 'Authorization': `Bearer ${AUTH_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        code,
        language,
        analysisTypes: ['security', 'quality'],
        filename,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Review failed');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`API Error: ${error.message}`);
  }
}

// Display findings
function displayFindings(filename, results) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}📄 ${filename}${colors.reset}`);
  console.log(`${colors.gray}Score: ${results.summary.overallScore}/100${colors.reset}`);
  
  if (results.summary.totalFindings === 0) {
    console.log(`${colors.green}✅ No issues found!${colors.reset}`);
    return { critical: 0, high: 0, medium: 0 };
  }

  let counts = { critical: 0, high: 0, medium: 0 };
  
  results.findings.forEach(finding => {
    const icon = finding.severity === 'critical' || finding.severity === 'high' ? '🔴' : 
                 finding.severity === 'medium' ? '🟡' : '🔵';
    
    console.log(`\n${icon} ${colors.yellow}Line ${finding.lineStart || '?'}${colors.reset}: ${finding.description}`);
    console.log(`   ${colors.gray}💡 ${finding.recommendation}${colors.reset}`);
    
    if (finding.severity === 'critical') counts.critical++;
    else if (finding.severity === 'high') counts.high++;
    else if (finding.severity === 'medium') counts.medium++;
  });

  return counts;
}

// Main function
async function main() {
  console.log(`${colors.cyan}🚀 Lintora Pre-commit Review${colors.reset}\n`);

  // Check if backend is running
  try {
    const healthCheck = await fetch(`${API_BASE_URL}/health`);
    if (!healthCheck.ok) {
      throw new Error('Backend not responding');
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Backend not running. Skipping pre-commit review.${colors.reset}`);
    console.log(`${colors.gray}   Start backend with: cd backend && npm run dev${colors.reset}\n`);
    process.exit(0); // Don't block commit if backend is down
  }

  // Get staged files
  const stagedFiles = getStagedFiles();
  const codeFiles = stagedFiles.filter(isCodeFile);

  if (codeFiles.length === 0) {
    console.log(`${colors.gray}No code files to review.${colors.reset}\n`);
    process.exit(0);
  }

  console.log(`${colors.blue}📝 Reviewing ${codeFiles.length} file(s)...${colors.reset}\n`);

  let totalCritical = 0;
  let totalHigh = 0;
  let totalMedium = 0;
  let reviewedFiles = 0;

  for (const file of codeFiles) {
    try {
      // Read file content
      const code = fs.readFileSync(file, 'utf-8');
      const language = detectLanguage(file);

      // Skip if file is too large (> 1000 lines)
      const lineCount = code.split('\n').length;
      if (lineCount > 1000) {
        console.log(`${colors.yellow}⚠️  Skipping ${file} (too large: ${lineCount} lines)${colors.reset}`);
        continue;
      }

      // Review code
      const results = await reviewCode(code, language, file);
      const counts = displayFindings(file, results);
      
      totalCritical += counts.critical;
      totalHigh += counts.high;
      totalMedium += counts.medium;
      reviewedFiles++;

    } catch (error) {
      console.log(`${colors.yellow}⚠️  Could not review ${file}: ${error.message}${colors.reset}`);
    }
  }

  // Summary
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}📊 Review Summary${colors.reset}`);
  console.log(`   Files reviewed: ${reviewedFiles}`);
  console.log(`   ${colors.red}Critical: ${totalCritical}${colors.reset}`);
  console.log(`   ${colors.yellow}High: ${totalHigh}${colors.reset}`);
  console.log(`   ${colors.gray}Medium: ${totalMedium}${colors.reset}`);

  // Decide whether to block commit
  if (totalCritical > 0) {
    console.log(`\n${colors.red}❌ COMMIT BLOCKED!${colors.reset}`);
    console.log(`${colors.red}   Critical issues must be fixed before committing.${colors.reset}`);
    console.log(`${colors.gray}   To commit anyway, use: git commit --no-verify${colors.reset}\n`);
    process.exit(1);
  } else if (totalHigh > 0) {
    console.log(`\n${colors.yellow}⚠️  WARNING: High severity issues found!${colors.reset}`);
    console.log(`${colors.yellow}   Consider fixing before committing.${colors.reset}`);
    console.log(`${colors.gray}   Allowing commit to proceed...${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.green}✅ All checks passed! Proceeding with commit.${colors.reset}\n`);
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error(`${colors.red}Error:${colors.reset}`, error.message);
    console.log(`${colors.gray}Allowing commit to proceed...${colors.reset}\n`);
    process.exit(0); // Don't block commit on script errors
  });
}

module.exports = { getStagedFiles, isCodeFile, detectLanguage, reviewCode };

