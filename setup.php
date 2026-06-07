<?php
/**
 * Setup script for Node.js installation and application start
 * Access via: https://www.rhcursos.com.br/setup.php
 * Security: Single-use token validation (remove after execution)
 */

// Simple security check - use a token from environment or hardcode temporarily
$allowed_tokens = ['setup-' . date('Y-m-d')]; // Token valid for today only
$provided_token = $_GET['token'] ?? '';

if (!in_array($provided_token, $allowed_tokens)) {
    http_response_code(403);
    die('❌ Access denied. Invalid or missing token.');
}

echo "<pre style='font-family: monospace; background: #f4f4f4; padding: 10px;'>\n";
echo "🚀 Starting Node.js setup and application deployment...\n\n";

$output = [];
$return_var = 0;

// Change to app directory
chdir(__DIR__);

// Step 1: Install Node.js
echo "📦 Step 1: Installing Node.js 24...\n";
exec('bash install-node.sh 2>&1', $output, $return_var);
foreach ($output as $line) {
    echo $line . "\n";
}
if ($return_var !== 0) {
    echo "❌ Node.js installation failed with exit code $return_var\n";
    die('</pre>');
}

$output = [];
echo "\n📚 Step 2: Installing dependencies...\n";
exec('./.node/bin/npm ci --only=production 2>&1', $output, $return_var);
foreach ($output as $line) {
    echo $line . "\n";
}
if ($return_var !== 0) {
    echo "❌ npm ci failed with exit code $return_var\n";
    die('</pre>');
}

$output = [];
echo "\n▶️  Step 3: Starting application in background...\n";
exec('./.node/bin/npm start > /tmp/app.log 2>&1 &', $output, $return_var);
echo "Application started in background\n";
echo "Logs available at: /tmp/app.log\n";

// Verify process started
sleep(2);
exec('ps aux | grep "npm start" | grep -v grep', $ps_output);
if (!empty($ps_output)) {
    echo "\n✅ Application is running!\n";
    echo "Process: " . $ps_output[0] . "\n";
} else {
    echo "\n⚠️  Application process not found. Check /tmp/app.log for errors.\n";
}

echo "\n✅ Setup complete!\n";
echo "Access the application at: https://www.rhcursos.com.br\n";
echo "\n🔒 For security, delete this file after setup:\n";
echo "   rm setup.php\n";
echo "</pre>\n";
?>
