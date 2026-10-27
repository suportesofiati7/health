// Generate a private one-time recovery link for the existing clinic owner.
// This does not send email, change a password, or create any users.
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile, chmod } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const project = 'naypgbhwnlbyqqqfftgn';
const org = 'a783bd4c-f253-4a94-9365-75c6f1000001';
const email = 'suportesofiati@gmail.com';
try {
  // Capture credentials directly into memory; never print CLI key output.
  const keys = JSON.parse(execFileSync('npx', ['supabase', 'projects', 'api-keys', '--project-ref', project, '-o', 'json'], {
    cwd: new URL('../', import.meta.url), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']
  }));
  const key = keys.find(row => row.name === 'service_role')?.api_key;
  if (!key) throw Error('key');
  const db = createClient(`https://${project}.supabase.co`, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: member, error: lookupError } = await db.from('memberships').select('user_id,role,status').eq('organization_id', org).eq('email', email).single();
  if (lookupError || member?.role !== 'proprietario' || member.status !== 'ativo') throw Error('membership');
  const { data: current, error: userError } = await db.auth.admin.getUserById(member.user_id);
  if (userError || current.user?.email?.toLowerCase() !== email || !current.user.email_confirmed_at) throw Error('user');
  const { data, error } = await db.auth.admin.generateLink({ type: 'recovery', email, options: { redirectTo: 'https://app.francielesofiati.com/' } });
  if (error || !data.properties?.hashed_token) throw Error('recovery');
  const folder = join(homedir(), '.local/state/sofiati');
  await mkdir(folder, { recursive: true, mode: 0o700 });
  await chmod(folder, 0o700);
  const file = join(folder, 'professional-recovery.txt');
  const link = `https://app.francielesofiati.com/#token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=recovery`;
  await writeFile(file, `Open this one-time link privately in your browser, choose a new password, then delete this file.\n\n${link}\n`, { mode: 0o600 });
  await chmod(file, 0o600);
  console.log(`Private owner recovery link saved to ${file}. No credentials were printed or emailed.`);
} catch {
  console.error('Owner recovery could not be prepared. Verify CLI project access and the existing owner account. No credentials were printed.');
  process.exitCode = 1;
}
