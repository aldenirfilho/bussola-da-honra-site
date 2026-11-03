'use strict';

(function (root) {
  function evaluate(answers) {
    const valid = {
      harm: ['yes', 'no', 'unknown'],
      resources: ['yes', 'no', 'unknown'],
      pressure: ['yes', 'no', 'unknown'],
    };
    for (const [key, allowed] of Object.entries(valid)) {
      if (!answers || !allowed.includes(answers[key])) {
        throw new TypeError('Resposta inválida para ' + key);
      }
    }

    const barriers = [];
    const unknowns = [];
    if (answers.harm === 'yes') {
      barriers.push('Você identificou risco grave, violação de direitos ou falta de consentimento.');
    }
    if (answers.resources === 'no') {
      barriers.push('Você informou que recursos ou compromissos essenciais seriam comprometidos.');
    }
    if (answers.pressure === 'yes') {
      barriers.push('Você relatou pressão que pode comprometer a liberdade da escolha.');
    }
    if (answers.harm === 'unknown') {
      unknowns.push('Esclarecer segurança, direitos e consentimento.');
    }
    if (answers.resources === 'unknown') {
      unknowns.push('Conferir recursos, custos totais, obrigações e proteção para imprevistos.');
    }
    if (answers.pressure === 'unknown') {
      unknowns.push('Verificar se há pressão, urgência artificial ou exigência de segredo.');
    }

    // Um limite conhecido prevalece mesmo quando outras respostas são favoráveis.
    if (barriers.length) {
      return {
        kind: 'barrier',
        title: 'Resolva os limites antes de assumir o compromisso.',
        guidance: 'Suas respostas apontam um problema a resolver. Reveja a opção e busque a informação ou o apoio necessário antes de avançar. Em perigo imediato, procure ajuda apropriada.',
        barriers,
        unknowns,
      };
    }
    if (unknowns.length) {
      return {
        kind: 'unknown',
        title: 'Esclareça o que falta antes de decidir.',
        guidance: 'Transforme as pendências em perguntas concretas. Obtenha as respostas necessárias antes de assumir um compromisso difícil de desfazer.',
        barriers,
        unknowns,
      };
    }
    return {
      kind: 'reflect',
      title: 'Defina um próximo passo e quando revê-lo.',
      guidance: 'Você não relatou os impedimentos perguntados. Compare as alternativas e escolha como agir, testar, esperar ou recusar, mantendo seus limites. A ausência desses alertas não comprova segurança.',
      barriers,
      unknowns,
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { evaluate };
  } else {
    root.HonraDecision = { evaluate };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
