import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
// Check for both SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_SERVICE_ROLE_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!url) {
  console.error("Error: VITE_SUPABASE_URL is missing.");
  process.exit(1);
}

const keyToUse = serviceRoleKey || anonKey;
if (!keyToUse) {
  console.error("Error: Neither SUPABASE_SERVICE_ROLE_KEY nor VITE_SUPABASE_ANON_KEY is available.");
  process.exit(1);
}

if (!serviceRoleKey) {
  console.warn("\n======================================================================");
  console.warn("WARNING: SUPABASE_SERVICE_ROLE_KEY is not defined in your environment.");
  console.warn("Falling back to VITE_SUPABASE_ANON_KEY.");
  console.warn("Note: Row-Level Security (RLS) on 'profiles' and 'staff' may block");
  console.warn("insertions when using the anon key. To seed successfully, please configure");
  console.warn("SUPABASE_SERVICE_ROLE_KEY in your system environment or secrets.");
  console.warn("======================================================================\n");
} else {
  console.log("Using SUPABASE_SERVICE_ROLE_KEY to bypass Row-Level Security.");
}

const supabase = createClient(url, keyToUse);

const STYLISTS_TO_SEED = [
  {
    profileId: 'a1b1c1d1-e1f1-4a1b-8c1d-111111111111',
    staffId: 'a1b1c1d1-e1f1-4a1b-8c1d-211111111111',
    name: 'Master Arthur Musha',
    email: 'arthur.musha@mushaempire.com',
    phone: '+15550100001',
    role: 'stylist'
  },
  {
    profileId: 'a2b2c2d2-e2f2-4a2b-8c2d-112222222222',
    staffId: 'a2b2c2d2-e2f2-4a2b-8c2d-222222222222',
    name: 'Elena Rostova',
    email: 'elena.rostova@mushaempire.com',
    phone: '+15550100002',
    role: 'stylist'
  },
  {
    profileId: 'a3b3c3d3-e3f3-4a3b-8c3d-113333333333',
    staffId: 'a3b3c3d3-e3f3-4a3b-8c3d-233333333333',
    name: 'Marcus Sterling',
    email: 'marcus.sterling@mushaempire.com',
    phone: '+15550100003',
    role: 'stylist'
  },
  {
    profileId: 'a4b4c4d4-e4f4-4a4b-8c4d-114444444444',
    staffId: 'a4b4c4d4-e4f4-4a4b-8c4d-244444444444',
    name: 'Sophia Vance',
    email: 'sophia.vance@mushaempire.com',
    phone: '+15550100004',
    role: 'stylist'
  }
];

async function seed() {
  console.log("Starting database seeding process for salon stylists...");

  for (const stylist of STYLISTS_TO_SEED) {
    console.log(`\n--- Seeding ${stylist.name} ---`);

    // 1. Check if profile already exists
    const { data: existingProfile, error: profileFetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', stylist.email)
      .maybeSingle();

    let targetProfileId = stylist.profileId;

    if (profileFetchErr) {
      console.error(`Error checking profile for ${stylist.name}:`, profileFetchErr.message);
    } else if (existingProfile) {
      console.log(`Profile already exists for ${stylist.name} with ID: ${existingProfile.id}`);
      targetProfileId = existingProfile.id;
    } else {
      console.log(`Creating profile record for ${stylist.name}...`);
      const { data: newProfile, error: profileInsertErr } = await supabase
        .from('profiles')
        .insert({
          id: targetProfileId,
          full_name: stylist.name,
          email: stylist.email,
          phone: stylist.phone,
          role: stylist.role,
          is_active: true
        })
        .select()
        .single();

      if (profileInsertErr) {
        console.error(`Failed to insert profile for ${stylist.name}:`, profileInsertErr.message);
        // If it's blocked by RLS, we continue anyway to try other records or log the state
      } else {
        console.log(`Profile created successfully for ${stylist.name}!`);
        if (newProfile) targetProfileId = newProfile.id;
      }
    }

    // 2. Check if staff already exists
    const { data: existingStaff, error: staffFetchErr } = await supabase
      .from('staff')
      .select('*')
      .eq('email', stylist.email)
      .maybeSingle();

    if (staffFetchErr) {
      console.error(`Error checking staff for ${stylist.name}:`, staffFetchErr.message);
    } else if (existingStaff) {
      console.log(`Staff record already exists for ${stylist.name} with ID: ${existingStaff.id}`);
    } else {
      console.log(`Creating staff record for ${stylist.name} linked to profile: ${targetProfileId}...`);
      const { data: newStaff, error: staffInsertErr } = await supabase
        .from('staff')
        .insert({
          id: stylist.staffId,
          profile_id: targetProfileId,
          full_name: stylist.name,
          email: stylist.email,
          phone: stylist.phone,
          role: 'stylist',
          is_active: true
        })
        .select()
        .single();

      if (staffInsertErr) {
        console.error(`Failed to insert staff record for ${stylist.name}:`, staffInsertErr.message);
      } else {
        console.log(`Staff record created successfully for ${stylist.name}! ID: ${newStaff.id}`);
      }
    }
  }

  console.log("\nSeeding script execution completed.");
}

seed();
