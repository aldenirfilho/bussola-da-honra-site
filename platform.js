'use strict';
// Export only after the visitor explicitly asks. No answer is saved automatically.
window.HonraPlatform = {
  async exportText(text, filename) {
    try {
      if (window.HonraNative) return await window.HonraNative.exportText(text, filename);
      const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
      const a = document.createElement('a');a.href = url;a.download = filename;
      document.body.append(a);a.click();a.remove();setTimeout(() => URL.revokeObjectURL(url), 1500);
      return 'Download solicitado ao navegador.';
    } catch {
      return 'Não foi possível exportar. Suas respostas continuam nesta tela; tente novamente antes de sair.';
    }
  },
  async copy(text) {
    if (window.HonraNative) return window.HonraNative.copy(text);
    return navigator.clipboard.writeText(text);
  }
};
