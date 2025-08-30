import React from 'react';
import { Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useTheme } from '@mui/material/styles';
import iconFaturamento from '../imagens/iconfaturamento.png';

const medalhas = [
  { min: 0, max: 10000, img: iconFaturamento, label: 'Bronze', meta: 10000 },
  { min: 10000, max: 50000, img: iconFaturamento, label: 'Prata', meta: 50000 },
  { min: 50000, max: 100000, img: iconFaturamento, label: 'Ouro', meta: 100000 },
  { min: 100000, max: 250000, img: iconFaturamento, label: 'Platina', meta: 250000 },
  { min: 250000, max: 1000000, img: iconFaturamento, label: 'Diamante', meta: 1000000 },
];

function getMedalha(faturamento) {
  return medalhas.find(m => faturamento >= m.min && faturamento < m.max) || medalhas[0];
}

export default function FaturamentoBar({ faturamento = 0, fotoPerfil }) {
  const theme = useTheme();
  const medalha = getMedalha(faturamento);
  const progresso = Math.min(1, (faturamento - medalha.min) / (medalha.meta - medalha.min));
  const barraRoxa = theme.palette.mode === 'dark' ? '#2B185B' : '#7C3AED';
  const bordaRoxa = theme.palette.mode === 'dark' ? '#2B185B' : '#7C3AED';
  const corBarraProgresso = theme.palette.mode === 'dark' ? '#7C3AED' : '#2B185B';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', background: barraRoxa, borderRadius: 8, padding: '8px 18px', minWidth: 320,
      position: 'fixed', top: 72, right: 24, zIndex: 1300, boxShadow: '0 2px 12px 0 rgba(31,38,135,0.07)', border: `1.5px solid ${bordaRoxa}`
    }}>
      <img src={medalha.img} alt={medalha.label} style={{ width: 48, height: 48, marginRight: 16 }} />
      <div style={{ flex: 1, marginRight: 16, minWidth: 160 }}>
        <div style={{
          background: '#f3f3f3', borderRadius: 8, height: 10, width: '100%', overflow: 'hidden', position: 'relative'
        }}>
          <div style={{
            background: corBarraProgresso, height: '100%', width: `${progresso * 100}%`, transition: 'width 0.4s', position: 'absolute', left: 0, top: 0
          }} />
        </div>
      </div>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, minWidth: 120, textAlign: 'right', marginRight: 16 }}>
        R$ {faturamento.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} / R$ {medalha.meta >= 1000 ? (medalha.meta / 1000) + 'K' : medalha.meta}
      </div>
      <Avatar
        src={fotoPerfil || undefined}
        sx={{ width: 44, height: 44, bgcolor: !fotoPerfil ? '#fff' : '#fff', color: '#7C3AED', fontWeight: 700 }}
      >
        {!fotoPerfil && <PersonIcon />}
      </Avatar>
    </div>
  );
} 