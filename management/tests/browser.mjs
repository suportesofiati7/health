import {chromium} from 'playwright-core';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin=process.env.MANAGEMENT_TEST_URL||'http://127.0.0.1:5173';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
const org='a783bd4c-f253-4a94-9365-75c6f1000001',uid='10000000-0000-4000-8000-000000000001';
const now=new Date(),day=(()=>{const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).reduce((out,part)=>{if(part.type!=='literal')out[part.type]=part.value;return out;},{});return `${parts.year}-${parts.month}-${parts.day}`;})();
const created=new Date().toISOString();
const user={id:uid,aud:'authenticated',role:'authenticated',email:'suportesofiati@gmail.com',email_confirmed_at:created,created_at:created,app_metadata:{},user_metadata:{}};
const member={id:'20000000-0000-4000-8000-000000000001',organization_id:org,user_id:uid,name:'Franciele (teste fictício)',email:user.email,role:'proprietario',status:'ativo',profession:'Biomedicina',council:'CRBM',registration:'TESTE',state:'PR'};
const patient={id:'30000000-0000-4000-8000-000000000001',organization_id:org,full_name:'Marina Exemplo Fictício',preferred_name:'',birth_date:'1992-03-12',phone:'43999990000',email:'marina@example.invalid',cpf:null,rg:'',cns:null,address:{},guardian:{},emergency_contact:{},status:'ativo',created_at:created,version:1};
const entry={id:'40000000-0000-4000-8000-000000000001',organization_id:org,patient_id:patient.id,kind:'avaliacao',title:'Avaliação fictícia',content:'CONTEÚDO FICTÍCIO: pele sensível; avaliação sem dados reais.',data:{concern:'Objetivo fictício de cuidado',payload:{full_name:'Fictitious payload',selected_procedure:['fictitious procedure']}},status:'finalizado',created_by:uid,clinical_at:created,created_at:created,version:1};
const intake={id:'70000000-0000-4000-8000-000000000001',organization_id:org,full_name:'Contato Exemplo Fictício',phone:'43988880000',email:'enquiry@example.invalid',status:'novo',internal_notes:'',created_at:created,submitted_at:created,consent_at:created,form_version:'2026-09-14',payload:{selected_procedure:'procedimento fictício'}};
const financeRecord={id:'80000000-0000-4000-8000-000000000001',organization_id:org,patient_id:patient.id,patients:patient,procedure_name:'Procedimento fictício',total_cents:100000,due_on:day,status:'parcial',receipt_number:'FS-2026-TESTE',nota_fiscal_issued:false,nota_fiscal_path:'',nota_fiscal_url:'',nf_number:'',nf_issued_on:null,nf_amount_cents:null};
const financePayment={id:'81000000-0000-4000-8000-000000000001',organization_id:org,record_id:financeRecord.id,patient_id:patient.id,amount_cents:30000,paid_on:day,method:'pix',status:'recebido',notes:'Pagamento fictício'};
const fixtures={memberships:[member],patients:[patient],entries:[entry],entry_versions:[],documents:[],document_links:[],communications:[],admin_notes:[],public_intakes:[intake],enquiries:[intake],financial_records:[financeRecord],financial_payments:[financePayment],appointments:[{id:'50000000-0000-4000-8000-000000000001',organization_id:org,patient_id:patient.id,patients:patient,starts_at:`${day}T14:00:00-03:00`,ends_at:`${day}T15:00:00-03:00`,status:'confirmado',label:'Avaliação estética',version:1}],tasks:[{id:'60000000-0000-4000-8000-000000000001',organization_id:org,patient_id:patient.id,patients:patient,title:'Confirmar retorno fictício',due_at:`${day}T10:00:00-03:00`,status:'pendente',priority:'alta',version:1}],audit_events:[]};
const jwt=`${Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url')}.${Buffer.from(JSON.stringify({sub:uid,exp:Math.floor(Date.now()/1000)+3600,session_id:'90000000-0000-4000-8000-000000000001',role:'authenticated'})).toString('base64url')}.fictional-signature`;
const failures=[];let posts=[];
async function contextFor(width,height,role='proprietario'){
  const context=await browser.newContext({viewport:{width,height}});
  await context.route('**/naypgbhwnlbyqqqfftgn.supabase.co/**',async route=>{
    const req=route.request(),url=new URL(req.url()),path=url.pathname;
    const json=(data,status=200,headers={})=>route.fulfill({status,contentType:'application/json',headers,body:JSON.stringify(data)});
    if(path.endsWith('/auth/v1/token'))return json({access_token:jwt,refresh_token:'fictional-refresh',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user});
    if(path.endsWith('/auth/v1/user'))return json(user);
    if(path.endsWith('/auth/v1/logout'))return json({});
    if(path.includes('/rpc/storage_usage'))return json({bytes:10485760,files:5,limit:800000000,database_bytes:5000000});
    if(path.includes('/rpc/convert_public_intake'))return json(patient.id);
    if(path.includes('/rpc/'))return json(null);
    const table=path.split('/').at(-1);let rows=structuredClone(fixtures[table]||[]);
    if(table==='memberships')rows=rows.map(m=>({...m,role}));
    if(req.method()==='HEAD')return route.fulfill({status:200,headers:{'content-range':`0-0/${rows.length}`},body:''});
    if(req.method()==='POST'||req.method()==='PATCH'){
      const body=req.postDataJSON();posts.push({table,body});const record={...body,id:body.id||crypto.randomUUID(),organization_id:org,created_by:uid,created_at:created,clinical_at:created,version:2};
      return json(req.headers().accept?.includes('vnd.pgrst.object')?record:[record]);
    }
    if(url.searchParams.has('id'))rows=rows.filter(r=>r.id===url.searchParams.get('id').replace('eq.',''));
    return json(req.headers().accept?.includes('vnd.pgrst.object')?(rows[0]||null):rows);
  });
  const page=await context.newPage();page.on('pageerror',e=>failures.push(e.message));
  return {context,page};
}
async function signIn(page){await page.goto(origin);await page.getByLabel('Email',{exact:true}).fill(user.email);await page.getByLabel('Senha',{exact:true}).fill('fictional-password');await page.getByRole('button',{name:'Entrar',exact:true}).click();await page.getByRole('heading',{name:'Seu dia, com clareza.'}).waitFor();}
async function navigation(page,name){if(await page.locator('.mobile-menu').isVisible())await page.locator('.mobile-menu').click();await page.locator('.sidebar nav').getByRole('button',{name,exact:true}).click();}
async function noOverflow(page){const metrics=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth,overflow:[...document.querySelectorAll('*')].filter((node)=>node.getBoundingClientRect().right>innerWidth+1).slice(0,8).map((node)=>({tag:node.tagName,className:node.className,right:Math.round(node.getBoundingClientRect().right),width:Math.round(node.getBoundingClientRect().width)}))}));assert(metrics.scrollWidth<=metrics.innerWidth+1,`horizontal overflow ${JSON.stringify(metrics)}`);}
try{
  for(const [width,height]of[[1440,1000],[390,844],[768,1024]]){
    const {context,page}=await contextFor(width,height);
    await page.goto(origin);await page.getByRole('heading',{name:'Bem-vinda de volta'}).waitFor();await noOverflow(page);
    await page.screenshot({path:`test-results/login-${width}.png`,fullPage:true});
    await signIn(page);await page.getByRole('heading',{name:'Seu dia, com clareza.',exact:true}).waitFor();await noOverflow(page);await page.screenshot({path:`test-results/today-${width}.png`,fullPage:true});
    await navigation(page,'Pacientes');await page.getByRole('button').filter({hasText:patient.full_name}).first().click();await page.getByRole('heading',{name:patient.full_name,exact:true}).waitFor();await noOverflow(page);await page.screenshot({path:`test-results/patient-${width}.png`,fullPage:true});
    await page.getByRole('button',{name:'Prontuário',exact:true}).click();await page.getByText(entry.content,{exact:true}).first().waitFor();await page.getByText('Ver registro completo',{exact:true}).first().click();await page.getByText(/Fictitious payload/).waitFor();
    for (const tab of ['Dados','Documentos e fotos','Fotografia clínica','Planos','Procedimentos','Saúde','Consentimentos','Privacidade / portal','Agenda e retornos','Administrativo','Histórico']) { await page.getByRole('button',{name:tab,exact:true}).click(); await noOverflow(page); }
    await page.getByRole('button',{name:'Prontuário',exact:true}).click(); await page.getByRole('button',{name:'EN',exact:true}).click();assert.equal(await page.getByText(entry.content,{exact:true}).count(),2);await page.getByRole('button',{name:'Clinical record',exact:true}).waitFor();
    await page.getByRole('button',{name:'PT',exact:true}).click();
    await page.getByRole('button',{name:'Anotação clínica',exact:true}).click();await page.getByLabel('Registro livre / observações').fill('NOTA FICTÍCIA de teste');await noOverflow(page);await page.screenshot({path:`test-results/note-${width}.png`,fullPage:true});
    await page.getByRole('button',{name:'Salvar rascunho',exact:true}).evaluate((button) => button.click());await page.locator('dialog').waitFor({state:'detached'});
    assert(posts.some(p=>p.table==='entries'&&p.body.content==='NOTA FICTÍCIA de teste'));
    await navigation(page,'Agenda');await page.getByRole('heading',{name:'Agenda',exact:true}).waitFor();await noOverflow(page);
    await navigation(page,'Tarefas');await page.getByRole('heading',{name:'Tarefas e retornos'}).waitFor();await noOverflow(page);
    await navigation(page,'Formulários');await page.getByRole('heading',{name:'Formulários',exact:true}).waitFor();await noOverflow(page);
    for (const statusName of ['Todos','Novo','Em análise','Contatado','Aguardando','Convertido','Arquivado']) { await page.getByRole('button',{name:statusName,exact:true}).click(); }
    await page.getByRole('button',{name:/Contato Exemplo Fictício/}).click(); await page.getByRole('heading',{name:'Revisar formulário'}).waitFor();
    await page.getByLabel('Status').selectOption('em_analise'); await page.getByRole('button',{name:'Salvar análise',exact:true}).click(); await page.locator('dialog').waitFor({state:'detached'}); assert(posts.some(p=>p.table==='public_intakes'&&p.body.status==='em_analise'));
    await navigation(page,'Financeiro');try{await page.getByRole('heading',{name:'Financeiro',exact:true}).waitFor({timeout:5000});}catch(error){console.log('FINANCE_DEBUG',await page.locator('body').innerText());throw error;}await page.getByText(/700,00/).first().waitFor();await noOverflow(page);
    await page.getByRole('button',{name:'Abrir',exact:true}).click();await page.getByRole('button',{name:'Gerar recibo / PDF',exact:true}).waitFor();const receiptPopup=page.waitForEvent('popup');await page.getByRole('button',{name:'Gerar recibo / PDF',exact:true}).click();const receiptPage=await receiptPopup;await receiptPage.waitForLoadState('domcontentloaded');try{await receiptPage.getByRole('heading',{name:'RECIBO DE PAGAMENTO',exact:true}).waitFor({timeout:5000});}catch(error){console.log('RECEIPT_DEBUG',await receiptPage.locator('body').innerText());throw error;}await receiptPage.getByText('FS-2026-TESTE').waitFor();await receiptPage.close();
    await page.getByLabel('Valor recebido (R$)').fill('700');await page.getByRole('button',{name:'Registrar pagamento',exact:true}).click();assert(posts.some(p=>p.table==='financial_payments'&&p.body.amount_cents===70000));await page.getByRole('button',{name:'Nota Fiscal',exact:true}).click();await page.getByRole('heading',{name:'Nota Fiscal',exact:true}).waitFor();await page.getByRole('button',{name:'Cancelar',exact:true}).click();await page.getByRole('button',{name:'Corrigir / Reembolsar',exact:true}).click();await page.getByLabel('Motivo').fill('Estorno fictício');await page.getByRole('button',{name:'Confirmar estorno',exact:true}).click();assert(posts.some(p=>p.table==='financial_payments'&&p.body.status==='estornado'&&p.body.refund_reason==='Estorno fictício'));await page.getByRole('button',{name:'Usar tema escuro',exact:true}).click();assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'dark');await page.getByRole('button',{name:'Usar tema claro',exact:true}).click();
    await navigation(page,'Relatórios');await page.getByRole('heading',{name:'Relatórios',exact:true}).waitFor();await noOverflow(page);
    await navigation(page,'Configurações');await page.getByRole('button',{name:'Usuários',exact:true}).click();await page.getByRole('heading',{name:'Equipe autorizada'}).waitFor();await noOverflow(page);
    await page.getByRole('button',{name:'Sair',exact:true}).click();await page.getByRole('heading',{name:'Bem-vinda de volta'}).waitFor();
    assert.equal(await page.getByText(patient.full_name).count(),0);
    await context.close();
  }
  const {context,page}=await contextFor(390,844,'recepcao');await signIn(page);assert.equal(await page.locator('.sidebar nav').getByRole('button',{name:'Financeiro',exact:true}).count(),0);await navigation(page,'Pacientes');await page.getByRole('button').filter({hasText:patient.full_name}).first().click();await page.getByRole('heading',{name:patient.full_name,exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Prontuário',exact:true}).count(),0);assert.equal(await page.getByText(entry.content,{exact:true}).count(),0);await context.close();
  assert.deepEqual(failures,[]);
  await writeFile('test-results/browser-results.json',JSON.stringify({passed:true,viewports:[1440,390,768],data:'fictional network fixtures only',checks:['login','responsive overflow','patient profile','PT/EN preserves clinical content','save draft payload','navigation','logout clears UI','reception clinical UI hidden'],consoleErrors:failures},null,2));
  console.log('Browser checks passed at desktop, tablet and mobile sizes. Fixtures are fictional; RLS is tested separately.');
}finally{await browser.close();}
