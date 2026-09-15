import { createClient } from '@supabase/supabase-js';
import { serviceKey, PROJECT, ORG } from './project-api.mjs';

// Deliberately allow-list only the two accounts requested for removal.
const targets = ['team.ashtra.ai@gmail.com', 'recepcaosofiati@gmail.com'];
if (process.env.CONFIRM_REMOVE_REQUESTED_STAFF !== 'yes') {
  console.error('Refusing to delete accounts. Set CONFIRM_REMOVE_REQUESTED_STAFF=yes to confirm the exact allow-listed emails.');
  process.exit(1);
}

const db = createClient(`https://${PROJECT}.supabase.co`, await serviceKey(), { auth: { persistSession: false, autoRefreshToken: false } });
for (const email of targets) {
  const { data: membership, error: lookupError } = await db.from('memberships').select('id,user_id,email,role').eq('organization_id', ORG).ilike('email', email).maybeSingle();
  if (lookupError) throw lookupError;
  if (!membership) {
    console.log(`${email}: no membership found`);
    continue;
  }
  // Preserve operational/clinical records while removing this person's assignment.
  for (const [table, column] of [
    ['tasks', 'assigned_to'],
    ['appointments', 'professional_id'],
    ['clinical_procedures', 'professional_id'],
    ['follow_ups', 'professional_id'],
  ]) {
    const { error } = await db.from(table).update({ [column]: null }).eq('organization_id', ORG).eq(column, membership.user_id);
    if (error) throw error;
  }
  const { error: permissionsError } = await db.from('staff_permissions').delete().eq('organization_id', ORG).eq('user_id', membership.user_id);
  if (permissionsError) throw permissionsError;
  const { error: membershipError } = await db.from('memberships').delete().eq('id', membership.id);
  if (membershipError) throw membershipError;
  const { error: authError } = await db.auth.admin.deleteUser(membership.user_id);
  if (authError) throw authError;
  console.log(`${email}: deleted`);
}
