'use strict';
(function (root) {
  const labels = {
    boundary: { unknown: 'Ainda preciso esclarecer os limites', clear: 'Não identifiquei violação após conferir', stop: 'Identifiquei um limite que seria ultrapassado' },
    reversible: { unknown: 'Reversibilidade ainda desconhecida', yes: 'Posso testar e voltar atrás', no: 'Difícil ou impossível de desfazer' },
    choice: { undecided: 'Ainda não escolhi', a: 'Rota A', b: 'Rota B' }
  };
  function field(value, max, required = false) {
    if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new TypeError('Revise os campos obrigatórios e os limites de tamanho.');
    return value.trim();
  }
  function option(value, values) {
    if (typeof value !== 'string' || !Object.hasOwn(values, value)) throw new TypeError('Opção inválida no mapa.');
    return value;
  }
  function normalize(data) {
    if (!data || !Array.isArray(data.routes) || data.routes.length !== 2) throw new TypeError('O mapa precisa de duas rotas.');
    const clean = {};
    for (const key of ['decision', 'desire', 'care', 'facts', 'action', 'limit', 'reason']) {
      clean[key] = field(data[key], key === 'decision' ? 240 : 1800, ['decision', 'action', 'limit'].includes(key));
    }
    clean.choice = option(data.choice, labels.choice);
    clean.review = field(data.review, 10, true);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(clean.review) || Number.isNaN(Date.parse(clean.review)) || new Date(clean.review).toISOString().slice(0, 10) !== clean.review) throw new TypeError('Escolha uma data de revisão válida.');
    clean.routes = data.routes.map(route => {
      if (!route || typeof route !== 'object') throw new TypeError('Rota inválida.');
      const r = {};
      for (const key of ['name', 'benefit', 'cost', 'impact', 'evidence']) r[key] = field(route[key], key === 'name' ? 120 : 1800, key === 'name');
      r.boundary = option(route.boundary, labels.boundary);
      r.reversible = option(route.reversible, labels.reversible);
      return r;
    });
    return clean;
  }
  function assess(route) {
    const gaps = [];
    if (!route.benefit) gaps.push('Descrever o benefício esperado.');
    if (!route.cost) gaps.push('Levantar custos, tempo e cuidados necessários.');
    if (!route.impact) gaps.push('Identificar quem ganha, quem assume riscos e quem precisa ser ouvido.');
    if (!route.evidence) gaps.push('Registrar o que foi conferido e o que falta verificar.');
    if (route.boundary === 'unknown') gaps.push('Esclarecer direitos, consentimento e necessidades essenciais.');
    if (route.reversible === 'unknown') gaps.push('Verificar se é possível desfazer ou fazer um teste menor.');
    const kind = route.boundary === 'stop' ? 'barrier' : gaps.length ? 'pending' : 'review';
    const heading = { barrier: 'Limite identificado', pending: 'Há pontos a esclarecer', review: 'Informações registradas' }[kind];
    const guidance = {
      barrier: 'Redesenhe ou recuse esta rota enquanto o limite permanecer. Um benefício não compensa a violação de um direito.',
      pending: 'As lacunas abaixo precisam de investigação. Desconhecimento não equivale a segurança.',
      review: 'Revise a qualidade das informações com os envolvidos. O preenchimento não comprova segurança nem torna esta rota superior.'
    }[kind];
    return { kind, heading, guidance, gaps, irreversible: route.reversible === 'no' };
  }
  function evaluate(data) {
    const clean = normalize(data);
    const routes = clean.routes.map(route => ({ ...route, assessment: assess(route) }));
    const selected = clean.choice === 'undecided' ? null : routes[clean.choice === 'a' ? 0 : 1];
    let notice = selected ? `Você indicou ${selected.name}. A preferência é sua; o mapa não escolhe nem classifica pessoas.` : 'Você pode continuar investigando. Esperar com uma pergunta e uma data de revisão também é um próximo passo.';
    if (selected?.assessment.kind === 'barrier') notice = 'Sua preferência contém um limite identificado. Use o próximo passo para resolver esse limite ou buscar outra rota antes de assumir o compromisso.';
    else if (selected?.assessment.kind === 'pending') notice += ' Há pendências nessa rota: investigue-as antes do compromisso.';
    return { ...clean, routes, notice };
  }
  const quote = text => (text || 'Não informado.').split(/\r?\n/).map(line => '> ' + line).join('\n');
  function toMarkdown(data) {
    const r = evaluate(data);
    const text = ['# Meu mapa de escolhas', '', 'Bússola da Honra · edição 1.4 · registro educativo do próprio usuário.', '', '## Decisão', quote(r.decision)];
    for (const [key, label] of [['desire', 'O que quero viver'], ['care', 'O que preciso proteger'], ['facts', 'Fatos, hipóteses e fontes']]) text.push('', '## ' + label, quote(r[key]));
    r.routes.forEach((route, i) => {
      text.push('', '## Rota ' + (i === 0 ? 'A' : 'B'), quote(route.name), '', '**' + route.assessment.heading + '**', route.assessment.guidance);
      for (const [key, label] of [['benefit', 'Benefício esperado'], ['cost', 'Custos e cuidados'], ['impact', 'Pessoas e impactos'], ['evidence', 'O que conferi / o que falta']]) text.push('', '### ' + label, quote(route[key]));
      text.push('', labels.boundary[route.boundary] + '.', labels.reversible[route.reversible] + '.');
      if (route.assessment.irreversible) text.push('Examine as consequências difíceis de reverter antes de se comprometer.');
      if (route.assessment.gaps.length) text.push('', '### Pendências', ...route.assessment.gaps.map(g => '- ' + g));
    });
    text.push('', '## Minha direção', labels.choice[r.choice], quote(r.reason), '', r.notice, '', '## Próximo passo', quote(r.action), '', '## Limite para parar', quote(r.limit), '', '## Rever em', r.review, '', '## Ao voltar', '- O que mudou nos fatos?', '- Quem foi afetado e o que essa pessoa relata?', '- Preciso manter, adaptar ou encerrar o plano?', '', 'O mapa não verifica as respostas, calcula merecimento ou garante resultados. Nenhuma resposta é enviada automaticamente.');
    return text.join('\n') + '\n';
  }
  const api = { evaluate, toMarkdown, labels };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HonraMap = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
