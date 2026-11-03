'use strict';
(() => {
  const find = id => document.getElementById(id);
  const form = find('map-form'), steps = [...form.querySelectorAll('.map-step')];
  const result = find('map-result'), status = find('map-status');
  let step = 0, prepared = '';
  const names = ['decision', 'desire', 'care', 'facts', 'choice', 'reason', 'action', 'limit', 'review'];
  const routeNames = ['name', 'benefit', 'cost', 'impact', 'evidence', 'boundary', 'reversible'];
  function collect() {
    const data = Object.fromEntries(names.map(n => [n, form.elements.namedItem(n).value]));
    data.routes = ['a', 'b'].map(letter => Object.fromEntries(routeNames.map(n => [n, form.elements.namedItem(letter + '-' + n).value])));
    return data;
  }
  function showStep(index, focus = true) {
    step = index;
    find('map-instructions').hidden = false;
    steps.forEach((s, i) => {
      s.hidden = i !== step;
      s.disabled = i !== step;
    });
    [...document.querySelectorAll('.map-progress li')].forEach((item, i) => {
      if (i === step) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
    });
    find('map-count').textContent = `ETAPA ${step + 1} DE 3`;
    find('map-back').hidden = step === 0;
    find('map-next').hidden = step === 2;
    find('map-finish').hidden = step !== 2;
    find('map-next').textContent = step === 0 ? 'Comparar minhas rotas →' : 'Definir meu próximo passo →';
    if (focus) steps[step].querySelector('legend').focus();
  }
  function validStep() {
    const fields = [...steps[step].querySelectorAll('input, textarea')];
    fields.forEach(f => f.setCustomValidity(f.required && !f.value.trim() ? 'Preencha este campo antes de continuar.' : ''));
    return form.reportValidity();
  }
  function invalidate() {
    if (prepared) status.textContent = 'Resposta alterada. Gere o mapa novamente para baixar um registro atualizado.';
    prepared = ''; result.hidden = true;
  }
  function appendText(parent, tag, text, className) {
    const element = document.createElement(tag); element.textContent = text;
    if (className) element.className = className;
    parent.append(element); return element;
  }
  function detail(parent, label, text) {
    appendText(parent, 'dt', label); appendText(parent, 'dd', text || 'Não informado.');
  }
  function render(data) {
    const model = HonraMap.evaluate(data);
    prepared = HonraMap.toMarkdown(data);
    find('map-result-decision').textContent = model.decision;
    find('map-notice').textContent = model.notice;
    const routes = find('map-result-routes'); routes.replaceChildren();
    model.routes.forEach((route, i) => {
      const card = document.createElement('article');card.className = 'map-route-result';card.dataset.kind = route.assessment.kind;
      appendText(card, 'p', `ROTA ${i === 0 ? 'A' : 'B'} · ${route.assessment.heading}`, 'route-state');
      appendText(card, 'h3', route.name);appendText(card, 'p', route.assessment.guidance);
      const dl = document.createElement('dl');card.append(dl);
      for (const [key, label] of [['benefit', 'O que oferece'], ['cost', 'O que exige'], ['impact', 'Pessoas e impactos'], ['evidence', 'Verificação e dúvidas']]) detail(dl, label, route[key]);
      appendText(card, 'p', HonraMap.labels.boundary[route.boundary] + '.');
      appendText(card, 'p', HonraMap.labels.reversible[route.reversible] + '.');
      if (route.assessment.irreversible) appendText(card, 'p', 'Examine as consequências difíceis de reverter antes de se comprometer.');
      if (route.assessment.gaps.length) {
        appendText(card, 'h4', 'Para esclarecer');const list = document.createElement('ul');card.append(list);
        route.assessment.gaps.forEach(gap => appendText(list, 'li', gap));
      }
      routes.append(card);
    });
    const action = find('map-result-action');action.replaceChildren();
    for (const [key, label] of [['desire', 'O que quero viver'], ['care', 'O que preciso proteger'], ['facts', 'Fatos, hipóteses e fontes'], ['reason', 'Minha razão para esta direção'], ['action', 'Meu próximo passo'], ['limit', 'Meu limite para parar']]) detail(action, label, model[key]);
    detail(action, 'Minha direção', HonraMap.labels.choice[model.choice]);
    detail(action, 'Rever em', model.review.split('-').reverse().join('/'));
    find('map-instructions').hidden = true;find('map-count').textContent = 'REGISTRO DE ESCOLHA';
    form.hidden = true;result.hidden = false;status.textContent = 'Mapa organizado. Leia as pendências e baixe seu registro para guardá-lo.';
    find('map-result-title').focus();
  }
  find('map-next').addEventListener('click', () => { if (validStep()) showStep(step + 1); });
  find('map-back').addEventListener('click', () => showStep(step - 1));
  form.addEventListener('input', event => { event.target.setCustomValidity?.('');invalidate(); });
  form.addEventListener('change', invalidate);
  form.addEventListener('submit', event => {
    event.preventDefault();if (!validStep()) return;
    if (step < 2) { showStep(step + 1);return; }
    try { render(collect()); } catch (error) { status.textContent = error.message; }
  });
  find('map-edit').addEventListener('click', () => { result.hidden = true;form.hidden = false;status.textContent = 'Revise suas respostas e gere o mapa novamente ao terminar.';showStep(0); });
  find('map-download').addEventListener('click', async () => {
    if (!prepared || result.hidden) return;
    status.textContent = await HonraPlatform.exportText(prepared, 'meu-mapa-de-escolhas.md');
  });
  find('map-print').addEventListener('click', () => { if (!result.hidden && prepared) window.print(); });
  find('load-example').addEventListener('click', () => {
    if ([...form.querySelectorAll('input,textarea')].some(f => f.value.trim())) { status.textContent = 'Seu mapa já contém respostas. O exemplo não substituiu seu rascunho; você pode lê-lo ao lado.';return; }
    const sample = {
      decision: 'Como voltar a pintar sem assumir mais compromissos do que consigo cumprir?',
      desire: 'Ter um espaço para criar e experimentar, sem precisar transformar tudo em produtividade.',
      care: 'Meu descanso, os compromissos da casa e a liberdade de mudar de ideia.',
      facts: 'Exemplo fictício: conferi a duração de um curso, mas ainda preciso conversar sobre o horário compartilhado.',
      'a-name': 'Montar um ateliê completo agora', 'a-benefit': 'Criar com liberdade em um espaço próprio.', 'a-cost': 'Comprar materiais e reorganizar um cômodo antes de conhecer minha rotina de pintura.',
      'a-impact': 'Eu usaria um espaço que também serve às pessoas da casa.', 'a-evidence': 'Tenho uma lista inicial. Falta conferir os custos totais e combinar o uso do espaço.', 'a-boundary': 'unknown', 'a-reversible': 'no',
      'b-name': 'Testar um curso com materiais emprestados', 'b-benefit': 'Conhecer a atividade e descobrir o que gosto de pintar.', 'b-cost': 'Reservar um período da semana e combinar o empréstimo dos materiais.',
      'b-impact': 'Preciso alinhar horários e as condições do empréstimo com os envolvidos.', 'b-evidence': 'Conferi o horário. Ainda preciso confirmar a disponibilidade dos materiais.', 'b-boundary': 'unknown', 'b-reversible': 'yes',
      choice: 'b', reason: 'Quero testar a rotina antes de uma compra maior. Reconsiderarei se o horário comprometer meu descanso.',
      action: 'Conversar sobre o horário e confirmar os materiais antes de me inscrever.', limit: 'Não assumir compromisso que reduza meu descanso ou use recursos destinados a obrigações.'
    };
    for (const [key, value] of Object.entries(sample)) form.elements.namedItem(key).value = value;
    status.textContent = 'Exemplo fictício carregado. Escolha uma data de revisão ao chegar à etapa 3.';showStep(0);
  });
  const menu = document.querySelector('.menu-toggle'), nav = find('main-nav');
  function closeMenu() { menu.setAttribute('aria-expanded', 'false');nav.classList.remove('is-open'); }
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true';menu.setAttribute('aria-expanded', String(open));nav.classList.toggle('is-open', open); });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu();menu.focus(); } });
  document.documentElement.classList.add('js-ready');showStep(0, false);
})();
