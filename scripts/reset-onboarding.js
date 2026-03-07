/**
 * Reset onboarding script
 * Run this in the browser console OR call via: node scripts/reset-onboarding.js
 *
 * For browser console, paste:
 *   fetch('/api/onboarding/reset', { method: 'POST' }).then(r => r.json()).then(console.log);
 *   localStorage.removeItem('onboarding_dashboard');
 *   localStorage.removeItem('onboarding_behavioral');
 *   localStorage.removeItem('onboarding_technical');
 *   localStorage.removeItem('onboarding_system_design');
 */

const BASE = process.env.NEXTAUTH_URL || 'http://localhost:3000';

async function main() {
  console.log('Resetting onboarding state via API...');
  try {
    const res = await fetch(`${BASE}/api/onboarding/reset`, { method: 'POST' });
    const data = await res.json();
    console.log('API response:', data);
    console.log('\nDone! Now clear browser localStorage by running in the console:');
    console.log(`  localStorage.removeItem('onboarding_dashboard');`);
    console.log(`  localStorage.removeItem('onboarding_behavioral');`);
    console.log(`  localStorage.removeItem('onboarding_technical');`);
    console.log(`  localStorage.removeItem('onboarding_system_design');`);
  } catch (e) {
    console.error('Failed:', e);
  }
}

main();
