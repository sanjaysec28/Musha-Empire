/**
 * scripts/verify_salon_settings.mjs
 * 
 * Safe, read-only verification of 'settings/salon' in Firebase project 'musha-ae73e'.
 * Uses the project API key to read the publicly readable settings document.
 */

const apiKey = process.env.VITE_FIREBASE_API_KEY;
const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'musha-ae73e';

if (!apiKey) {
  console.error("Missing VITE_FIREBASE_API_KEY environment variable.");
  process.exit(1);
}

const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/settings/salon?key=${apiKey}`;

async function verify() {
  console.log(`\n============================================================`);
  console.log(` Musha Empire — Salon Settings Verification`);
  console.log(` Target Project:  ${projectId}`);
  console.log(` Target Document: settings/salon`);
  console.log(`============================================================\n`);

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json();
      console.error(`❌ HTTP ${res.status}:`, JSON.stringify(err, null, 2));
      process.exit(1);
    }

    const data = await res.json();
    const fields = data.fields || {};

    console.log("Raw Fields in Firestore:");
    for (const [key, val] of Object.entries(fields)) {
      const type = Object.keys(val)[0];
      const preview = type === 'arrayValue' ? `[${(val.arrayValue.values || []).length} items]` : JSON.stringify(val[type]);
      console.log(`  - ${key} (${type}): ${preview}`);
    }

    console.log("\nValidation Checklist:");
    const hasSalonName = !!fields.salon_name?.stringValue;
    const hasTimezone = !!fields.timezone?.stringValue;
    const hasSlotDuration = !!fields.slotDurationMinutes?.integerValue;
    const openingHoursCount = fields.opening_hours?.arrayValue?.values?.length || 0;
    const hasOpeningHours = openingHoursCount === 7;
    const hasHolidays = 'holidays' in fields;

    console.log(`  [${hasSalonName ? 'PASS' : 'FAIL'}] salon_name: ${fields.salon_name?.stringValue || 'MISSING'}`);
    console.log(`  [${hasTimezone ? 'PASS' : 'WARN'}] timezone: ${fields.timezone?.stringValue || 'MISSING (check for misnamed key)'}`);
    console.log(`  [${hasSlotDuration ? 'PASS' : 'MISSING'}] slotDurationMinutes: ${fields.slotDurationMinutes?.integerValue || 'MISSING'}`);
    console.log(`  [${hasOpeningHours ? 'PASS' : 'MISSING'}] opening_hours: ${openingHoursCount}/7 days configured`);
    console.log(`  [${hasHolidays ? 'PASS' : 'MISSING'}] holidays: ${hasHolidays ? 'Present' : 'MISSING'}`);

    if (hasSalonName && hasTimezone && hasSlotDuration && hasOpeningHours) {
      console.log(`\n🎉 Status: settings/salon is FULLY POPULATED and ready for booking slot calculation.`);
    } else {
      console.log(`\n⚠️  Status: settings/salon is PARTIALLY POPULATED. Missing fields must be populated.`);
    }
  } catch (err) {
    console.error("Verification failed:", err);
    process.exit(1);
  }
}

verify();
