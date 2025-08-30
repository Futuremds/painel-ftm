import React from 'react';

export default function PreviewTemplate2({ placeholders = {}, imagens = {}, largura = 540 }) {
  const {
    ATUACAO_1 = 'Direito Civil',
    ATUACAO_2 = 'Direito Trabalhista',
    ATUACAO_3 = 'Direito Previdenciário',
    ATUACAO_4 = 'Direito Penal',
    HORARIO_ATENDIMENTO = 'Seg a Sex, 9h às 18h',
    NUMERO_CONTATO = '(00) 00000-0000',
    WHATSAPP_NUMERO = '5599999999999',
    EMAIL = 'email@exemplo.com',
    ENDERECO = 'Av. Exemplo, 123',
    OAB_NUMERO = 'OAB 000000',
  } = placeholders;

  const IMAGEM_CAPA = imagens.capa || 'https://via.placeholder.com/1920x400?text=Capa';
  const IMAGEM_MEIO = imagens.perfil || 'https://via.placeholder.com/300x300?text=Meio';

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px 0 rgba(31,38,135,0.07)', padding: 24, minWidth: 320, maxWidth: largura, margin: '0 auto', fontFamily: 'Roboto, Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 22, color: '#7C3AED' }}>Advogado(a) - Template 2</h2>
        <div style={{ color: '#C6975B', fontWeight: 600, fontSize: 16 }}>OAB: {OAB_NUMERO}</div>
      </div>
      <img src={IMAGEM_CAPA} alt="Capa" style={{ width: '100%', borderRadius: 8, marginBottom: 16, objectFit: 'cover', maxHeight: 120 }} />
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <img src={IMAGEM_MEIO} alt="Meio" style={{ width: 120, height: 120, borderRadius: 12, border: '2px solid #7C3AED', objectFit: 'cover' }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <b>Áreas de Atuação:</b>
        <ul style={{ paddingLeft: 18, margin: 0, color: '#0a2540', fontSize: 15 }}>
          <li>{ATUACAO_1}</li>
          <li>{ATUACAO_2}</li>
          <li>{ATUACAO_3}</li>
          <li>{ATUACAO_4}</li>
        </ul>
      </div>
      <div style={{ marginBottom: 12 }}>
        <b>Contato:</b>
        <div style={{ fontSize: 15, color: '#0a2540' }}>WhatsApp: {WHATSAPP_NUMERO}</div>
        <div style={{ fontSize: 15, color: '#0a2540' }}>Telefone: {NUMERO_CONTATO}</div>
        <div style={{ fontSize: 15, color: '#0a2540' }}>E-mail: {EMAIL}</div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <b>Endereço:</b>
        <div style={{ fontSize: 15, color: '#0a2540' }}>{ENDERECO}</div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <b>Horário de Atendimento:</b>
        <div style={{ fontSize: 15, color: '#0a2540' }}>{HORARIO_ATENDIMENTO}</div>
      </div>
    </div>
  );
} 