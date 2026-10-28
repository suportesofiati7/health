import {chromium} from 'playwright-core';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin=process.env.MANAGEMENT_TEST_URL||'http://127.0.0.1:5173';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
const org='a783bd4c-f253-4a94-9365-75c6f1000001',uid='10000000-0000-4000-8000-000000000001';
const now=new Date(),day=(()=>{const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).reduce((out,part)=>{if(part.type!=='literal')out[part.type]=part.value;return out;},{});return `${parts.year}-${parts.month}-${parts.day}`;})();
const created=new Date().toISOString();
const user={id:uid,aud:'authenticated',role:'authenticated',email:'qa-owner@example.invalid',email_confirmed_at:created,created_at:created,app_metadata:{},user_metadata:{}};
const member={id:'20000000-0000-4000-8000-000000000001',organization_id:org,user_id:uid,name:'Proprietária QA Fictícia',email:user.email,role:'proprietario',status:'ativo',profession:'Biomedicina',council:'CRBM',registration:'TESTE',state:'PR'};
const patient={id:'30000000-0000-4000-8000-000000000001',organization_id:org,full_name:'QA Patient Example',preferred_name:'QA Patient',birth_date:'2000-01-01',phone:'00000000000',email:'qa-patient@example.invalid',cpf:null,rg:'',cns:null,address:{},guardian:{},emergency_contact:{},status:'ativo',avatar_path:`${org}/patient/qa-patient.png`,created_at:created,version:1};
const entry={id:'40000000-0000-4000-8000-000000000001',organization_id:org,patient_id:patient.id,kind:'avaliacao',title:'Avaliação fictícia',content:'CONTEÚDO FICTÍCIO: pele sensível; avaliação sem dados reais.',data:{concern:'Objetivo fictício de cuidado',payload:{full_name:'Fictitious payload',selected_procedure:['fictitious procedure']}},status:'finalizado',created_by:uid,clinical_at:created,created_at:created,version:1};
const intake={id:'70000000-0000-4000-8000-000000000001',organization_id:org,full_name:'Contato Exemplo Fictício',phone:'00000000002',email:'enquiry@example.invalid',status:'novo',internal_notes:'',created_at:created,submitted_at:created,consent_at:created,form_version:'2026-09-14',payload:{selected_procedure:'procedimento fictício'}};
const financeRecord={id:'80000000-0000-4000-8000-000000000001',organization_id:org,patient_id:patient.id,patients:patient,procedure_name:'Procedimento fictício',total_cents:100000,due_on:day,status:'parcial',receipt_number:'FS-2026-TESTE',nota_fiscal_issued:false,nota_fiscal_path:'',nota_fiscal_url:'',nf_number:'',nf_issued_on:null,nf_amount_cents:null};
const financePayment={id:'81000000-0000-4000-8000-000000000001',organization_id:org,record_id:financeRecord.id,patient_id:patient.id,amount_cents:30000,paid_on:day,method:'pix',status:'recebido',notes:'Pagamento fictício'};
const procedure={id:'a1000000-0000-4000-8000-000000000001',organization_id:org,name:'Peeling de Jessner (teste fictício)',category:'peeling',image_url:'',description:'Procedimento fictício para validar edição do catálogo.',purpose:'Fixture visual',indications:'Fixture visual',areas:'Face',default_duration:60,interval_days:30,sessions:'Individualizado',follow_up:'Reavaliar',followup_days:30,price_cents:25000,commercial_config:{},benefits:'Fixture',before_after_care:'Fixture',recovery:'Fixture',expected_results:'Variáveis',clinical_details:{},official_information:{},protocol_instructions:'Fixture',materials:{},documents:{},availability:{},source_references:[],booking_buffer_minutes:0,room_requirement:'',eligible_roles:[],questionnaire:[],required_consents:[],public_description:'',review_status:'aprovacao_pendente',next_review_on:null,product_relevant:false,lot_required:false,device_relevant:false,photos_expected:false,treatment_areas:'Face',consent_template:'',consent_template_version:'',post_care:'Fixture',relevant_fields:{},device_parameters:[],catalog_version:1,active:true};
const fixtures={memberships:[member],patients:[patient],entries:[entry],entry_versions:[],treatment_plans:[{id:'b7000000-0000-4000-8000-000000000001',organization_id:org,patient_id:patient.id,title:'Plano fictício editável',objectives:'Objetivo fictício',areas:'Face',professional_notes:'Notas fictícias',responsible_user:uid,expected_followup:null,status:'planejado',created_at:created,treatment_plan_items:[{id:'b7100000-0000-4000-8000-000000000001',organization_id:org,plan_id:'b7000000-0000-4000-8000-000000000001',procedure_id:procedure.id,sequence_no:1,sessions:2,area:'Face',notes:'Fictional plan item',archived_at:null,procedures:{name:procedure.name}}]}],documents:[],document_links:[],clinical_procedures:[{id:'b6000000-0000-4000-8000-000000000001',organization_id:org,patient_id:patient.id,procedure_id:procedure.id,professional_id:uid,performed_at:created,area:'Área fictícia',indication:'Indicação inicial',technique:'',parameters:{},post_care:'',consent_status:'pendente',status:'rascunho',created_by:uid,created_at:created,procedures:{name:procedure.name}}],clinical_photos:[{id:'91000000-0000-4000-8000-000000000001',organization_id:org,patient_id:patient.id,path:`${org}/${patient.id}/qa-patient.png`,category:'antes',area:'Face completa',description:'Imagem fictícia para validação visual.',created_at:created}],communications:[],admin_notes:[],public_intakes:[intake],enquiries:[intake],financial_records:[financeRecord],financial_payments:[financePayment],appointments:[{id:'50000000-0000-4000-8000-000000000001',organization_id:org,patient_id:patient.id,patients:patient,starts_at:`${day}T14:00:00-03:00`,ends_at:`${day}T15:00:00-03:00`,status:'confirmado',label:'Avaliação estética',version:1}],tasks:[{id:'60000000-0000-4000-8000-000000000001',organization_id:org,patient_id:patient.id,patients:patient,title:'Confirmar retorno fictício',due_at:`${day}T10:00:00-03:00`,status:'pendente',priority:'alta',version:1}],procedures:[procedure],procedure_versions:[],audit_events:[]};
procedure.materials = { products: 'Fixture product', traceability: { preserve: true } };
procedure.questionnaire = [{ key: 'qa', label: 'Question fixture', required: true }];
fixtures.procedures.push({ ...procedure, id: 'a1000000-0000-4000-8000-000000000002', name: 'Botox (teste fictício)' });
financeRecord.procedure_id = procedure.id;
const outsidePatient = { ...patient, id: '30000000-0000-4000-8000-000000000009', full_name: 'Outside QA', preferred_name: 'Outside', phone: '0000000000' };
const jwt=`${Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url')}.${Buffer.from(JSON.stringify({sub:uid,exp:Math.floor(Date.now()/1000)+3600,session_id:'90000000-0000-4000-8000-000000000001',role:'authenticated'})).toString('base64url')}.fictional-signature`;
const failures=[];let posts=[];
async function contextFor(width,height,role='proprietario'){
  const context=await browser.newContext({viewport:{width,height}});
  await context.route('**/naypgbhwnlbyqqqfftgn.supabase.co/**',async route=>{
    const req=route.request(),url=new URL(req.url()),path=url.pathname;
    const json=(data,status=200,headers={})=>route.fulfill({status,contentType:'application/json',headers,body:JSON.stringify(data)});
    if(path.includes('/storage/v1/object/'))return route.fulfill({status:200,contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64')});
    if(path.endsWith('/auth/v1/token'))return json({access_token:jwt,refresh_token:'fictional-refresh',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user});
    if(path.endsWith('/auth/v1/user'))return json(user);
    if(path.endsWith('/auth/v1/logout'))return json({});
    if(path.includes('/rpc/storage_usage'))return json({bytes:10485760,files:5,limit:800000000,database_bytes:5000000});
    if(path.includes('/rpc/convert_public_intake'))return json(patient.id);
    if(path.endsWith('/rpc/record_clinical_procedure')){posts.push({table:'rpc:record_clinical_procedure',body:req.postDataJSON()});return json('b5000000-0000-4000-8000-000000000001');}
    if(path.endsWith('/rpc/save_treatment_plan')){const body=req.postDataJSON();posts.push({table:'rpc:save_treatment_plan',body});Object.assign(fixtures.treatment_plans[0],body.plan_payload);if(body.item_payload){const items=fixtures.treatment_plans[0].treatment_plan_items,existing=items.find(item=>item.id===body.item_payload.id);if(existing)Object.assign(existing,body.item_payload);else items.push({...body.item_payload,id:'b7100000-0000-4000-8000-000000000002',organization_id:org,plan_id:fixtures.treatment_plans[0].id,archived_at:null,procedures:{name:fixtures.procedures.find(item=>item.id===body.item_payload.procedure_id)?.name}});}return json('b7000000-0000-4000-8000-000000000001');}
    if(path.endsWith('/rpc/set_treatment_plan_item_archived')){const body=req.postDataJSON();posts.push({table:'rpc:set_treatment_plan_item_archived',body});const item=fixtures.treatment_plans[0].treatment_plan_items.find(row=>row.id===body.p_item);if(item)item.archived_at=body.p_archived?created:null;return json(null);}
    if(path.includes('/rpc/'))return json(null);
    const table=path.split('/').at(-1);let rows=structuredClone(fixtures[table]||[]);
    // Exercise the loader's compatibility retry against a deployment where
    // the optional action-centre migration has not reached PostgREST yet.
    if(table==='tasks'&&req.method()==='GET'&&(url.searchParams.has('source_type')||url.searchParams.get('or')?.includes('source_type')||url.searchParams.has('category')))return json({code:'PGRST204',message:'column not found in schema cache'},400);
    if(table==='patients' && (url.searchParams.get('or')?.includes('Outside') || url.searchParams.get('id')===`eq.${outsidePatient.id}`)) rows=[outsidePatient];
    if(table==='memberships')rows=rows.map(m=>({...m,role}));
    if(req.method()==='HEAD')return route.fulfill({status:200,headers:{'content-range':`0-0/${rows.length}`},body:''});
    if(req.method()==='POST'||req.method()==='PATCH'){
      const body=req.postDataJSON();posts.push({table,method:req.method(),body});const record={...body,id:body.id||crypto.randomUUID(),organization_id:org,created_by:uid,created_at:created,clinical_at:created,version:2};
      return json(req.headers().accept?.includes('vnd.pgrst.object')?record:[record]);
    }
    if(url.searchParams.has('id'))rows=rows.filter(r=>r.id===url.searchParams.get('id').replace('eq.',''));
    return json(req.headers().accept?.includes('vnd.pgrst.object')?(rows[0]||null):rows);
  });
  const page=await context.newPage();page.setDefaultTimeout(7000);page.on('pageerror',e=>{failures.push(e.message);console.log('BROWSER_ERROR',e.message);});
  page.on('console',message=>{if(message.type()==='error' && /ReferenceError/.test(message.text()))console.log(message.text());});
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
    await signIn(page);await page.getByRole('heading',{name:'Seu dia, com clareza.',exact:true}).first().waitFor();assert.match(await page.locator('[data-live-clock]').innerText(),/^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2} · /);await noOverflow(page);await page.screenshot({path:`test-results/today-${width}.png`,fullPage:true});
    await navigation(page,'Pacientes');await page.getByRole('button').filter({hasText:patient.preferred_name}).first().click();await page.getByRole('heading',{name:patient.preferred_name,exact:true}).waitFor();await noOverflow(page);await page.screenshot({path:`test-results/patient-${width}.png`,fullPage:true});
    await page.getByRole('button',{name:'Prontuário',exact:true}).click();await page.getByText(entry.content,{exact:true}).first().waitFor();await page.getByText('Ver registro completo',{exact:true}).first().click();await page.getByText(/Fictitious payload/).waitFor();
    for (const tab of ['Dados','Documentos e fotos','Fotografia clínica','Planos','Procedimentos','Saúde','Consentimentos','Privacidade / portal','Agenda e retornos','Administrativo','Histórico']) { await page.getByRole('button',{name:tab,exact:true}).last().click(); await noOverflow(page); }
    await page.getByRole('button',{name:'Fotografia clínica',exact:true}).click(); await page.locator('.clinical-photo-thumb img').waitFor({state:'attached'}); assert.equal(await page.locator('.clinical-photo-thumb img').evaluate((image) => image.naturalWidth > 0),true);
    await page.getByRole('button',{name:'Prontuário',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:/^(EN|PT)$/}).count(),0,'the Portuguese-only app does not expose the retired language toggle');
    await page.getByText(entry.content,{exact:true}).first().waitFor();
    await page.getByRole('button',{name:'Planos',exact:true}).click();
    await page.getByRole('button',{name:'Editar plano',exact:true}).click();
    await page.getByLabel('Título',{exact:true}).fill('Plano fictício corrigido');
    await page.getByRole('button',{name:'Salvar alterações',exact:true}).click();
    await page.getByText('Plano atualizado',{exact:true}).waitFor();
    assert(posts.some(row=>row.table==='rpc:save_treatment_plan'&&row.body.plan_payload.title==='Plano fictício corrigido'&&row.body.plan_payload.id==='b7000000-0000-4000-8000-000000000001'));
    await page.getByRole('button',{name:'Editar item',exact:true}).click();
    await page.getByLabel('Sessões',{exact:true}).fill('4');
    await page.getByLabel('Área do item',{exact:true}).fill('Face e pescoço');
    await page.getByRole('button',{name:'Salvar item e plano',exact:true}).click();
    await page.getByText('Item do plano atualizado',{exact:true}).waitFor();
    const itemUpdate=posts.filter(row=>row.table==='rpc:save_treatment_plan').at(-1);
    assert.equal(itemUpdate.body.item_payload.id,'b7100000-0000-4000-8000-000000000001');
    assert.equal(itemUpdate.body.item_payload.sessions,4);
    await page.getByText(/Face e pescoço · 4 sessão/).waitFor({state:'attached'});
    await page.getByRole('button',{name:'Arquivar item',exact:true}).click();
    await page.getByText(/Arquivado/).waitFor();
    assert.equal(await page.getByRole('button',{name:'Iniciar procedimento',exact:true}).count(),0);
    await page.getByRole('button',{name:'Restaurar item',exact:true}).click();
    await page.locator('.list-row').filter({hasText:'Face e pescoço'}).waitFor();
    await page.getByRole('button',{name:'Arquivar item',exact:true}).waitFor();
    await page.getByRole('button',{name:'Iniciar procedimento',exact:true}).waitFor();
    assert.equal(await page.getByText(/Arquivado/).count(),0);
    await page.getByRole('button',{name:'Dados',exact:true}).last().click();
    await page.getByRole('button',{name:'Planos',exact:true}).last().click();
    await page.locator('.list-row').filter({hasText:'Face e pescoço'}).waitFor();
    await page.getByRole('button',{name:'Procedimentos',exact:true}).last().click();
    const clinicalProcedureForm=page.getByRole('button',{name:'Finalizar procedimento',exact:true}).locator('xpath=ancestor::form');
    await clinicalProcedureForm.locator('select').first().selectOption(procedure.id);
    await clinicalProcedureForm.locator('textarea').nth(0).fill('Indicação clínica fictícia de teste');
    await clinicalProcedureForm.locator('textarea').nth(1).fill('Técnica fictícia de teste');
    await clinicalProcedureForm.getByRole('button',{name:'Finalizar procedimento',exact:true}).click();
    await page.getByText('Procedimento registrado',{exact:true}).waitFor();
    const clinicalCall=posts.find(row=>row.table==='rpc:record_clinical_procedure');
    assert.equal(clinicalCall.body.procedure_payload.patient_id,patient.id);
    assert.equal(clinicalCall.body.procedure_payload.indication,'Indicação clínica fictícia de teste');
    assert.equal(clinicalCall.body.usage_payload,null);
    await page.getByRole('button',{name:'Completar rascunho',exact:true}).click();
    const resumedDraftForm=page.getByRole('button',{name:'Finalizar rascunho',exact:true}).locator('xpath=ancestor::form');
    await resumedDraftForm.locator('textarea').nth(1).fill('Técnica concluída do rascunho');
    await resumedDraftForm.getByRole('button',{name:'Finalizar rascunho',exact:true}).evaluate(button=>button.click());
    await page.getByText('Procedimento registrado',{exact:true}).waitFor();
    const completedDraft=posts.filter(row=>row.table==='rpc:record_clinical_procedure').at(-1);
    assert.equal(completedDraft.body.procedure_payload.id,'b6000000-0000-4000-8000-000000000001');
    assert.equal(completedDraft.body.procedure_payload.technique,'Técnica concluída do rascunho');
    await page.getByRole('button',{name:'Prontuário',exact:true}).click();
    await page.getByRole('button',{name:'Anotação clínica',exact:true}).click();await page.getByLabel('Registro livre / observações').fill('NOTA FICTÍCIA de teste');await noOverflow(page);await page.screenshot({path:`test-results/note-${width}.png`,fullPage:true});
    await page.getByRole('button',{name:'Salvar rascunho',exact:true}).evaluate((button) => button.click());await page.locator('dialog').waitFor({state:'detached'});
    assert(posts.some(p=>p.table==='entries'&&p.body.content==='NOTA FICTÍCIA de teste'));
    await navigation(page,'Agenda');await page.getByRole('heading',{name:'Agenda',exact:true}).waitFor();await noOverflow(page);
    await navigation(page,'Tarefas');await page.getByRole('heading',{name:'Tarefas e retornos'}).waitFor();await noOverflow(page);assert.equal(await page.locator('.clinic-topbar-meta a').count(),0);assert.equal(await page.locator('.clinic-topbar-meta img').count(),0);
    await page.getByRole('button',{name:'Nova tarefa',exact:true}).click();const taskDialog=page.getByRole('dialog');await taskDialog.waitFor();await taskDialog.getByLabel('Tarefa',{exact:true}).fill('Tarefa fictícia de regressão');await taskDialog.getByRole('button',{name:'Salvar',exact:true}).evaluate((button) => button.click());await taskDialog.waitFor({state:'detached'});assert(posts.some(p=>p.table==='tasks'&&p.body.title==='Tarefa fictícia de regressão'));
    await page.getByRole('button',{name:'Novo retorno',exact:true}).click();const followupDialog=page.getByRole('dialog');await followupDialog.waitFor();await followupDialog.getByLabel('Paciente',{exact:true}).fill('QA Patient');await followupDialog.getByRole('option',{name:/QA Patient/}).click();await followupDialog.getByLabel('Observações do retorno',{exact:true}).fill('Retorno fictício de regressão');await followupDialog.getByRole('button',{name:'Salvar',exact:true}).evaluate((button) => button.click());await followupDialog.waitFor({state:'detached'});assert(posts.some(p=>p.table==='follow_ups'&&p.body.patient_id===patient.id&&p.body.notes==='Retorno fictício de regressão'));
    await navigation(page,'Formulários');await page.getByRole('heading',{name:'Formulários',exact:true}).waitFor();await noOverflow(page);
    for (const statusName of ['Todos','Novo','Em análise','Contatado','Aguardando','Convertido','Arquivado']) { await page.getByRole('button',{name:statusName,exact:true}).click(); }
    await page.locator('button.patient-row').filter({hasText:'Contato Exemplo Fictício'}).click(); await page.getByRole('heading',{name:'Revisar formulário'}).waitFor();
    await page.getByLabel('Status').selectOption('em_analise'); await page.getByRole('button',{name:'Salvar análise',exact:true}).click(); await page.locator('dialog').waitFor({state:'detached'}); assert(posts.some(p=>p.table==='public_intakes'&&p.body.status==='em_analise'));
    await navigation(page,'Financeiro');try{await page.getByRole('heading',{name:'Financeiro',exact:true}).waitFor({timeout:5000});}catch(error){console.log('FINANCE_DEBUG',await page.locator('body').innerText());throw error;}await page.getByText(/700,00/).first().waitFor();await noOverflow(page);await page.locator('.finance-patient-thumb img').waitFor();assert.match(await page.locator('.finance-service-thumb').getAttribute('src'), /peeling-jessner\.png$/);
    await page.getByRole('button',{name:'Detalhes',exact:true}).click();await page.getByRole('button',{name:'Gerar recibo / PDF',exact:true}).waitFor();const receiptPopup=page.waitForEvent('popup');await page.getByRole('button',{name:'Gerar recibo / PDF',exact:true}).click();const receiptPage=await receiptPopup;await receiptPage.waitForLoadState('domcontentloaded');try{await receiptPage.getByRole('heading',{name:'RECIBO DE PAGAMENTO',exact:true}).waitFor({timeout:5000});}catch(error){console.log('RECEIPT_DEBUG',await receiptPage.locator('body').innerText());throw error;}await receiptPage.getByText('FS-2026-TESTE').waitFor();await receiptPage.close();
    await page.getByLabel('Valor recebido (R$)').fill('700');await page.locator('.finance-payment-form').getByRole('button',{name:'Registrar pagamento',exact:true}).click();assert(posts.some(p=>p.table==='financial_payments'&&p.body.amount_cents===70000));assert.equal(await page.getByRole('button',{name:/Nota Fiscal|Emitir NF|Ver NF/}).count(),0);await page.getByRole('button',{name:'Corrigir / Reembolsar',exact:true}).click();await page.getByLabel('Motivo').fill('Estorno fictício');await page.getByRole('button',{name:'Confirmar estorno',exact:true}).click();assert(posts.some(p=>p.table==='financial_payments'&&p.body.status==='estornado'&&p.body.refund_reason==='Estorno fictício'));await page.getByRole('button',{name:'Usar tema escuro',exact:true}).click();assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'dark');await page.getByRole('button',{name:'Usar tema claro',exact:true}).click();
    await navigation(page,'Relatórios');await page.getByRole('heading',{name:'Relatórios',exact:true}).waitFor();await page.locator('.report-filters .patient-picker input').fill('QA Patient');await page.getByRole('option',{name:/QA Patient/}).click();await noOverflow(page);const reportPopup=page.waitForEvent('popup');await page.getByRole('button',{name:'Gerar PDF',exact:true}).click();const reportPage=await reportPopup;await reportPage.waitForLoadState('domcontentloaded');await reportPage.getByRole('heading',{name:'Prontuário completo do paciente',exact:true}).waitFor();await reportPage.screenshot({path:`test-results/report-${width}.png`,fullPage:true});const headerMetrics=await reportPage.evaluate(()=>{const header=document.querySelector('.document-header'),content=document.querySelector('.document-content');const h=header?.getBoundingClientRect(),c=content?.getBoundingClientRect();return {headerBottom:h?.bottom,contentTop:c?.top,overlap:!!(h&&c&&h.bottom>c.top)}});assert.equal(headerMetrics.overlap,false,`document header overlaps content: ${JSON.stringify(headerMetrics)}`);await reportPage.getByRole('button',{name:'Imprimir / salvar PDF',exact:true}).waitFor();await reportPage.close();
    if (width === 1440) {
      await navigation(page, 'Comunicação');
      await page.getByRole('button', { name: 'Nova mensagem', exact: true }).click();
      const messageDialog = page.getByRole('dialog');
      await messageDialog.locator('.patient-picker input').fill('Outside');
      await messageDialog.getByRole('option', { name: /Outside/ }).click();
      await messageDialog.getByRole('combobox', { name: 'Modelo', exact: true }).selectOption('__free__');
      await messageDialog.locator('textarea').fill('Prepared WhatsApp fixture');
      await context.route('https://web.whatsapp.com/**', route => route.fulfill({ contentType: 'text/html', body: '<title>Intercepted fictional WhatsApp target</title>' }));
      const whatsappPopup = page.waitForEvent('popup');
      await messageDialog.getByRole('button', { name: 'Abrir WhatsApp', exact: true }).click();
      const whatsappPage = await whatsappPopup;
      await whatsappPage.waitForURL('https://web.whatsapp.com/**');
      assert.equal(new URL(whatsappPage.url()).searchParams.get('phone'), '550000000000');
      assert.equal(new URL(whatsappPage.url()).searchParams.get('text'), 'Prepared WhatsApp fixture');
      await messageDialog.waitFor({ state: 'detached' });
      assert(posts.some(row => row.table === 'communications' && row.body.patient_id === outsidePatient.id));
      await whatsappPage.close();
      await navigation(page, 'Procedimentos');
      for (const index of [0, 1]) {
        await page.locator('.procedure-catalog-card').nth(index).getByRole('button', { name: 'Editar', exact: true }).click();
        const editor = page.locator('#procedure-editor');
        await editor.waitFor();
        assert.deepEqual(JSON.parse(await editor.getByLabel('Configuração comercial (JSON)').inputValue()), {});
        await editor.getByLabel('Preço (R$)', { exact: true }).fill('321.45');
        await editor.getByRole('button', { name: 'Salvar', exact: true }).click();
        await editor.waitFor({ state: 'detached' });
        const changed = posts.filter(row => row.table === 'procedures').at(-1).body;
        assert.equal(changed.price_cents, 32145);
        assert.equal(changed.materials.traceability.preserve, true);
        assert.deepEqual(changed.questionnaire, procedure.questionnaire);
        assert.equal(Object.hasOwn(changed, 'id'), false);
        assert.equal(Object.hasOwn(changed, 'created_at'), false);
      }
      assert.equal(posts.some(row => row.table === 'procedure_versions'), false);
    }
    await navigation(page,'Configurações');await page.getByRole('button',{name:'Usuários',exact:true}).click();await page.getByRole('heading',{name:'Equipe autorizada'}).waitFor();await noOverflow(page);
    await page.getByRole('button',{name:'Sair',exact:true}).click();await page.getByRole('heading',{name:'Bem-vinda de volta'}).waitFor();
    assert.equal(await page.getByText(patient.full_name).count(),0);
    await context.close();
  }
  const {context,page}=await contextFor(390,844,'recepcao');await signIn(page);assert.equal(await page.locator('.sidebar nav').getByRole('button',{name:'Financeiro',exact:true}).count(),0);await navigation(page,'Pacientes');await page.getByRole('button').filter({hasText:patient.preferred_name}).first().click();await page.getByRole('heading',{name:patient.preferred_name,exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Prontuário',exact:true}).count(),0);assert.equal(await page.getByText(entry.content,{exact:true}).count(),0);await context.close();
  const responsive=await contextFor(1440,900);await signIn(responsive.page);
  const responsiveWidths=[320,360,390,430,600,760,768,900,1024,1200,1280,1366,1440,1600,1920,2560];
  for(const width of responsiveWidths){await responsive.page.setViewportSize({width,height:900});await responsive.page.waitForTimeout(220);await noOverflow(responsive.page);if([320,390,768,1024,1440,1920].includes(width))await responsive.page.screenshot({path:`test-results/responsive-home-${width}.png`,fullPage:true});}
  await responsive.page.setViewportSize({width:390,height:844});await responsive.page.locator('.mobile-menu').click();assert.equal(await responsive.page.locator('.sidebar.open').isVisible(),true);assert.equal(await responsive.page.evaluate(()=>document.body.style.overflow),'hidden');await responsive.page.locator('.sidebar-scrim').click();assert.equal(await responsive.page.locator('.sidebar.open').count(),0);assert.equal(await responsive.page.evaluate(()=>document.body.style.overflow),'');await responsive.context.close();
  assert.deepEqual(failures,[]);
  await writeFile('test-results/browser-results.json',JSON.stringify({passed:true,viewports:[1440,390,768],responsiveWidths,data:'fictional network fixtures only',checks:['login','responsive overflow at 16 widths','mobile drawer open/dismiss/body-scroll handling','patient profile','Portuguese-only UI has no retired language toggle','save draft payload','navigation','logout clears UI','reception clinical UI hidden'],consoleErrors:failures},null,2));
  console.log('Browser checks passed at desktop, tablet and mobile sizes. Fixtures are fictional; RLS is tested separately.');
}finally{await browser.close();}
