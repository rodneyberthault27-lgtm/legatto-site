/* Scroll-craft: accessible editorial filtering. No trackers or personal-data storage. */
(()=>{'use strict';
 const groups={todos:null,pessoal:['familia','patrimonio','saude','profissao','seguro-auto'],empresarial:['empresa']};
 const buttons=[...document.querySelectorAll('[data-solution-filter]')];
 const cards=[...document.querySelectorAll('.solutions-grid .solution-card')];
 const count=document.getElementById('solution-filter-status');
 const apply=key=>{
   const included=groups[key]||null;
   let visible=0;
   cards.forEach(card=>{const show=!included||included.includes(card.id);card.hidden=!show;if(show)visible++});
   buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.solutionFilter===key)));
   if(count)count.textContent=visible+' soluções exibidas. Escolha uma para conhecer os detalhes.';
 };
 buttons.forEach(btn=>btn.addEventListener('click',()=>apply(btn.dataset.solutionFilter)));
 apply('todos');
})();
