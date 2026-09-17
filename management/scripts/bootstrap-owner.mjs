import { mkdir,writeFile,chmod } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { serviceKey,PROJECT,ORG,origin } from './project-api.mjs';
try {
  const url=origin(),db=createClient(`https://${PROJECT}.supabase.co`,await serviceKey(),{auth:{persistSession:false,autoRefreshToken:false}});
  const email='suportesofiati@gmail.com';
  const {data:existing,error:lookupError}=await db.from('memberships').select('user_id,role').eq('organization_id',ORG).eq('email',email).maybeSingle();
  if(lookupError)throw Error('Apply migrations before bootstrapping the owner.');
  if(existing&&existing.role!=='proprietario')throw Error('Existing account has a different role. Review the existing account before bootstrap.');
  const {data,error}=await db.auth.admin.generateLink({type:existing?'recovery':'invite',email,options:{redirectTo:url}});
  if(error)throw Error('Could not create owner activation. Check the Auth account and project configuration.');
  if(!existing){const {error:insertError}=await db.from('memberships').insert({organization_id:ORG,user_id:data.user.id,email,name:'Franciele Sofiati',role:'proprietario',status:'convidado',profession:'Biomedicina',council:'CRBM',registration:'6277',state:'PR'});if(insertError)throw Error('Could not create owner membership. No password was created.');}
  const developerEmail='team.ashtra.ai@gmail.com';
  let developer=await db.from('memberships').select('user_id,role').eq('organization_id',ORG).eq('email',developerEmail).maybeSingle();
  if(developer.error)throw Error('Could not inspect the Ash Tra membership.');
  let developerLink='';
  if(!developer.data){const invite=await db.auth.admin.generateLink({type:'invite',email:developerEmail,options:{redirectTo:url}});if(invite.error)throw Error('Could not create the Ash Tra Auth account.');const {error:developerInsert}=await db.from('memberships').insert({organization_id:ORG,user_id:invite.data.user.id,email:developerEmail,name:'Ash Tra',role:'suporte_ti',status:'convidado',profession:'Software Developer'});if(developerInsert)throw Error('Could not create the Ash Tra membership.');developerLink=`${url}/#token_hash=${encodeURIComponent(invite.data.properties.hashed_token)}&type=invite`;}
  const folder=join(homedir(),'.local/state/sofiati');await mkdir(folder,{recursive:true,mode:0o700});await chmod(folder,0o700);
  const target=join(folder,'owner-activation.txt');
  await writeFile(target,`${url}/#token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=${existing?'recovery':'invite'}\n${developerLink ? `Ash Tra activation: ${developerLink}\n` : ''}`,{mode:0o600});await chmod(target,0o600);
  console.log(`Owner activation links written to ${target}. Open privately, set passwords, then delete the file. Links were not printed or emailed.`);
} catch(error){console.error(error.message);process.exitCode=1;}
