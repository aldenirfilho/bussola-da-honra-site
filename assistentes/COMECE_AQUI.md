# 🧭 Agentes e habilidades HONRA

Edição 1.3 · 10/10/2026 · Aldenir Rocha de Oliveira Filho.

## O que está pronto

Seis assistentes guiados organizam perguntas e preparam instruções reutilizáveis. O site não usa API de inteligência artificial, não lê repositórios e não executa os agentes. Suas respostas permanecem na memória da aba até fechá-la ou recarregá-la. Copiar e colar em outra ferramenta é uma ação sua e passa a seguir as regras dessa ferramenta.

| Agente | Habilidade | Quando usar |
|---|---|---|
| Curador da Clareza | honra-clareza | Separar fatos, relatos, desejos e hipóteses |
| Cartógrafo dos Impactos | honra-impactos | Examinar quem ganha, assume custos e precisa ser ouvido |
| Guardião dos Limites | honra-limites | Explicitar direitos, consentimento e recursos essenciais |
| Arquiteto de Rotas | honra-rotas | Comparar agir, testar, esperar e recusar |
| Mentor do Próximo Passo | honra-proximo-passo | Retomar uma tarefa com ação, limite e revisão |
| Companheiro da Fé Responsável | honra-fe-responsavel | Relacionar convicção, responsabilidade e liberdade |

## Usar no site

1. Abra a página Agentes e habilidades e escolha um assistente.
2. Responda às três perguntas; a primeira é obrigatória. Os exemplos são fictícios e servem como referência.
3. Clique em **Preparar meu roteiro**. O texto é montado por regras fixas, sem análise de IA.
4. Copie para seu assistente preferido ou baixe o registro em Markdown.

Trocar de assistente preserva os rascunhos durante a sessão. Editar uma resposta exige gerar o roteiro novamente, evitando exportar texto desatualizado. Antes de compartilhar, revise nomes, dados de terceiros e informações sensíveis.

## Copiar ou baixar

- **Instruções do agente (.agent.md):** papel, procedimento, resultado esperado e limites.
- **Habilidade (SKILL.md):** capacidade reutilizável, com indicação de quando aplicá-la.
- **Biblioteca (.md):** todos os roteiros num único arquivo de leitura.
- **Biblioteca (.zip):** seis perfis em `.github/agents/` e seis habilidades em `.github/skills/`, com metadados opcionais para Codex.

Baixar o ZIP não instala nem ativa um agente. Os arquivos podem ser encontrados na biblioteca ZIP do site público. O repositório de desenvolvimento também mantém os perfis nas pastas nativas. Em um ambiente compatível com agentes personalizados do GitHub Copilot, use o seletor de agentes para escolher o perfil disponível. Disponibilidade depende do cliente e do acesso ao Copilot; esta entrega não altera assinatura nem permissões.

Para outro repositório seu, copie as pastas desejadas de `.github/agents/` e `.github/skills/`, preservando seus arquivos existentes. Para uma ferramenta que aceite skills, copie a pasta completa da habilidade para o diretório de skills documentado por ela. O `SKILL.md` também pode ser lido e copiado como instrução comum. Nenhuma instalação global foi realizada nesta entrega.

## Manutenção

`agents/catalog.json` é a fonte do catálogo, das instruções e dos exemplos. Edite-a e execute `npm run sync`; o gerador atualiza os perfis, as skills e os downloads do site. Depois execute `npm run check` para verificar consistência e comportamento. Não edite apenas uma cópia gerada.

`AGENTS.md` orienta a manutenção do repositório; ele não é um sétimo assistente de reflexão.

## Fundamentos e limites

Todos os perfis preservam liberdade de recusa, dignidade, consentimento e distinção entre fé, interpretação e fato verificável. Não produzem notas morais nem prometem segurança, prosperidade, diagnóstico ou resultado. Ferramentas de IA podem errar; o roteiro não valida o que uma IA responder.

Os perfis do Copilot declaram somente ferramentas de leitura e busca. O uso efetivo dessas ferramentas depende do cliente; as instruções não autorizam publicação, mensagens, compras ou edição de arquivos.

Formatos consultados em 10/10/2026: [agentes personalizados do GitHub](https://docs.github.com/en/copilot/reference/custom-agents-configuration) e [habilidades do GitHub Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills). A estrutura dos arquivos foi conferida; não foi executada uma sessão no Copilot.
