import { execSync } from 'child_process';
import { unlinkSync, existsSync } from 'fs';

console.log('Regenerating pnpm lockfile...');

try {
  // Remove old lockfile if it exists
  if (existsSync('/vercel/share/v0-project/pnpm-lock.yaml')) {
    unlinkSync('/vercel/share/v0-project/pnpm-lock.yaml');
    console.log('Removed old lockfile');
  }

  // Run pnpm install to generate new lockfile
  console.log('Running pnpm install...');
  execSync('pnpm install', {
    cwd: '/vercel/share/v0-project',
    stdio: 'inherit'
  });

  console.log('✓ Lockfile regenerated successfully!');
} catch (error) {
  console.error('Error regenerating lockfile:', error.message);
  process.exit(1);
}
