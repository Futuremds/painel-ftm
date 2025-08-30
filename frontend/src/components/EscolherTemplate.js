import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

export default function EscolherTemplate() {
  const navigate = useNavigate();

  // Redireciona diretamente para o template padrão
  React.useEffect(() => {
    navigate('/gerar-site/padrao/template1');
  }, [navigate]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: (theme) => theme.palette.text.primary }}>
        Redirecionando...
      </Typography>
    </Box>
  );
} 