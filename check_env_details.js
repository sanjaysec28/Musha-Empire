import fs from 'fs';

console.log("Checking for env files:");
const files = fs.readdirSync('.');
console.log("All root files:", files);

if (files.includes('.env')) {
  console.log(".env exists! Content (except keys):");
  const lines = fs.readFileSync('.env', 'utf8').split('\n');
  for (const line of lines) {
    const parts = line.split('=');
    if (parts[0]) {
      console.log(`  ${parts[0]}: ${parts[1] ? 'Has Value' : 'Empty'}`);
    }
  }
} else {
  console.log(".env does NOT exist in the root directory.");
}

console.log("\nKeys in process.env:");
for (const key of Object.keys(process.env)) {
  if (key.includes('SUPABASE') || key.includes('SECRET') || key.includes('KEY')) {
    console.log(`  ${key}: ${process.env[key] ? 'Presents' : 'Empty'}`);
  }
}
