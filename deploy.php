<?php
/**
 * Simple Deployment Script via Browser
 * Access: https://www.rhcursos.com.br/deploy.php?key=prod2026
 *
 * NO token validation - direct execution
 */

// Simple security check
$secret_key = $_GET['key'] ?? '';
if ($secret_key !== 'prod2026') {
    http_response_code(403);
    die('Access denied. Invalid or missing key.');
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>RH Cursos - Deployment</title>
    <style>
        body { font-family: monospace; background: #f4f4f4; padding: 20px; }
        pre { background: #fff; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .success { color: green; }
        .error { color: red; }
        .info { color: blue; }
    </style>
</head>
<body>
    <h1>🚀 RH Cursos - Deployment</h1>
    <pre>
<?php

// Get current directory (should be /home/rhcursos2/public_html)
$cwd = getcwd();
echo "Current Directory: $cwd\n\n";

// Step 1: Check Node.js
echo "=== Step 1: Check Node.js ===\n";
if (file_exists('.node/bin/node')) {
    $node_version = shell_exec('./.node/bin/node --version 2>&1');
    echo "✅ Node.js found: " . trim($node_version) . "\n";
} else {
    echo "❌ Node.js not found. Installing...\n";
    $output = shell_exec('bash install-node.sh 2>&1');
    echo $output;

    if (file_exists('.node/bin/node')) {
        $node_version = shell_exec('./.node/bin/node --version 2>&1');
        echo "✅ Node.js installed: " . trim($node_version) . "\n";
    } else {
        echo "❌ Failed to install Node.js\n";
        die();
    }
}

echo "\n";

// Step 2: Install dependencies
echo "=== Step 2: Install Dependencies ===\n";
$output = shell_exec('./.node/bin/npm ci --only=production 2>&1');
echo $output;

echo "\n";

// Step 3: Check build
echo "=== Step 3: Check Build ===\n";
if (is_dir('.next')) {
    echo "✅ Build found (.next directory exists)\n";
} else {
    echo "⚠️  Build not found. Building now...\n";
    $output = shell_exec('./.node/bin/npm run build 2>&1');
    echo $output;
}

echo "\n";

// Step 4: Start application
echo "=== Step 4: Start Application ===\n";
echo "Starting: npm start\n";

// Run in background
shell_exec('nohup ./.node/bin/npm start > /tmp/app.log 2>&1 &');

sleep(2);

// Check if process is running
$ps_output = shell_exec('ps aux | grep "npm start" | grep -v grep');
if (!empty($ps_output)) {
    echo "<span class='success'>✅ Application started successfully!</span>\n";
    echo "Process:\n" . trim($ps_output) . "\n";
} else {
    echo "<span class='error'>⚠️  Application process not found. Check logs.</span>\n";
}

echo "\n<span class='success'>✅ Deployment Complete!</span>\n";
echo "Access the application: https://www.rhcursos.com.br\n";
echo "View logs: tail -f /tmp/app.log\n";

?>
    </pre>
</body>
</html>
