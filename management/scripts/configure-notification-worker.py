#!/usr/bin/env python3
"""Install scheduler using a dedicated secret, without logging its value."""
import pathlib, secrets, subprocess, tempfile, os
root=pathlib.Path(__file__).resolve().parents[1]
credential=secrets.token_hex(32)
with tempfile.TemporaryDirectory() as directory:
 env=pathlib.Path(directory)/'worker.env'
 env.write_text('NOTIFICATION_WORKER_SECRET='+credential+'\n'); os.chmod(env,0o600)
 subprocess.run(['npx','supabase','secrets','set','--env-file',str(env),'--project-ref','naypgbhwnlbyqqqfftgn'],cwd=root,check=True)
 sql=pathlib.Path(directory)/'worker.sql'
 sql.write_text("""begin;
create extension if not exists pg_net with schema extensions;
do $setup$ declare existing uuid; begin
 select id into existing from vault.secrets where name='intake_notification_worker';
 if existing is null then perform vault.create_secret('%s','intake_notification_worker');
 else perform vault.update_secret(existing,'%s'); end if;
end $setup$;
create or replace function private.dispatch_intake_notifications() returns void language plpgsql security definer set search_path='' as $fn$
declare credential text; begin
 select decrypted_secret into credential from vault.decrypted_secrets where name='intake_notification_worker';
 if credential is null then raise exception 'notification_worker_unconfigured'; end if;
 perform net.http_post(url:='https://naypgbhwnlbyqqqfftgn.supabase.co/functions/v1/intake-notifications',headers:=jsonb_build_object('Authorization','Bearer '||credential,'Content-Type','application/json'),body:='{}'::jsonb);
end $fn$;
revoke all on function private.dispatch_intake_notifications() from public,anon,authenticated;
select cron.schedule('sofiati-intake-notifications','* * * * *','select private.dispatch_intake_notifications()');
commit;"""%(credential,credential)); os.chmod(sql,0o600)
 subprocess.run(['npx','supabase','db','query','--linked','--file',str(sql)],cwd=root,check=True,stdout=subprocess.DEVNULL)
print('Scheduler installed. RESEND_API_KEY and EMAIL_FROM are required for delivery.')
