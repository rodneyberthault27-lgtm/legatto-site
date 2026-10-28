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
   if(count)count.textContent=visible+(visible===1?' solução exibida.':' soluções exibidas.')+' Escolha uma para conhecer os detalhes.';
 };
 buttons.forEach(btn=>btn.addEventListener('click',()=>apply(btn.dataset.solutionFilter)));
 // A direct link to a solution must remain useful after any filter choice.
 const revealTarget=()=>{
   const card=cards.find(card=>'#'+card.id===location.hash);
   if(card?.hidden){apply('todos');card.scrollIntoView({block:'start',behavior:'instant'})}
 };
 document.addEventListener('click',event=>{
   const link=event.target.closest('a[href^="#"]');
   const card=link&&cards.find(card=>'#'+card.id===link.hash);
   if(!card||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   event.preventDefault();
   if(card.hidden)apply('todos');
   history.pushState(null,'',link.hash);
   // Apply the target state and changed grid before calculating scroll position.
   requestAnimationFrame(()=>{
     card.tabIndex=-1;
     card.focus({preventScroll:true});
     card.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
   });
 });
 addEventListener('hashchange',revealTarget);
 document.querySelector('.solutions')?.classList.add('filters-ready');
 apply('todos');
 revealTarget();
})();
