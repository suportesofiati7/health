import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
export const PROJECT = 'naypgbhwnlbyqqqfftgn';
export const ORG = 'a783bd4c-f253-4a94-9365-75c6f1000001';
export async function management(path, method='GET', body) {
  const token=process.env.SUPABASE_ACCESS_TOKEN || await readFile(`${homedir()}/.supabase/access-token`,'utf8').then(s=>s.trim()).catch(()=>null);
  if(!token)throw Error('Supabase administrative authentication is missing. Run npx supabase login or set SUPABASE_ACCESS_TOKEN locally. Never paste it into chat.');
  const response=await fetch(`https://api.supabase.com/v1${path}`,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  if(!response.ok)throw Error(`Supabase administrative request failed (${response.status}). No credentials or response payload were logged.`);
  return response.status===204?null:response.json();
}
export async function serviceKey() {
  if(process.env.SUPABASE_SERVICE_ROLE_KEY)return process.env.SUPABASE_SERVICE_ROLE_KEY;
  const keys=await management(`/projects/${PROJECT}/api-keys`);
  const key=keys.find(k=>k.name==='service_role');
  if(!key?.api_key)throw Error('Service role key unavailable. Set SUPABASE_SERVICE_ROLE_KEY in a local environment.');
  return key.api_key;
}
export function origin() {
  const value=process.env.MANAGEMENT_ORIGIN;
  if(!value || new URL(value).protocol!=='https:')throw Error('Set MANAGEMENT_ORIGIN to the deployed HTTPS origin.');
  return new URL(value).origin;
}
