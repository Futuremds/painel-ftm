const fs = require('fs-extra');
const path = require('path');

/**
 * Substitui os placeholders {{CHAVE}} e CHAVE dentro do conteúdo.
 */
function substituirPlaceholders(conteudo, dados) {
  let resultado = conteudo;
  for (const chave in dados) {
    const valor = dados[chave];

    // Regra especial: se o campo for WHATSAPP, gera o link completo
    if (chave === 'WHATSAPP') {
      const numero = valor.replace(/\D/g, ''); // remove caracteres não numéricos
      const whatsappLink = `https://wa.me/55${numero}?text=Ol%C3%A1,%20tudo%20bem?`;
      
      // Substituir ambos os formatos: {{WHATSAPP}} e WHATSAPP
      resultado = resultado.replaceAll(`{{${chave}}}`, whatsappLink);
      resultado = resultado.replaceAll(chave, whatsappLink);
      console.log(`[copiarEPreencherTemplate] Placeholder WHATSAPP substituído: ${whatsappLink}`);
    } else {
      // Substituir ambos os formatos: {{CHAVE}} e CHAVE
      resultado = resultado.replaceAll(`{{${chave}}}`, valor);
      resultado = resultado.replaceAll(chave, valor);
      console.log(`[copiarEPreencherTemplate] Placeholder ${chave} substituído: ${valor}`);
    }
  }
  return resultado;
}

async function forcarLimpezaDir(dir) {
  try {
    await fs.remove(dir);
    await fs.ensureDir(dir);
    console.log('[copiarEPreencherTemplate] Diretório limpo:', dir);
  } catch (err) {
    console.error('[copiarEPreencherTemplate] Erro ao limpar diretório:', dir, err);
    throw err;
  }
}

/**
 * Copia uma pasta modelo e substitui os placeholders nos arquivos de texto.
 * Agora limpa o diretório de destino antes de copiar, garantindo atualização total.
 */
async function copiarEPreencherTemplate(origem, destino, placeholders, imagens = {}) {
  console.log('==== INÍCIO copiarEPreencherTemplate ====');
  console.log('Placeholders recebidos:', placeholders);
  console.log('[copiarEPreencherTemplate] Iniciando cópia e preenchimento do template...');
  // Limpa o diretório de destino antes de copiar (garante atualização total)
  await forcarLimpezaDir(destino);
  await fs.copy(origem, destino);
  
  // Remover arquivo vercel.json se existir (não é necessário para Netlify)
  const vercelJsonPath = path.join(destino, 'vercel.json');
  if (await fs.pathExists(vercelJsonPath)) {
    await fs.remove(vercelJsonPath);
    console.log('[copiarEPreencherTemplate] Arquivo vercel.json removido');
  }
  
  let indexPath = path.join(destino, 'index.html');
  let html = await fs.readFile(indexPath, 'utf8');

  // Garantir que a pasta images existe
  const imagesDir = path.join(destino, 'images');
  await fs.ensureDir(imagesDir);

  // Salvar imagens base64 se existirem (sobrescreve sempre)
  if (imagens.logo) {
    const logoPath = path.join(imagesDir, 'logo.png');
    await fs.writeFile(logoPath, imagens.logo.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    placeholders.IMAGEM_LOGO = 'images/logo.png';
    console.log('[copiarEPreencherTemplate] Logo sobrescrita:', logoPath);
  }
  if (imagens.capa) {
    const capaPath = path.join(imagesDir, 'capa.png');
    await fs.writeFile(capaPath, imagens.capa.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    placeholders.IMAGEM_CAPA = 'images/capa.png';
    console.log('[copiarEPreencherTemplate] Capa sobrescrita:', capaPath);
  }
  if (imagens.perfil) {
    const perfilPath = path.join(imagesDir, 'perfil.png');
    await fs.writeFile(perfilPath, imagens.perfil.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    placeholders.IMAGEM_PERFIL = 'images/perfil.png';
    console.log('[copiarEPreencherTemplate] Perfil sobrescrita:', perfilPath);
  }
  if (imagens.meio) {
    const meioPath = path.join(imagesDir, 'meio.png');
    await fs.writeFile(meioPath, imagens.meio.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    placeholders.IMAGEM_MEIO = 'images/meio.png';
    console.log('[copiarEPreencherTemplate] Imagem do Meio sobrescrita:', meioPath);
  }

  // Substituir telefones e e-mails em SOBRE e RODAPE pelo placeholder
  if (placeholders.TELEFONE || placeholders.EMAIL) {
    const telefone = placeholders.TELEFONE;
    const email = placeholders.EMAIL;
    // Regex ultra robusto para telefones brasileiros, aceita prefixos opcionais, espaços, dois pontos, qualquer capitalização
    const regexTel = /((?:tel|telefone|whatsapp|celular|fone|cel|contato)?\s*:?\s*)?\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}/gi;
    // Regex ultra robusto para e-mails, aceita prefixos opcionais, espaços, dois pontos, qualquer capitalização
    const regexEmail = /((?:e-?mail)?\s*:?\s*)?[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    if (placeholders.SOBRE) {
      console.log('ANTES SOBRE:', placeholders.SOBRE);
      placeholders.SOBRE = placeholders.SOBRE
        .replace(regexTel, (match) => {
          // Mantém o prefixo, troca só o número
          return match.replace(/\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}/, telefone);
        })
        .replace(regexEmail, (match) => {
          // Mantém o prefixo, troca só o e-mail
          return match.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, email);
        })
        .replace(/(?:\r\n|\r|\n)/g, '<br>');
      console.log('DEPOIS SOBRE:', placeholders.SOBRE);
    }
    if (placeholders.RODAPE) {
      console.log('ANTES RODAPE:', placeholders.RODAPE);
      placeholders.RODAPE = placeholders.RODAPE
        .replace(regexTel, (match) => {
          return match.replace(/\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}/, telefone);
        })
        .replace(regexEmail, (match) => {
          return match.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, email);
        })
        .replace(/(?:\r\n|\r|\n)/g, '<br>');
      console.log('DEPOIS RODAPE:', placeholders.RODAPE);
    }
  }

  // Gerar LINK_WHATSAPP a partir do telefone, se existir
  if (placeholders.TELEFONE_WHATSAPP) {
    const numero = placeholders.TELEFONE_WHATSAPP.replace(/\D/g, '');
    placeholders.LINK_WHATSAPP = `https://wa.me/${numero}?text=Ol%C3%A1%2C%20tudo%20bem%3F`;
  }

  // Substituir todos os placeholders
  Object.keys(placeholders).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, placeholders[key]);
    console.log(`[copiarEPreencherTemplate] Substituindo placeholder ${key} por: ${placeholders[key]}`);
  });

  // Remove qualquer placeholder não preenchido
  html = html.replace(/{{[^}]+}}/g, '');
  console.log('[copiarEPreencherTemplate] index.html final antes de salvar:', html.substring(0, 500));
  await fs.writeFile(indexPath, html, 'utf8');
  console.log('[copiarEPreencherTemplate] index.html sobrescrito:', indexPath);
}

module.exports = copiarEPreencherTemplate;
