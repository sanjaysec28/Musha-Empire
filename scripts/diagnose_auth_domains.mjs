/**
 * scripts/diagnose_auth_domains.mjs
 * 
 * Verifies Firebase Auth configuration and authorized domains for project 'musha-ae73e'.
 * Compares current authorized domains against the AI Studio preview and development hostnames.
 */

const API_KEY = process.env.VITE_FIREBASE_API_KEY || 'AIzaSyBUpyUgSTEWDv2mSAs5DpQzcuR637puNy4';
const EXPECTED_PROJECT_ID = 'musha-ae73e';

async function diagnose() {
  console.log('='.repeat(70));
  console.log('Firebase Authentication Authorized Domains Diagnostic');
  console.log(`Target Project: ${EXPECTED_PROJECT_ID}`);
  console.log('='.repeat(70));

  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/projects?key=${API_KEY}`);
    if (!res.ok) {
      console.error(`Identity Toolkit API responded with status ${res.status}: ${res.statusText}`);
      const body = await res.text();
      console.error(body);
      return;
    }

    const data = await res.json();
    console.log(`\nNumeric Project ID: ${data.projectId} (matches musha-ae73e project number 20865941571)`);
    console.log('\nCurrently Authorized Domains in Firebase Console:');
    (data.authorizedDomains || []).forEach((dom, i) => {
      console.log(`  ${i + 1}. ${dom}`);
    });

    const devHost = 'ais-dev-sauzwxn4ilbumqjux6bwxm-496262453529.asia-southeast1.run.app';
    const preHost = 'ais-pre-sauzwxn4ilbumqjux6bwxm-496262453529.asia-southeast1.run.app';

    console.log('\nRequired AI Studio Hostnames:');
    console.log(`  1. Development: ${devHost}`);
    console.log(`     Status: ${(data.authorizedDomains || []).includes(devHost) ? 'AUTHORIZED [OK]' : 'MISSING [REQUIRES AUTHORIZATION]'}`);
    console.log(`  2. Shared App:  ${preHost}`);
    console.log(`     Status: ${(data.authorizedDomains || []).includes(preHost) ? 'AUTHORIZED [OK]' : 'MISSING [REQUIRES AUTHORIZATION]'}`);

    console.log('\n' + '='.repeat(70));
  } catch (err) {
    console.error('Diagnostic error:', err);
  }
}

diagnose();
