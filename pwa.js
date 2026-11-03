'use strict';
(() => {
  const find = id => document.getElementById(id);
  const link = 'https://aldenirfilho.github.io/bussola-da-honra-site/aplicativo.html';
  const message = '🧭 Conheça a Bússola da Honra: um site gratuito para refletir sobre decisões com coragem, discernimento, fé e responsabilidade. Compare caminhos, reconheça limites e encontre um próximo passo — a escolha continua sendo sua.';
  let installPrompt = null;
  const install = find('install-app');
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();installPrompt = event;
    if (install) install.hidden = false;
  });
  install?.addEventListener('click', async () => {
    if (!installPrompt) return;
    const current = installPrompt;installPrompt = null;install.hidden = true;
    try { await current.prompt();await current.userChoice; } catch { /* The browser may dismiss its own prompt. */ }
  });
  window.addEventListener('appinstalled', () => { if (install) install.hidden = true;if (find('app-mode')) find('app-mode').textContent = 'Aplicativo adicionado ao seu dispositivo.'; });
  if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
    if (find('app-mode')) find('app-mode').textContent = 'Você está usando a Bússola como aplicativo.';
  }
  const sharedText = message + '\n🌐 ' + link;
  const fallback = () => {
    const field = find('invite-fallback');if (!field) return;
    field.hidden = false;field.value = sharedText;field.focus();field.select();
    find('share-status').textContent = 'Selecione e copie o convite para colar no WhatsApp.';
  };
  find('copy-invite')?.addEventListener('click', async () => {
    try { await HonraPlatform.copy(sharedText);find('share-status').textContent = 'Convite copiado. Cole na conversa que você escolher.'; } catch { fallback(); }
  });
  find('share-app')?.addEventListener('click', async () => {
    if (window.HonraNative) {
      try { await window.HonraNative.shareApp(); } catch(error) { if (!/cancel|dismiss/i.test(error.message || '')) fallback(); }
      return;
    }
    if (!navigator.share) { fallback();return; }
    try { await navigator.share({ title: 'Bússola da Honra', text: message, url: link }); }
    catch (error) { if (error.name !== 'AbortError') fallback(); }
  });
  const status = text => { if (find('offline-status')) find('offline-status').textContent = text; };
  if (window.HonraNative) return;
  if (!['https:', 'http:'].includes(location.protocol) || !('serviceWorker' in navigator)) {
    status('Para preparar o uso sem internet, abra o endereço público em um navegador compatível. A cópia local continua disponível.');return;
  }
  // Only public application files are cached. Form answers never enter storage.
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' });
      const observe = () => {
        const worker = registration.installing;
        if (registration.waiting) {
          status('Atualização preparada. Exporte suas respostas e feche todas as abas da Bússola para usar a nova edição.');return;
        }
        if (!worker && registration.active) {
          status('Conteúdo público preparado para reabrir sem internet. Baixe suas respostas antes de sair.');return;
        }
        if (!worker) return;
        status(registration.active ? 'Uma versão anterior está disponível sem internet. Preparando a atualização…' : 'Preparando as páginas e os materiais. Mantenha a conexão até a conclusão.');
        const timer = setTimeout(() => status('A preparação ainda está em andamento. Mantenha a conexão; o uso sem internet depende da conclusão.'), 20000);
        const changed = () => {
          if (worker.state === 'redundant') {
            clearTimeout(timer);status(registration.active ? 'A atualização não foi concluída. A versão anterior continua disponível; tente novamente com conexão.' : 'A preparação não foi concluída. O aplicativo continua disponível com conexão.');
          } else if (worker.state === 'installed' || worker.state === 'activated') {
            clearTimeout(timer);status(registration.active && registration.active !== worker ? 'Atualização preparada. Exporte suas respostas e feche todas as abas da Bússola para usar a nova edição.' : 'Conteúdo público preparado para reabrir sem internet. Baixe suas respostas antes de sair.');
          }
        };
        worker.addEventListener('statechange', changed);changed();
      };
      registration.addEventListener('updatefound', observe);
      observe();
    } catch { status('Não foi possível preparar o uso sem internet agora. O aplicativo continua acessível com conexão.'); }
  });
})();
