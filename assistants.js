'use strict';
(()=>{
 const find=id=>document.getElementById(id), form=find('assistant-form');
 const fields=[0,1,2].map(i=>find('answer-'+i));
 const drafts=new Map();let active='honra-clareza';
 const buttons=[...document.querySelectorAll('[data-agent]')];
 const result=find('assistant-result'), output=find('assistant-output'), status=find('assistant-status');
 function saveDraft(){drafts.set(active,{answers:fields.map(f=>f.value),output:result.hidden?'':output.value});}
 function selectAgent(id,focus=true){
  const agent=HonraAssistants.getAgent(id);saveDraft();active=id;
  const draft=drafts.get(id)||{answers:['','',''],output:''};
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.agent===id)));
  find('agent-letter').textContent=agent.letter;find('agent-category').textContent=agent.category;
  find('agent-name').textContent=agent.name;find('agent-purpose').textContent=agent.purpose;
  find('agent-skill').textContent=agent.skill;find('agent-output-kind').textContent=agent.output;
  find('agent-boundary').textContent=agent.boundary;
  fields.forEach((f,i)=>{find('question-'+i).textContent=agent.questions[i]+(i===0?' *':' (opcional)');f.value=draft.answers[i];f.setCustomValidity('');});
  const example=find('agent-example');example.replaceChildren();
  agent.example.forEach((text,i)=>{const p=document.createElement('p'),b=document.createElement('strong');b.textContent=agent.questions[i]+' ';p.append(b,document.createTextNode(text));example.append(p);});
  const details=find('example-details');details.open=false;
  find('download-agent').href=`assistentes/agents/${id}.agent.md`;
  find('download-skill').href=`assistentes/skills/${id}/SKILL.md`;
  output.value=draft.output;result.hidden=!draft.output;status.textContent='';
  if(focus){find('agent-name').focus();}
 }
 fields.forEach(field=>field.addEventListener('input',()=>{
  field.setCustomValidity('');
  if(!result.hidden)status.textContent='Resposta alterada. Prepare o roteiro novamente para copiar ou baixar a versão atual.';
  result.hidden=true;output.value='';saveDraft();
 }));
 form.addEventListener('submit',event=>{
  event.preventDefault();
  fields[0].setCustomValidity(fields[0].value.trim()?'':'Descreva a situação antes de continuar.');
  if(!form.reportValidity())return;
  try{output.value=HonraAssistants.prepare(active,fields.map(f=>f.value));result.hidden=false;saveDraft();status.textContent='Roteiro preparado. Revise antes de compartilhar.';find('result-heading').focus();}
  catch(error){status.textContent=error.message;}
 });
 buttons.forEach(button=>button.addEventListener('click',()=>selectAgent(button.dataset.agent)));
 find('copy-prompt').addEventListener('click',async()=>{
  if(result.hidden)return;
  try{await HonraPlatform.copy(output.value);status.textContent='Roteiro copiado. Você escolhe onde colar e compartilhar.';}
  catch{output.focus();output.select();status.textContent='Cópia automática indisponível. O texto foi selecionado: use ⌘C no Mac ou Ctrl+C.';}
 });
 find('download-prompt').addEventListener('click',async()=>{
  if(result.hidden)return;
  status.textContent=await HonraPlatform.exportText(output.value,`meu-roteiro-${active}.md`);
 });
 const menu=document.querySelector('.menu-toggle'),nav=find('main-nav');
 menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open');}));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open');menu.focus();}});
 document.documentElement.classList.add('js-ready');
 // Render the initial agent without moving keyboard focus.
 selectAgent(active,false);
})();
