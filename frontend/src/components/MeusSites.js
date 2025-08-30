import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  SearchOff as SearchOffIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(17, 24, 39, 0.7)',
    color: '#fff',
    borderRadius: '12px',
    '& fieldset': {
      borderColor: 'rgba(124, 58, 237, 0.2)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(124, 58, 237, 0.4)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#7C3AED',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#9CA3AF',
  },
  '& .MuiInputBase-input': {
    color: '#fff',
  },
  '& .MuiInputAdornment-root .MuiSvgIcon-root': {
    color: '#7C3AED',
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #7C3AED 0%, #4B1FA6 100%)',
  color: '#fff',
  padding: theme.spacing(1, 2),
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)',
    background: 'linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%)',
  }
}));

export default function MeusSites() {
  const [sites, setSites] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const sitesPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const carregarSites = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/sites`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.data.success) {
          // Ordenar por data de criação decrescente (mais recentes primeiro)
          const sortedSites = [...response.data.sites].sort((a, b) => new Date(b.dataCriacao || b.createdAt) - new Date(a.dataCriacao || a.createdAt));
          setSites(sortedSites);
        }
      } catch (err) {
        setSnackbar({ open: true, message: 'Erro ao carregar sites', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    carregarSites();
  }, []);

  const handleCopyUrl = (site) => {
    const url = site.url?.startsWith('http') ? site.url : `https://${site.url}`;
    navigator.clipboard.writeText(url);
    setSnackbar({ open: true, message: 'Link copiado!', severity: 'success' });
  };

  const handleOpenSite = (site) => {
    const url = site.url?.startsWith('http') ? site.url : `https://${site.url}`;
    window.open(url, '_blank');
  };

  const handleDelete = async (site) => {
    setSelectedSite(site);
    setOpenDialog(true);
    // Exemplo de deleção real:
    // const user = JSON.parse(localStorage.getItem('user') || '{}');
    // await axios.delete(`${process.env.REACT_APP_API_URL}/api/sites/${site._id}`, {
    //   headers: { 'x-user-id': user.id }
    // });
  };

  const confirmDelete = () => {
    setSites(sites.filter(s => s._id !== selectedSite._id));
    setOpenDialog(false);
    setSnackbar({
      open: true,
      message: 'Site excluído com sucesso!',
      severity: 'success'
    });
  };

  // Filtro por domínio
  const filteredSites = sites.filter(site => {
    const termo = searchInput.toLowerCase();
    return (site.name || '').toLowerCase().includes(termo) || (site.url || '').toLowerCase().includes(termo);
  });

  // Paginação
  const totalPages = Math.ceil(filteredSites.length / sitesPerPage);
  const paginatedSites = filteredSites.slice((page - 1) * sitesPerPage, page * sitesPerPage);

  const getStatus = (status) => {
    if (status === 'ativo' || status === 'active') return { label: 'Ativo', color: 'success', icon: <CheckCircleIcon fontSize="small" color="success" /> };
    if (status === 'pending') return { label: 'Pendente', color: 'warning', icon: <HourglassEmptyIcon fontSize="small" color="warning" /> };
    return { label: 'Erro', color: 'error', icon: <ErrorIcon fontSize="small" color="error" /> };
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600, color: '#fff' }}>
        Meus Sites
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <StyledTextField
          size="small"
          placeholder="Pesquisar por domínio"
          value={searchInput}
          onChange={e => { setSearchInput(e.target.value); setPage(1); }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ minWidth: 300 }}
        />
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : filteredSites.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', py: 8 }}>
          <SearchOffIcon sx={{ fontSize: 80, color: '#7C3AED', mb: 2 }} />
          <Typography variant="h5" sx={{ color: '#9CA3AF', mb: 1, fontWeight: 600 }}>
            Nenhum site cadastrado ainda
          </Typography>
          <Typography variant="body1" sx={{ color: '#6B7280', mb: 3 }}>
            Crie seu primeiro site para vê-lo aqui!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/configuracoes-site')}
            sx={{ mt: 2, px: 4, py: 1.5, fontWeight: 600 }}
          >
            Criar Novo Site
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {paginatedSites.map((site) => {
            const status = getStatus(site.status);
            const url = site.url?.startsWith('http') ? site.url : `https://${site.url}`;
            return (
              <Grid item xs={12} sm={6} md={4} key={site._id}>
                <Paper elevation={4} sx={{
                  p: 3,
                  borderRadius: 4,
                  bgcolor: '#181C2A',
                  color: '#fff',
                  mb: 2,
                  minHeight: 220,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 24px 0 rgba(124,58,237,0.10)',
                  position: 'relative',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px) scale(1.02)' },
                  gap: 2
                }}>
                  {/* Botão de editar */}
                  <Box sx={{ position: 'absolute', top: 18, right: 18, zIndex: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/configuracoes-site/${site._id}`)}
                      sx={{
                        color: '#7C3AED',
                        background: 'rgba(124,58,237,0.08)',
                        boxShadow: '0 2px 8px 0 rgba(124,58,237,0.10)',
                        '&:hover': { background: 'rgba(124,58,237,0.18)' }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 90 }}>
                    <Typography variant="h6" sx={{ color: '#7C3AED', fontWeight: 700, mb: 1, wordBreak: 'break-all', pr: 4 }}>
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                        <OpenInNewIcon fontSize="small" sx={{ mr: 1, cursor: 'pointer' }} onClick={() => handleOpenSite(site)} />
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#7C3AED', textDecoration: 'underline', fontWeight: 700 }}
                        >
                          {url.replace(/^https?:\/\//, '')}
                        </a>
                      </Box>
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 1 }}>
                      Criado em: {new Date(site.createdAt).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mt: 2, gap: 1 }}>
                    <Chip icon={status.icon} label={status.label} color={status.color} size="small" sx={{ fontWeight: 600 }} />
                    <IconButton size="small" onClick={() => handleCopyUrl(site)} sx={{ color: '#7C3AED' }}>
                      <CopyIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenSite(site)} sx={{ color: '#10B981' }}>
                      <OpenInNewIcon />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
      {/* Paginação */}
      {!loading && filteredSites.length > 0 && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            sx={{ mr: 2 }}
          >
            Anterior
          </Button>
          <Typography sx={{ color: '#fff', mx: 2, mt: 1 }}>{page} / {totalPages}</Typography>
          <Button
            variant="outlined"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            sx={{ ml: 2 }}
          >
            Próxima
          </Button>
        </Box>
      )}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            background: 'rgba(17, 24, 39, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            color: '#fff'
          }
        }}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#9CA3AF' }}>
            Tem certeza que deseja excluir o site "{selectedSite?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{ color: '#9CA3AF' }}
          >
            Cancelar
          </Button>
          <StyledButton onClick={confirmDelete}>
            Excluir
          </StyledButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            background: 'rgba(17, 24, 39, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            color: '#fff'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
