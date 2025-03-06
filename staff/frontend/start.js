const { execSync } = require('child_process');
const port = process.env.STAFF_FRONTEND_PORT || 3002;

console.log(`Starting frontend production server on port ${port}...`);
execSync(`next start -p ${port}`, { stdio: 'inherit' });
