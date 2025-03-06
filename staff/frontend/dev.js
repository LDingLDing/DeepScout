const { execSync } = require('child_process');
const port = process.env.STAFF_FRONTEND_PORT || 3002;

console.log(`Starting frontend development server on port ${port}...`);
execSync(`next dev -p ${port}`, { stdio: 'inherit' });
