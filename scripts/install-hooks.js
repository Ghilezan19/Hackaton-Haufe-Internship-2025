#!/usr/bin/env node

/**
 * Install git pre-commit hook
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const GIT_HOOKS_DIR = path.join(process.cwd(), '.git', 'hooks');
const PRE_COMMIT_HOOK = path.join(GIT_HOOKS_DIR, 'pre-commit');
const REVIEW_SCRIPT = path.join(process.cwd(), 'scripts', 'pre-commit-review.js');

// Pre-commit hook content
const hookContent = `#!/bin/sh
# Lintora Pre-commit Hook
# Runs AI code review on staged files

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js not found. Skipping pre-commit review."
    exit 0
fi

# Run the pre-commit review script
node "${REVIEW_SCRIPT.replace(/\\/g, '/')}"
`;

function installHook() {
  console.log(`${colors.cyan}🚀 Installing Lintora Pre-commit Hook...${colors.reset}\n`);

  // Check if .git exists
  if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
    console.error(`${colors.red}❌ Not a git repository!${colors.reset}`);
    console.log(`${colors.yellow}   Run 'git init' first.${colors.reset}\n`);
    process.exit(1);
  }

  // Check if review script exists
  if (!fs.existsSync(REVIEW_SCRIPT)) {
    console.error(`${colors.red}❌ Review script not found!${colors.reset}`);
    console.log(`${colors.yellow}   Expected: ${REVIEW_SCRIPT}${colors.reset}\n`);
    process.exit(1);
  }

  // Create hooks directory if it doesn't exist
  if (!fs.existsSync(GIT_HOOKS_DIR)) {
    fs.mkdirSync(GIT_HOOKS_DIR, { recursive: true });
  }

  // Backup existing hook if present
  if (fs.existsSync(PRE_COMMIT_HOOK)) {
    const backupPath = `${PRE_COMMIT_HOOK}.backup`;
    fs.copyFileSync(PRE_COMMIT_HOOK, backupPath);
    console.log(`${colors.yellow}⚠️  Existing hook backed up to: ${backupPath}${colors.reset}`);
  }

  // Write new hook
  fs.writeFileSync(PRE_COMMIT_HOOK, hookContent, { mode: 0o755 });

  // Make hook executable (Unix/Mac)
  if (process.platform !== 'win32') {
    fs.chmodSync(PRE_COMMIT_HOOK, 0o755);
  }

  console.log(`${colors.green}✅ Pre-commit hook installed successfully!${colors.reset}\n`);
  console.log(`${colors.cyan}📝 How it works:${colors.reset}`);
  console.log(`   • Runs automatically before each commit`);
  console.log(`   • Reviews staged code files with AI`);
  console.log(`   • Blocks commit if critical issues found`);
  console.log(`   • Warns about high severity issues\n`);
  
  console.log(`${colors.cyan}💡 Tips:${colors.reset}`);
  console.log(`   • Backend must be running (${colors.yellow}cd backend && npm run dev${colors.reset})`);
  console.log(`   • To bypass: ${colors.yellow}git commit --no-verify${colors.reset}`);
  console.log(`   • To uninstall: ${colors.yellow}npm run uninstall-hooks${colors.reset}\n`);

  console.log(`${colors.cyan}🔧 Configuration:${colors.reset}`);
  console.log(`   • API URL: ${colors.yellow}http://localhost:3000/api${colors.reset} (default)`);
  console.log(`   • Set custom URL: ${colors.yellow}export API_URL=http://...${colors.reset}`);
  console.log(`   • Set auth token: ${colors.yellow}export LINTORA_TOKEN=your_token${colors.reset}\n`);
}

function uninstallHook() {
  console.log(`${colors.cyan}🗑️  Uninstalling Lintora Pre-commit Hook...${colors.reset}\n`);

  if (!fs.existsSync(PRE_COMMIT_HOOK)) {
    console.log(`${colors.yellow}⚠️  No hook found to uninstall.${colors.reset}\n`);
    process.exit(0);
  }

  // Remove hook
  fs.unlinkSync(PRE_COMMIT_HOOK);

  // Restore backup if exists
  const backupPath = `${PRE_COMMIT_HOOK}.backup`;
  if (fs.existsSync(backupPath)) {
    fs.renameSync(backupPath, PRE_COMMIT_HOOK);
    console.log(`${colors.green}✅ Previous hook restored from backup.${colors.reset}\n`);
  } else {
    console.log(`${colors.green}✅ Pre-commit hook uninstalled.${colors.reset}\n`);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'uninstall') {
  uninstallHook();
} else {
  installHook();
}

