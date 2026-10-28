/* Progressive enhancement: context without collecting private data or loading trackers. */
(function(){
  'use strict';
  const links=[...document.querySelectorAll('[data-hero-profile]')];
  const helper=document.querySelector('#hero-profile-status');
  const options=document.querySelector('#legatto-momento');
  const profileMessage={familia:'Olá, quero orientação para proteger minha família e minha renda.',empresa:'Olá, gostaria de analisar seguros e benefícios para minha empresa.'};
  const path=new URLSearchParams(location.search).get('prioridade')||'';
  const initial=path.split(',').map(s=>s.trim()).filter(Boolean);
  if(helper&&initial.length) helper.textContent='Você chegou com interesse em '+initial.map(s=>s==='familia'?'família':s==='empresa'?'empresa':s).join(' e ')+'. Você pode escolher seu próximo passo.';
  links.forEach(link=>{
    link.addEventListener('click',()=>{
      try{sessionStorage.setItem('legatto_perfil',link.dataset.heroProfile)}catch(e){}
    });
  });
  const choice=document.querySelector('#profile-contact');
  const select=document.querySelector('#legatto-perfil');
  function refresh(){
    if(!choice||!select)return;
    const p=select.value;
    const phase=options?.value||'conhecer';
    const phaseText={conhecer:'Quero conhecer as opções.',revisar:'Já tenho proteção e quero revisar.',contratar:'Pretendo contratar em breve.'}[phase];
    choice.href='https://wa.me/5511971371823?text='+encodeURIComponent(profileMessage[p]+' '+phaseText);
    choice.dataset.cta='diagnostico-contextual';
  }
  if(select){if(initial.includes('empresa')&&!initial.includes('familia'))select.value='empresa';select.addEventListener('change',refresh)}
  options?.addEventListener('change',refresh);
  refresh();
})();
