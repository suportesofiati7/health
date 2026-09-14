(() => {
  let language = localStorage.getItem('sofiati-language') || 'pt';
  const translate = () => {
    document.documentElement.lang = language === 'en' ? 'en' : 'pt-BR';
    document.querySelectorAll('[data-pt]').forEach(el => { el.textContent = el.dataset[language]; });
    document.querySelectorAll('[data-lang]').forEach(el => el.setAttribute('aria-pressed',String(el.dataset.lang === language)));
  };
  document.querySelectorAll('[data-lang]').forEach(el => el.addEventListener('click',() => {language=el.dataset.lang;localStorage.setItem('sofiati-language',language);translate();}));
  translate();
  const t=(pt,en)=>language==='en'?en:pt,form=document.querySelector('#intake');
  if(!form)return;
  const result=document.querySelector('#result'),submit=document.querySelector('#submit');let token='';
  if(!window.SOFIATI_PUBLIC?.turnstileSiteKey){result.textContent=t('Pré-cadastro temporariamente indisponível. Entre em contato com a clínica.','Pre-registration is temporarily unavailable. Please contact the clinic.');return;}
  const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;
  script.onload=()=>window.turnstile.render('#challenge',{sitekey:window.SOFIATI_PUBLIC.turnstileSiteKey,action:'preregister',callback:value=>{token=value;submit.disabled=false;},'expired-callback':()=>{token='';submit.disabled=true;}});document.head.append(script);
  form.addEventListener('submit',async event=>{
    event.preventDefault();submit.disabled=true;result.textContent=t('Enviando...','Sending...');
    const values=Object.fromEntries(new FormData(form));values.privacy=values.privacy==='on';values.token=token;
    try{
      const response=await fetch('https://naypgbhwnlbyqqqfftgn.supabase.co/functions/v1/intake',{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json','apikey':'sb_publishable_jH3gQ7-Tx8_-B191w3Gr1A_GkGHG9Hf'},body:JSON.stringify(values)});
      if(response.status!==202)throw Error('submission');
      form.replaceChildren();const message=document.createElement('p');message.setAttribute('role','status');message.textContent=t('Recebemos seu contato. Nossa equipe entrará em contato.','We received your enquiry. Our team will contact you.');form.append(message);
    }catch{result.textContent=t('Não foi possível enviar. Tente novamente ou entre em contato com a clínica.','Could not submit. Try again or contact the clinic.');token='';window.turnstile.reset();}
  });
})();
