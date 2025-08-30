import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';

const CriarSite = () => {
  const [loading, setLoading] = useState(false);
  const [placeholders, setPlaceholders] = useState([]);
  const [formData, setFormData] = useState({});
  const [dominio, setDominio] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Carregar placeholders do template
    const loadPlaceholders = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/template/placeholders`);
        setPlaceholders(response.data);

        // Inicializar formData com valores vazios
        const initialData = {};
        response.data.forEach(placeholder => {
          initialData[placeholder.key] = '';
        });
        setFormData(initialData);
      } catch (error) {
        console.error('Erro ao carregar placeholders:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar template',
          severity: 'error'
        });
      }
    };

    loadPlaceholders();
  }, []);

  // Função para formatar o domínio só no submit
  const formatDomain = (input) => {
    return input
      .toLowerCase()
      .replace(/\s+/g, '-')           // troca espaço por hífen
      .replace(/[^a-z0-9-]/g, '')     // remove caracteres inválidos
      .replace(/-+/g, '-')            // múltiplos hífens viram um só
      .replace(/^-+|-+$/g, '');       // remove hífen do início/fim
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Formata o domínio só na hora de enviar
    const dominioFormatado = formatDomain(dominio);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/sites/generate`,
        {
          config: {
            ...formData,
            DOMINIO: dominioFormatado
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSnackbar({
        open: true,
        message: 'Site criado com sucesso!',
        severity: 'success'
      });

      // Limpar formulário
      const emptyData = {};
      placeholders.forEach(placeholder => {
        emptyData[placeholder.key] = '';
      });
      setFormData(emptyData);
      setDominio('');

    } catch (error) {
      console.error('Erro ao criar site:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || error.message || 'Erro ao criar site',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#fff', fontWeight: 600 }}>
        Criar Novo Site
      </Typography>

      <Paper sx={{ p: 3, bgcolor: '#1a1a1a', color: '#fff' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Domínio do Site"
                value={dominio}
                onChange={(e) => setDominio(e.target.value)}
                required
                placeholder="exemplo"
                helperText="O domínio será: exemplo.netlify.app"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#7C3AED',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#7C3AED',
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
              />
            </Grid>

            {placeholders.map((placeholder) => (
              <Grid item xs={12} key={placeholder.key}>
                <TextField
                  fullWidth
                  label={placeholder.description}
                  value={formData[placeholder.key] || ''}
                  onChange={(e) => handleInputChange(placeholder.key, e.target.value)}
                  required
                  multiline={placeholder.type === 'textarea'}
                  rows={placeholder.type === 'textarea' ? 4 : 1}
                  type={placeholder.type === 'email' ? 'email' : 'text'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.23)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#7C3AED',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#7C3AED',
                    },
                  }}
                />
              </Grid>
            ))}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: '#7C3AED',
                    '&:hover': {
                      bgcolor: '#6D28D9',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Criar Site'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CriarSite;
