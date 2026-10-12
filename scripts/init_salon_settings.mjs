/**
 * scripts/init_salon_settings.mjs
 * 
 * Safe, idempotent Firestore initialization script for Musha Empire.
 * Targets ONLY Firebase project: musha-ae73e
 * 
 * Safety Guarantees:
 * 1. Targeted strictly to project 'musha-ae73e'.
 * 2. Checks if 'settings/salon' exists before write; NEVER overwrites an existing document.
 * 3. Does not touch or modify any other document or collection.
 * 4. Does not create services, users, reviews, bookings, tickets, slots, or availability.
 * 5. Contains ZERO hardcoded credentials; uses Application Default Credentials or GOOGLE_APPLICATION_CREDENTIALS.
 * 6. Completely safe to rerun multiple times.
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
  console.error(`This script is strictly locked to project '${EXPECTED_PROJECT_ID}'.\n`);
  process.exit(1);
}

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
  initializeApp({
    projectId: EXPECTED_PROJECT_ID
  });
}

const db = getFirestore();

// Confirmed operational settings schema
const CONFIRMED_SALON_SETTINGS = {
  salon_name: "Musha Empire Unisex Salon",
  timezone: "Asia/Kolkata",
  slotDurationMinutes: 30,
  opening_hours: [
    { day: "Monday", open: "10:00 AM", close: "09:00 PM", isClosed: false },
    { day: "Tuesday", open: "10:00 AM", close: "09:00 PM", isClosed: false },
    { day: "Wednesday", open: "10:00 AM", close: "09:00 PM", isClosed: false },
    { day: "Thursday", open: "10:00 AM", close: "09:00 PM", isClosed: false },
    { day: "Friday", open: "10:00 AM", close: "09:00 PM", isClosed: false },
    { day: "Saturday", open: "10:00 AM", close: "09:00 PM", isClosed: false },
    { day: "Sunday", open: "10:00 AM", close: "09:00 PM", isClosed: false }
  ],
  holidays: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

async function initializeSalonSettings() {
  console.log(`\n============================================================`);
  console.log(` Musha Empire — Safe Salon Settings Initialization`);
  console.log(` Target Project: ${EXPECTED_PROJECT_ID}`);
  console.log(` Target Path:    settings/salon`);
  console.log(`============================================================\n`);

  const docRef = db.collection('settings').doc('salon');

  // Step 1: Read existing state
  console.log(`Checking if document 'settings/salon' already exists...`);
  const snapshot = await docRef.get();

  if (snapshot.exists) {
    console.log(`⚠️  [NO-OP / PRESERVED] Document 'settings/salon' already exists.`);
    console.log(`Existing data was NOT modified or overwritten.`);
    const existingData = snapshot.data();
    console.log(`Existing salon_name: "${existingData?.salon_name || 'N/A'}"`);
    console.log(`Existing timezone:   "${existingData?.timezone || existingData?.time_zone || 'N/A'}"`);
    console.log(`\nInitialization safely terminated without writes.`);
    return;
  }

  // Step 2: Write confirmed settings
  console.log(`Document does not exist. Creating 'settings/salon'...`);
  await docRef.create(CONFIRMED_SALON_SETTINGS);

  console.log(`\n✅ [SUCCESS] Document 'settings/salon' created successfully!`);
  console.log(`Configured values:`);
  console.log(` - salon_name:          ${CONFIRMED_SALON_SETTINGS.salon_name}`);
  console.log(` - timezone:            ${CONFIRMED_SALON_SETTINGS.timezone}`);
  console.log(` - slotDurationMinutes: ${CONFIRMED_SALON_SETTINGS.slotDurationMinutes}`);
  console.log(` - opening_hours:       7 days (Mon-Sun, 10:00 AM - 09:00 PM, open)`);
  console.log(` - holidays:            [] (empty)`);
  console.log(` - created_at:          ${CONFIRMED_SALON_SETTINGS.created_at}`);
  console.log(`\nZero placeholder data, synthetic services, or fake records were created.`);
}

initializeSalonSettings()
  .then(() => {
    console.log(`\nScript completed.\n`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(`\n❌ [ERROR] Initialization failed:`, err);
    console.error(`\nEnsure you are authenticated with Firebase / Google Cloud:`);
    console.error(`  gcloud auth application-default login`);
    console.error(`  or set GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json\n`);
    process.exit(1);
  });
