import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Container,
  IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ConfiguracoesSite = () => {
  const navigate = useNavigate();
  const { siteId } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    RAZÃO: '',
    CNPJ: '',
    MISSÃO: '',
    SOBRE: '',
    RODAPE: '',
    TELEFONE: '',
    EMAIL: '',
    INSTAGRAM: '',
    WHATSAPP: '',
    PIXEL_META: '',
    APP_ID: '',
    LINK_PAGINA: '',
    DOMINIO: '',
    META_TAG: ''
  });
  const [dominioEditado, setDominioEditado] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const API_BASE = process.env.REACT_APP_API_URL || 'https://painelftm.com.br';

  useEffect(() => {
    if (siteId) fetchSiteData();
  }, [siteId]);

  const fetchSiteData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/sites/${siteId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success && data.site) {
        const config = data.site.config || {};
        setFormData(prev => ({
          ...config,
          DOMINIO: config.DOMINIO || data.site.name || ''
        }));
      }
    } catch (err) {
      setError('Erro ao carregar dados do site');
    } finally {
      setLoading(false);
    }
  };

  // Função para formatar o domínio só no submit
  const formatDomain = (input) => {
    return input
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // Sugere domínio automaticamente ao digitar a razão social, se o usuário não editou manualmente
      if (name === 'RAZÃO' && !prev.DOMINIO && !dominioEditado) {
        const sugestaoDominio = formatDomain(value);
        return { ...prev, [name]: value, DOMINIO: sugestaoDominio };
      }
      // Agora, só salva o valor digitado, sem formatar em tempo real
      if (name === 'DOMINIO') {
        setDominioEditado(true);
        return { ...prev, [name]: value };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validação dos campos obrigatórios
      const camposObrigatorios = {
        'RAZÃO': 'Razão Social',
        'CNPJ': 'CNPJ',
        'MISSÃO': 'Missão',
        'TELEFONE': 'Telefone',
        'EMAIL': 'Email',
        'INSTAGRAM': 'Instagram',
        'WHATSAPP': 'WhatsApp',
        'SOBRE': 'Sobre',
        'RODAPE': 'Rodapé',
        'LINK_PAGINA': 'Link da Página',
        'DOMINIO': 'Domínio'
      };

      const camposFaltantes = [];
      for (const [campo, nome] of Object.entries(camposObrigatorios)) {
        if (!formData[campo] || formData[campo].trim() === '') {
          camposFaltantes.push(nome);
        }
      }

      if (camposFaltantes.length > 0) {
        setError(`Campos obrigatórios faltando: ${camposFaltantes.join(', ')}`);
        setLoading(false);
        return;
      }

      // --- NOVO: Preparar os campos SOBRE, RODAPE e MISSÃO ---
      const novoSobre = formData.SOBRE
        ? formData.SOBRE.replace(/(?:\r\n|\r|\n)/g, '<br>')
        : '';
      const novoRodape = formData.RODAPE
        ? formData.RODAPE.replace(/(?:\r\n|\r|\n)/g, '<br>')
        : '';
      const novaMissao = formData.MISSÃO
        ? formData.MISSÃO.replace(/(?:\r\n|\r|\n)/g, '<br>')
        : '';
      // Formata o domínio só na hora de enviar
      const formDataFinal = {
        ...formData,
        SOBRE: novoSobre,
        RODAPE: novoRodape,
        MISSÃO: novaMissao,
        DOMINIO: formatDomain(formData.DOMINIO)
      };

      // Enviar para a rota de geração de site OU edição
      if (siteId) {
        // EDIÇÃO DE SITE EXISTENTE
        const response = await axios.put(`${API_BASE}/api/sites/${siteId}`,
          { config: formDataFinal },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const data = response.data;
        if (data.success) {
          setSuccess('Site editado com sucesso!');
          setTimeout(() => { navigate('/dashboard'); }, 2000);
        } else {
          setError(data.message || 'Erro ao editar o site');
        }
      } else {
        // CRIAÇÃO DE NOVO SITE
        const response = await axios.post(`${API_BASE}/api/sites/generate`, {
          config: formDataFinal
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        const data = response.data;
        if (data.success) {
          setSuccess('Site gerado com sucesso! URL: ' + data.url);
          setTimeout(() => { navigate('/dashboard'); }, 2000);
        } else {
          let errorMessage = data.message || data.error || 'Erro ao gerar o site';
          if (data.details) {
            if (data.details.campos) {
              errorMessage = `Campos obrigatórios faltando: ${data.details.campos.join(', ')}`;
            } else if (typeof data.details === 'string') {
              errorMessage = data.details;
            }
            console.error('Detalhes do erro:', data.details);
          }
          setError(errorMessage);
        }
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      console.error('Erro no handleSubmit:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ p: { xs: 1, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            {siteId ? 'Editar Site' : 'Criar Novo Site'}
          </Typography>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, maxWidth: 600, mx: 'auto', background: 'rgba(30,32,40,0.98)' }}>
          <form onSubmit={handleSubmit}>
            {/* Domínio */}
            <Typography variant="h6" sx={{ color: 'primary.main', mb: 1, mt: 1 }}>Domínio</Typography>
            <TextField
              fullWidth
              label="Domínio"
              name="DOMINIO"
              value={formData.DOMINIO}
              onChange={handleChange}
              required
              placeholder="ex: dr-deolane"
              sx={{ mb: 3 }}
            />
            {/* Informações Básicas */}
            <Typography variant="h6" sx={{ color: 'primary.main', mb: 1, mt: 1 }}>Informações Básicas</Typography>
            <TextField fullWidth label="Razão Social" name="RAZÃO" value={formData.RAZÃO} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="CNPJ" name="CNPJ" value={formData.CNPJ} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Missão" name="MISSÃO" value={formData.MISSÃO} onChange={handleChange} multiline rows={2} required sx={{ mb: 2 }} />
            {/* Contatos */}
            <Typography variant="h6" sx={{ color: 'primary.main', mb: 1, mt: 3 }}>Contatos</Typography>
            <TextField fullWidth label="Telefone" name="TELEFONE" value={formData.TELEFONE} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Email" name="EMAIL" type="email" value={formData.EMAIL} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Instagram" name="INSTAGRAM" value={formData.INSTAGRAM} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="WhatsApp" name="WHATSAPP" value={formData.WHATSAPP} onChange={handleChange} required sx={{ mb: 2 }} />
            {/* Conteúdo */}
            <Typography variant="h6" sx={{ color: 'primary.main', mb: 1, mt: 3 }}>Conteúdo</Typography>
            <TextField fullWidth label="Sobre" name="SOBRE" value={formData.SOBRE} onChange={handleChange} multiline rows={4} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Rodapé" name="RODAPE" value={formData.RODAPE} onChange={handleChange} required sx={{ mb: 2 }} />
            {/* Integrações e Links */}
            <Typography variant="h6" sx={{ color: 'primary.main', mb: 1, mt: 3 }}>Integrações e Links</Typography>
            <TextField fullWidth label="Pixel Meta" name="PIXEL_META" value={formData.PIXEL_META} onChange={handleChange} multiline rows={2} sx={{ mb: 2 }} />
            <TextField fullWidth label="Meta Tag (verificação de domínio)" name="META_TAG" value={formData.META_TAG || ''} onChange={handleChange} multiline rows={2} sx={{ mb: 2 }} />
            <TextField fullWidth label="App ID" name="APP_ID" value={formData.APP_ID} onChange={handleChange} sx={{ mb: 2 }} />
            <TextField fullWidth label="Link da Página" name="LINK_PAGINA" value={formData.LINK_PAGINA} onChange={handleChange} required sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button type="submit" variant="contained" color="primary" size="large" disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />} sx={{ minWidth: 200 }}
                onClick={() => console.log('Botão de submit clicado!')}
              >
                {loading ? 'Gerando...' : 'Gerar Site'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ConfiguracoesSite;
