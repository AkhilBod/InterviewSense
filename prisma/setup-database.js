// Setup database for Vercel deployment
const { exec } = require('child_process');

// Run prisma migrate deploy
exec('npx prisma migrate deploy', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error running migrations: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Migration stderr: ${stderr}`);
    return;
  }
  console.log(`Migration stdout: ${stdout}`);
});
