<?php
/**
 * Setup script for Node.js installation and application start
 * Access via: https://www.rhcursos.com.br/setup.php
 */

// Simple security check - token valid for today
$allowed_token = 'setup-' . date('Y-m-d');
$provided_token = $_GET['token'] ?? '';

if ($provided_token !== $allowed_token) {
    http_response_code(403);
    echo "❌ Access denied. Invalid or missing token.\n";
    echo "Expected token format: setup-YYYY-MM-DD\n";
    die();
}

echo "<pre style='font-family: monospace; background: #f4f4f4; padding: 10px; white-space: pre-wrap;'>\n";
echo "🚀 Starting Node.js setup and application deployment...\n\n";

// Change to app directory (parent of public)
$app_dir = dirname(__DIR__);
chdir($app_dir);

echo "Current directory: " . getcwd() . "\n\n";

// Step 1: Install Node.js
echo "📦 Step 1: Installing Node.js 24...\n";
$output = shell_exec('bash install-node.sh 2>&1');
echo $output;

// Step 2: Install dependencies
echo "\n📚 Step 2: Installing dependencies...\n";
$output = shell_exec('./.node/bin/npm ci --only=production 2>&1');
echo $output;

// Step 3: Start application
echo "\n▶️  Step 3: Starting application in background...\n";
shell_exec('./.node/bin/npm start > /tmp/app.log 2>&1 &');
sleep(2);

// Check if process started
$ps_output = shell_exec('ps aux | grep "npm start" | grep -v grep');
if (!empty($ps_output)) {
    echo "✅ Application is running!\n";
    echo "Process:\n" . $ps_output . "\n";
} else {
    echo "⚠️  Application process not found. Check /tmp/app.log for errors.\n";
}

echo "\n✅ Setup complete!\n";
echo "Access the application at: https://www.rhcursos.com.br\n";
echo "\n🔒 For security, delete this file after setup:\n";
echo "   rm public/setup.php\n";
echo "</pre>\n";
?>
