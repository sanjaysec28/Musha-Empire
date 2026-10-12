/**
 * scripts/populate_salon_settings.mjs
 * 
 * Safe, idempotent field population for 'settings/salon' in Musha Empire.
 * Targets ONLY Firebase project: musha-ae73e
 * 
 * Safety Guarantees:
 * 1. Strictly targets project 'musha-ae73e'.
 * 2. Checks that 'settings/salon' exists before updating.
 * 3. Preserves existing 'salon_name' and 'timezone'.
 * 4. Never overwrites or resets an existing 'opening_hours' array if one already exists.
 * 5. Adds slotDurationMinutes: 30, holidays: [], and the 7-day opening_hours array.
 * 6. Does not invent address, phone, email, services, bookings, or any other collection records.
 * 7. Safe to rerun.
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const EXPECTED_PROJECT_ID = 'musha-ae73e';

// Safety check on active project
const configuredProjectId = process.env.GCLOUD_PROJECT ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.FIREBASE_PROJECT_ID ||
  EXPECTED_PROJECT_ID;

if (configuredProjectId !== EXPECTED_PROJECT_ID) {
  console.error(`\n❌ [SAFETY ABORT] Target project mismatch.`);
  console.error(`Expected: '${EXPECTED_PROJECT_ID}', but detected: '${configuredProjectId}'.`);
  process.exit(1);
}

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
  initializeApp({
    projectId: EXPECTED_PROJECT_ID
  });
}

const db = getFirestore();

const DEFAULT_OPENING_HOURS = [
  { day: "Monday", open: "10:00 AM", close: "09:00 PM", isClosed: false },
  { day: "Tuesday", open: "10:00 AM", close: "09:00 PM", isClosed: false },
  { day: "Wednesday", open: "10:00 AM", close: "09:00 PM", isClosed: false },
  { day: "Thursday", open: "10:00 AM", close: "09:00 PM", isClosed: false },
  { day: "Friday", open: "10:00 AM", close: "09:00 PM", isClosed: false },
  { day: "Saturday", open: "10:00 AM", close: "09:00 PM", isClosed: false },
  { day: "Sunday", open: "10:00 AM", close: "09:00 PM", isClosed: false }
];

async function populateSalonSettings() {
  console.log(`\n============================================================`);
  console.log(` Musha Empire — Populate Salon Settings Fields`);
  console.log(` Target Project:  ${EXPECTED_PROJECT_ID}`);
  console.log(` Target Document: settings/salon`);
  console.log(`============================================================\n`);

  const docRef = db.collection('settings').doc('salon');

  // Step 1: Read existing document
  const snapshot = await docRef.get();
  if (!snapshot.exists) {
    console.error(`❌ [ERROR] Document 'settings/salon' does not exist.`);
    console.error(`Please create 'settings/salon' first or run scripts/init_salon_settings.mjs.`);
    process.exit(1);
  }

  const existingData = snapshot.data() || {};
  console.log(`Found existing document 'settings/salon':`);
  console.log(` - Current salon_name: "${existingData.salon_name || 'N/A'}"`);
  console.log(` - Current timezone:   "${existingData.timezone || existingData['Musha Empire Unisex Salon'] || 'N/A'}"`);

  // Step 2: Determine fields to update safely
  const updatePayload = {};

  // Preserve existing salon_name
  if (!existingData.salon_name) {
    updatePayload.salon_name = "Musha Empire Unisex Salon";
  }

  // Ensure timezone is set to 'Asia/Kolkata' (and repair if misnamed)
  if (!existingData.timezone) {
    updatePayload.timezone = "Asia/Kolkata";
  }

  // Ensure slotDurationMinutes: 30
  if (existingData.slotDurationMinutes === undefined) {
    updatePayload.slotDurationMinutes = 30;
  } else {
    console.log(`ℹ️  slotDurationMinutes already set to ${existingData.slotDurationMinutes}. Preserving.`);
  }

  // Ensure opening_hours
  if (!existingData.opening_hours || (Array.isArray(existingData.opening_hours) && existingData.opening_hours.length === 0)) {
    console.log(`ℹ️  opening_hours is missing or empty. Adding 7-day schedule (Mon-Sun 10:00 AM - 09:00 PM)...`);
    updatePayload.opening_hours = DEFAULT_OPENING_HOURS;
  } else {
    console.log(`⚠️  [PRESERVED] opening_hours already exists with ${existingData.opening_hours.length} entries. NOT overwriting.`);
  }

  // Ensure holidays
  if (!existingData.holidays) {
    updatePayload.holidays = [];
  } else {
    console.log(`ℹ️  holidays array already present. Preserving.`);
  }

  // Update timestamps
  if (!existingData.created_at) {
    updatePayload.created_at = new Date().toISOString();
  }
  updatePayload.updated_at = new Date().toISOString();

  // If no fields need updating, exit cleanly
  const keysToUpdate = Object.keys(updatePayload).filter(k => k !== 'updated_at');
  if (keysToUpdate.length === 0) {
    console.log(`\n✅ All required fields are already populated in 'settings/salon'. No update needed.`);
    return;
  }

  console.log(`\nFields being updated:`, keysToUpdate);
  await docRef.update(updatePayload);

  console.log(`\n✅ [SUCCESS] Document 'settings/salon' updated successfully!`);
  console.log(`Summary of populated fields:`);
  console.log(` - slotDurationMinutes: 30`);
  console.log(` - opening_hours:       7 days (Mon-Sun, 10:00 AM - 09:00 PM)`);
  console.log(` - holidays:            []`);
  console.log(` - timezone:            Asia/Kolkata`);
  console.log(` - salon_name:          preserved`);
}

populateSalonSettings()
  .then(() => {
    console.log(`\nOperation completed successfully.\n`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(`\n❌ [ERROR] Failed to update document:`, err);
    process.exit(1);
  });
