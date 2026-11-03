'use strict';
const $ = (selector) => document.querySelector(selector);
function updateBalance(){
 const desire=Number($('#desire').value),caution=Number($('#caution').value);
 $('#desire-value').textContent=`${desire} / 10`;$('#caution-value').textContent=`${caution} / 10`;
 let title='Transforme a tensão em investigação.',text='Qual informação ajudaria você a escolher um próximo passo que possa rever?';
 if(desire>=7&&caution>=7){title='Você pode desejar e ter receio.';text='Separe o que atrai do que ameaça. Qual teste limitado preservaria o que importa sem assumir o compromisso inteiro?';}
 else if(desire-caution>=3){title='Dê um lugar à pergunta difícil.';text='O que faria você mudar de ideia? Confira custos, consentimento e consequências antes de transformar entusiasmo em compromisso.';}
 else if(caution-desire>=3){title='Dê um lugar à possibilidade.';text='Seu receio aponta um risco verificável ou uma incerteza inevitável? O que você perde ao adiar, e qual passo seguro permitiria aprender?';}
 else if(desire<=3&&caution<=3){title='Talvez falte clareza sobre o propósito.';text='Você precisa decidir isso agora? Identifique de quem é esse desejo e se ele merece seu tempo neste momento.';}
 $('#balance-title').textContent=title;$('#balance-text').textContent=text;
}
$('#desire').addEventListener('input',updateBalance);$('#caution').addEventListener('input',updateBalance);
const cases={
 sonho:{label:'EXEMPLO FICTÍCIO / VIDA E DINHEIRO',title:'Guardar para viver. E reservar espaço para viver agora.',story:'Helena trabalha, cumpre suas obrigações e guarda dinheiro. Há anos adia uma viagem importante com a mãe, mesmo após conferir que o custo cabe no valor destinado a lazer e preserva sua proteção financeira.',tension:'O receio de qualquer gasto começa a ocupar o lugar do planejamento.',action:'Definir o custo total, preservar as obrigações e a reserva, comparar opções e marcar a experiência. Se o orçamento não comportar, reduzir a escala ou estabelecer uma meta e uma data para revisão.',question:'Meu dinheiro está servindo à vida que valorizo?'},
 compra:{label:'EXEMPLO FICTÍCIO / CONSUMO E JUSTIÇA',title:'O produto dos seus sonhos também precisa caber na sua realidade.',story:'Rafael quer um carro específico. O vendedor oferece uma parcela atraente e diz que o desconto termina hoje. A marca divulga projetos sociais, mas Rafael ainda não conferiu o contrato, os custos de manutenção e a assistência.',tension:'O desejo legítimo se mistura à urgência da oferta e à confiança na imagem da empresa.',action:'Pedir condições por escrito, verificar a empresa e o produto separadamente, calcular o custo completo e comparar propostas. Negociar um preço justificável para ambos. Se comprometer o essencial, planejar outra data ou alternativa.',question:'Estou escolhendo o que me satisfaz com fatos suficientes, liberdade e recursos?'},
 coragem:{label:'EXEMPLO FICTÍCIO / PROPÓSITO E EXECUÇÃO',title:'Você não precisa abandonar tudo para começar algo importante.',story:'Clara deseja criar um projeto educativo. Tem conhecimento e entusiasmo, mas teme perder sua estabilidade. Oscila entre desistir e comprometer todas as economias na primeira versão.',tension:'Pensar grande se confunde com começar grande; querer segurança se confunde com não começar.',action:'Testar uma pequena oficina com orçamento e tempo delimitados, colher feedback real e decidir a próxima etapa. Escrever antes do teste o que significará continuar, ajustar ou parar.',question:'Qual experiência pequena produziria aprendizado sem colocar o essencial em risco?'},
 familia:{label:'EXEMPLO FICTÍCIO / FAMÍLIA E AUTONOMIA',title:'Transmitir patrimônio pode incluir ensinar a construir.',story:'Uma família quer que os filhos desenvolvam responsabilidade, mas teme que a ajuda os impeça de aprender. Surge a ideia de impor dificuldades para que “façam por merecer”.',tension:'Estimular autonomia não exige privar de segurança, afeto, educação ou cuidado.',action:'Oferecer apoio e responsabilidades compatíveis com a idade, conversar sobre esforço, dinheiro e cooperação, e permitir desafios seguros. Reconhecer contribuições sem condicionar amor ou dignidade ao desempenho.',question:'Estou ajudando a desenvolver autonomia ou criando sofrimento desnecessário?'}
};
document.querySelectorAll('[data-case]').forEach(button=>button.addEventListener('click',()=>{
 const data=cases[button.dataset.case];
 document.querySelectorAll('[data-case]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
 for(const key of ['label','title','story','tension','action','question'])$('#case-'+key).textContent=data[key];
}));
const form=$('#decision-form');form.noValidate=true;
const steps=[...document.querySelectorAll('.form-step')];let step=0;let lastRecord=null;
function showStep(index,focus=true){
 step=index;steps.forEach((el,i)=>el.hidden=i!==index);
 $('#step-count').textContent=`Etapa ${index+1} de 5`;
 document.querySelectorAll('.step-track span').forEach((el,i)=>{el.classList.toggle('active',i===index);el.classList.toggle('completed',i<index);if(i===index)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
 $('#previous').hidden=index===0;$('#next').hidden=index===4;$('#finish').hidden=index!==4;
 if(focus){const legend=steps[index].querySelector('legend');legend.tabIndex=-1;legend.focus();}
}
function currentValid(){for(const field of steps[step].querySelectorAll('input,textarea,select')){field.setCustomValidity(field.required&&!field.value.trim()?'Preencha este campo antes de continuar.':'');if(!field.checkValidity()){field.reportValidity();return false;}}return true;}
form.addEventListener('input',event=>{if(typeof event.target.setCustomValidity==='function')event.target.setCustomValidity('');});
$('#next').addEventListener('click',()=>{if(currentValid())showStep(step+1);});
$('#previous').addEventListener('click',()=>showStep(step-1));
const labels={decision:'Decisão',desireReason:'Desejo e significado',facts:'Fatos e incertezas',people:'Pessoas envolvidas e impactos',fairness:'Resultado justo',harm:'Risco grave, violação ou falta de consentimento',resources:'Preservação de recursos essenciais',pressure:'Pressão sobre a escolha',options:'Alternativas consideradas',counterpoint:'Argumento contrário',action:'Próximo passo proposto por você',review:'Data de revisão',limit:'Limite para parar'};
const answerNames = {
  harm: {yes: 'Problema identificado', no: 'Não identificado após conferência', unknown: 'Ainda não esclarecido'},
  resources: {yes: 'Preservação conferida', no: 'Comprometimento identificado', unknown: 'Ainda não conferido'},
  pressure: {yes: 'Pressão identificada', no: 'Não identificada', unknown: 'Ainda não esclarecida'},
};
function readAnswers(){const data=Object.fromEntries(new FormData(form));for(const key of Object.keys(data))data[key]=data[key].trim();return data;}
function displayValue(key,value){if(['harm','resources','pressure'].includes(key))return answerNames[key][value];if(key==='review'&&value){const [y,m,d]=value.split('-');return `${d}/${m}/${y}`;}return value||'Não informado';}
function createSummary(){
 const answers=readAnswers();const assessment=HonraDecision.evaluate(answers);
 lastRecord={answers,assessment,createdAt:new Date().toISOString()};
 $('#result-title').textContent=assessment.title;
 $('#result-guidance').textContent = assessment.guidance;
 const points = $('#result-points');
 points.replaceChildren();
 for (const [title, items] of [['Limites informados', assessment.barriers], ['O que falta esclarecer', assessment.unknowns]]) {
   if (!items.length) continue;
   const group = document.createElement('section');
   group.className = 'result-points-group';
   const heading = document.createElement('h4');
   heading.textContent = title;
   const list = document.createElement('ul');
   for (const text of items) {
     const item = document.createElement('li');
     item.textContent = text;
     list.append(item);
   }
   group.append(heading, list);
   points.append(group);
 }
 const dl=$('#result-details');dl.replaceChildren();
 for(const [key,label]of Object.entries(labels)){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=displayValue(key,answers[key]);dl.append(dt,dd);}
 form.hidden=true;$('#decision-result').hidden=false;$('#step-count').textContent='Reflexão organizada';$('#decision-result').focus();
}
form.addEventListener('submit',event=>{
 event.preventDefault();if(!currentValid())return;
 if(step<4){showStep(step+1);return;}
 for(let i=0;i<steps.length;i++){const invalid=[...steps[i].querySelectorAll('input,textarea,select')].find(el=>!el.checkValidity());if(invalid){showStep(i);invalid.reportValidity();return;}}
 createSummary();
});
$('#edit').addEventListener('click',()=>{$('#decision-result').hidden=true;form.hidden=false;lastRecord=null;showStep(0);});
$('#download').addEventListener('click',async()=>{
 if(!lastRecord)return;
 const {answers,assessment,createdAt}=lastRecord;
 const date = new Intl.DateTimeFormat('pt-BR', {dateStyle: 'short', timeStyle: 'short'}).format(new Date(createdAt));
 const parts = ['# Meu registro de decisão — Bússola da Honra', `Edição 1.3 · Gerado em ${date} (horário deste dispositivo).`, '## Orientação para revisar', assessment.title, assessment.guidance];
 if (assessment.barriers.length) parts.push('## Limites informados\n\n' + assessment.barriers.map(text => '- ' + text).join('\n'));
 if (assessment.unknowns.length) parts.push('## O que falta esclarecer\n\n' + assessment.unknowns.map(text => '- ' + text).join('\n'));
 for(const [key,label]of Object.entries(labels))parts.push(`## ${label}\n\n${displayValue(key,answers[key])}`);
 parts.push('## Ao revisar esta decisão\n\nO que aprendi? Quem foi afetado? Algum limite mudou? Qual é o próximo passo agora?', 'Roteiro educativo autoral, não validado como escala. Este registro não comprova segurança nem prevê o resultado.');
 const message=await HonraPlatform.exportText(parts.join('\n\n')+'\n','minha-decisao-honra.md');
 let status=$('#export-status');if(!status){status=document.createElement('p');status.id='export-status';status.setAttribute('role','status');$('#download').after(status);}status.textContent=message;
});
showStep(0,false);
// Progressive enhancement: one explicit, reversible action using the same visible controls.
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
 try{Promise.resolve(document.modelContext.registerTool({
  name:'set_reflection_balance',title:'Ajustar a reflexão sobre desejo e cautela',
  description:'Ajusta apenas os dois controles visíveis de autopercepção e retorna a pergunta exibida. Não preenche nem conclui o roteiro de decisão.',
  inputSchema:{type:'object',properties:{desire:{type:'integer',minimum:0,maximum:10},caution:{type:'integer',minimum:0,maximum:10}},required:['desire','caution'],additionalProperties:false},
  annotations:{readOnlyHint:false,untrustedContentHint:false},
  execute(input){if(!input||Object.keys(input).some(key=>!['desire','caution'].includes(key))||![input.desire,input.caution].every(n=>Number.isInteger(n)&&n>=0&&n<=10))throw new TypeError('Informe desejo e cautela como inteiros entre 0 e 10.');$('#desire').value=String(input.desire);$('#caution').value=String(input.caution);updateBalance();return {title:$('#balance-title').textContent,question:$('#balance-text').textContent};}
 },{signal:lifecycle.signal})).catch(()=>{});}catch{/* The site remains functional without the optional browser API. */}
}

// Navigation preserves access without JavaScript; the compact menu is progressive.
const menuButton = $('.menu-toggle');
const navigation = $('#main-nav');
menuButton.addEventListener('click', () => {
 const open = menuButton.getAttribute('aria-expanded') !== 'true';
 menuButton.setAttribute('aria-expanded', String(open));
 navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
 menuButton.setAttribute('aria-expanded', 'false');
 navigation.classList.remove('is-open');
}));
document.addEventListener('keydown', event => {
 if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
  menuButton.focus();
 }
});
document.documentElement.classList.add('js-ready');
$('#print-record').addEventListener('click', () => {
 document.body.classList.add('print-record');
 window.print();
});
window.addEventListener('afterprint', () => document.body.classList.remove('print-record'));
