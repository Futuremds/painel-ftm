import React from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Grid } from '@mui/material';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

const videoAulas = [
  {
    id: 1,
    titulo: 'Como criar seu site de advogado',
    descricao: 'Aprenda o passo a passo para criar um site profissional para advogados usando o painel.',
    url: 'https://www.youtube.com/embed/7uKjK1j8r6A',
  },
  {
    id: 2,
    titulo: 'Como divulgar e vender mais',
    descricao: 'Dicas práticas para divulgar seu site e aumentar suas vendas como afiliado.',
    url: 'https://www.youtube.com/embed/9bZkp7q19f0',
  },
  {
    id: 3,
    titulo: 'Como usar o painel de afiliados',
    descricao: 'Veja como navegar e aproveitar todos os recursos do painel.',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
];

export default function VideoAulas() {
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" sx={{ color: '#7C3AED', fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center' }}>
        <VideoLibraryIcon sx={{ mr: 1, color: '#7C3AED' }} /> Vídeo Aulas
      </Typography>
      <Grid container spacing={3}>
        {videoAulas.map(video => (
          <Grid item xs={12} md={6} key={video.id}>
            <Card sx={{ border: '1.5px solid #7C3AED', borderRadius: 3, boxShadow: '0 2px 12px 0 rgba(124,58,237,0.07)', mb: 2 }}>
              <CardMedia
                component="iframe"
                src={video.url}
                title={video.titulo}
                sx={{ height: 240, borderRadius: 3 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <CardContent>
                <Typography variant="h6" sx={{ color: '#7C3AED', fontWeight: 700 }}>{video.titulo}</Typography>
                <Typography color="text.secondary">{video.descricao}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 