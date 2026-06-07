#!/usr/bin/env node
/**
 * Custom Next.js server with automatic Node.js setup
 * Runs on first start and handles dependencies installation
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NODE_DIR = path.join(__dirname, '.node');
const NODE_BIN = path.join(NODE_DIR, 'bin', 'node');
const NPM_BIN = path.join(NODE_DIR, 'bin', 'npm');

function log(msg) {
  console.log(`[SETUP] ${new Date().toISOString()} ${msg}`);
}

function nodeExists() {
  return fs.existsSync(NODE_BIN);
}

function installNode() {
  log('Node.js not found. Installing...');

  if (!fs.existsSync(NODE_DIR)) {
    fs.mkdirSync(NODE_DIR, { recursive: true });
  }

  try {
    const nodeVersion = 'v24.9.0';
    const nodeUrl = `https://nodejs.org/dist/${nodeVersion}/node-${nodeVersion}-linux-x64.tar.xz`;
    const tarFile = path.join(NODE_DIR, 'node.tar.xz');

    log(`Downloading Node.js from ${nodeUrl}...`);
    execSync(`curl -fsSL "${nodeUrl}" -o "${tarFile}"`, { stdio: 'inherit' });

    log('Extracting Node.js...');
    execSync(`cd "${NODE_DIR}" && tar -xf node.tar.xz`, { stdio: 'inherit' });

    // Move files up one level
    const extractedDir = path.join(NODE_DIR, `node-${nodeVersion}-linux-x64`);
    if (fs.existsSync(extractedDir)) {
      const files = fs.readdirSync(extractedDir);
      files.forEach(file => {
        const src = path.join(extractedDir, file);
        const dst = path.join(NODE_DIR, file);
        execSync(`mv "${src}" "${dst}"`, { stdio: 'inherit' });
      });
      fs.rmSync(extractedDir, { recursive: true });
    }

    fs.unlinkSync(tarFile);
    log('✅ Node.js installed successfully');
  } catch (error) {
    log(`❌ Failed to install Node.js: ${error.message}`);
    process.exit(1);
  }
}

function installDependencies() {
  log('Installing npm dependencies...');
  try {
    const cmd = `"${NPM_BIN}" ci --only=production`;
    execSync(cmd, {
      stdio: 'inherit',
      cwd: __dirname,
      env: { ...process.env, PATH: `${path.join(NODE_DIR, 'bin')}:${process.env.PATH}` }
    });
    log('✅ Dependencies installed');
  } catch (error) {
    log(`❌ Failed to install dependencies: ${error.message}`);
    process.exit(1);
  }
}

function startApplication() {
  log('Starting Next.js application...');

  try {
    // Check if .next directory exists (built app)
    if (!fs.existsSync(path.join(__dirname, '.next'))) {
      log('⚠️  .next directory not found. Building application...');
      const buildCmd = `"${NPM_BIN}" run build`;
      execSync(buildCmd, {
        stdio: 'inherit',
        cwd: __dirname,
        env: { ...process.env, PATH: `${path.join(NODE_DIR, 'bin')}:${process.env.PATH}` }
      });
    }

    // Start the application
    const startCmd = `"${NPM_BIN}" start`;
    execSync(startCmd, {
      stdio: 'inherit',
      cwd: __dirname,
      env: { ...process.env, PATH: `${path.join(NODE_DIR, 'bin')}:${process.env.PATH}` }
    });
  } catch (error) {
    log(`Application exited: ${error.message}`);
    process.exit(1);
  }
}

// Main execution
log('🚀 Starting application setup...');

if (!nodeExists()) {
  installNode();
}

log(`Node.js version: ${execSync(`"${NODE_BIN}" --version`).toString().trim()}`);
log(`npm version: ${execSync(`"${NPM_BIN}" --version`).toString().trim()}`);

installDependencies();
startApplication();
