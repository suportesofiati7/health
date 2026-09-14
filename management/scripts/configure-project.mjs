import { readdir,readFile } from 'node:fs/promises';
import { management,PROJECT,origin } from './project-api.mjs';
const apply=process.argv.includes('--apply');
try {
  const project=await management(`/projects/${PROJECT}`);
  const auth=await management(`/projects/${PROJECT}/config/auth`);
  console.log(JSON.stringify({project:PROJECT,name:project.name,status:project.status,public_signup_disabled:auth.disable_signup,apply},null,2));
  const desired={disable_signup:true,external_anonymous_users_enabled:false,jwt_exp:900,password_min_length:12,mailer_autoconfirm:false,
    site_url:origin(),uri_allow_list:`${origin()}/,${origin()}`};
  if(!apply){console.log('Read-only audit complete. Run npm run configure -- --apply to apply the reviewed versioned schema and private Auth settings.');process.exit(0);}
  await management(`/projects/${PROJECT}/config/auth`,'PATCH',desired);
  await management(`/projects/${PROJECT}/database/query`,'POST',{query:'create schema if not exists supabase_migrations; create table if not exists supabase_migrations.schema_migrations(version text primary key, statements text[], name text);'});
  const applied=await management(`/projects/${PROJECT}/database/query`,'POST',{query:'select version from supabase_migrations.schema_migrations'});
  for(const filename of (await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort()){
    const version=filename.split('_')[0];
    if(applied.some(row=>row.version===version)){console.log(`Already applied: ${version}`);continue;}
    const sql=await readFile(new URL(`../supabase/migrations/${filename}`,import.meta.url),'utf8');
    if(!sql.trim().toLowerCase().endsWith('commit;'))throw Error('Migration must finish with COMMIT.');
    const name=filename.slice(version.length+1,-4).replaceAll("'","''");
    await management(`/projects/${PROJECT}/database/query`,'POST',{query:sql.trim().slice(0,-7)+`insert into supabase_migrations.schema_migrations(version,name) values('${version}','${name}'); commit;`});
    console.log(`Applied: ${filename}`);
  }
  const verified=await management(`/projects/${PROJECT}/config/auth`);
  if(verified.disable_signup!==true)throw Error('Signup disablement was not verified.');
  console.log('Versioned schema applied and public signup disabled. Deploy Edge Functions and complete remote tests before real patient data.');
} catch(error){console.error(error.message);process.exitCode=1;}
