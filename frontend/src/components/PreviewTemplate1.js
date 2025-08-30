import React from 'react';

export default function PreviewTemplate1({ placeholders = {}, imagens = {}, largura = 540 }) {
  // Placeholders com valores padrão para visualização
  const {
    TITULO_PRINCIPAL = 'Nome do Advogado',
    OAB_FINAL = 'OAB 000000',
    TELEFONE = '(00) 00000-0000',
    EMAIL = 'email@exemplo.com',
    HORARIO_ATENDIMENTO = 'Seg a Sex, 9h às 18h',
    TELEFONE_WHATSAPP = '5599999999999',
    AREA_ATUACAO_1 = 'Direito Civil',
    AREA_ATUACAO_2 = 'Direito Trabalhista',
    AREA_ATUACAO_3 = 'Direito Previdenciário',
    AREA_ATUACAO_4 = 'Direito Penal',
    AREA_ATUACAO_5 = 'Direito Empresarial',
    AREA_ATUACAO_6 = 'Direito de Família',
    OUTRAS_AREAS = '',
    DEPOIMENTO_1_NOME = 'Cliente 1',
    DEPOIMENTO_1_TEXTO = 'Ótimo atendimento!',
    DEPOIMENTO_2_NOME = 'Cliente 2',
    DEPOIMENTO_2_TEXTO = 'Recomendo muito!',
    INSTAGRAM = 'https://instagram.com/seuusuario',
    ENDERECO_1 = 'Av. Exemplo, 123',
    LINK_MAPS = 'Av. Exemplo, 123',
  } = placeholders;

  // Imagens (logo, capa, perfil)
  const IMAGEM_LOGO = imagens.logo || '/logo192.png';
  const IMAGEM_CAPA = imagens.capa || 'https://via.placeholder.com/1920x400?text=Capa';
  const IMAGEM_PERFIL = imagens.perfil || 'https://via.placeholder.com/300x300?text=Perfil';

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px 0 rgba(31,38,135,0.07)', padding: 24, minWidth: 320, maxWidth: largura, margin: '0 auto', fontFamily: 'Roboto, Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <img src={IMAGEM_LOGO} alt="Logo" style={{ maxHeight: 60, marginBottom: 8 }} />
        <h2 style={{ margin: 0, fontSize: 22, color: '#0a2540' }}>{TITULO_PRINCIPAL}</h2>
        <div style={{ color: '#C6975B', fontWeight: 600, fontSize: 16 }}>{OAB_FINAL}</div>
      </div>
      <img src={IMAGEM_CAPA} alt="Capa" style={{ width: '100%', borderRadius: 8, marginBottom: 16, objectFit: 'cover', maxHeight: 120 }} />
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <img src={IMAGEM_PERFIL} alt="Perfil" style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid #C6975B', objectFit: 'cover' }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <b>Áreas de Atuação:</b>
        <ul style={{ paddingLeft: 18, margin: 0, color: '#0a2540', fontSize: 15 }}>
          <li>{AREA_ATUACAO_1}</li>
          <li>{AREA_ATUACAO_2}</li>
          <li>{AREA_ATUACAO_3}</li>
          <li>{AREA_ATUACAO_4}</li>
          <li>{AREA_ATUACAO_5}</li>
          <li>{AREA_ATUACAO_6}</li>
        </ul>
        {OUTRAS_AREAS && <div style={{ color: '#555', fontSize: 14, marginTop: 4 }}>{OUTRAS_AREAS}</div>}
      </div>
      <div style={{ marginBottom: 16 }}>
        <b>Depoimentos:</b>
        <div style={{ background: '#f7f8fa', borderRadius: 6, padding: 8, marginBottom: 6 }}>
          <div style={{ fontSize: 14, color: '#333' }}>&quot;{DEPOIMENTO_1_TEXTO}&quot;</div>
          <div style={{ fontSize: 13, color: '#888', textAlign: 'right' }}>- {DEPOIMENTO_1_NOME}</div>
        </div>
        <div style={{ background: '#f7f8fa', borderRadius: 6, padding: 8 }}>
          <div style={{ fontSize: 14, color: '#333' }}>&quot;{DEPOIMENTO_2_TEXTO}&quot;</div>
          <div style={{ fontSize: 13, color: '#888', textAlign: 'right' }}>- {DEPOIMENTO_2_NOME}</div>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <b>Contato:</b>
        <div style={{ fontSize: 15, color: '#0a2540' }}>WhatsApp: {TELEFONE_WHATSAPP}</div>
        <div style={{ fontSize: 15, color: '#0a2540' }}>Telefone: {TELEFONE}</div>
        <div style={{ fontSize: 15, color: '#0a2540' }}>E-mail: {EMAIL}</div>
        <div style={{ fontSize: 15, color: '#0a2540' }}>Instagram: <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">{INSTAGRAM}</a></div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <b>Endereço:</b>
        <div style={{ fontSize: 15, color: '#0a2540' }}>{ENDERECO_1}</div>
        <div style={{ fontSize: 13, color: '#888' }}>Google Maps: {LINK_MAPS}</div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <b>Horário de Atendimento:</b>
        <div style={{ fontSize: 15, color: '#0a2540' }}>{HORARIO_ATENDIMENTO}</div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 18 }}>
        <a href={`https://wa.me/${TELEFONE_WHATSAPP}?text=Ol%C3%A1%2C%20tudo%20bem%3F`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', background: 'linear-gradient(to right, #C6975B, #D8B981)', color: 'white', padding: '10px 20px', borderRadius: 5, textDecoration: 'none', fontWeight: 500, fontSize: 16, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer' }}>
          <img src="/images/icons8-whatsapp-500.png" alt="WhatsApp Icon" style={{ width: 24, height: 24, marginRight: 10 }} />
          CONVERSE COMIGO
        </a>
      </div>
    </div>
  );
} 