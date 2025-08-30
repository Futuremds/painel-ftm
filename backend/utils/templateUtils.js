/**
 * Substitui os placeholders no template HTML pelos valores configurados
 * @param {string} template - Template HTML com placeholders
 * @param {object} placeholders - Placeholders dinâmicos do usuário
 * @returns {string} Template com placeholders substituídos
 */
function replacePlaceholders(template, placeholders) {
  let result = template;

  // Função para substituir telefone e e-mail dentro de textos
  const processText = (text) => {
    let novo = text;
    if (placeholders.TELEFONE) {
      novo = novo.replace(/(\(?\d{2}\)?\s?)?(\d{4,5}[-\s]?\d{4})/g, placeholders.TELEFONE);
    }
    if (placeholders.EMAIL) {
      novo = novo.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, placeholders.EMAIL);
    }
    return novo;
  };

  // Sempre processa SOBRE e RODAPE, mesmo se vierem vazios
  placeholders.SOBRE = processText(placeholders.SOBRE || '');
  placeholders.RODAPE = processText(placeholders.RODAPE || '');

  // Substitui cada placeholder pelo seu valor
  Object.entries(placeholders).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value);
  });

  return result;
}

module.exports = {
  replacePlaceholders
};
