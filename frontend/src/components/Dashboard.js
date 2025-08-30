import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  LinearProgress,
  IconButton,
  Tooltip,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Skeleton
} from '@mui/material';
import {
  Web as WebIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  Note as NoteIcon,
  ArrowForward as ArrowForwardIcon,
  Token as TokenIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(17, 24, 39, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(124, 58, 237, 0.2)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  color: '#fff',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, transparent 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(124, 58, 237, 0.2)',
    '&::before': {
      opacity: 1,
    },
    '& .MuiCardActions-root': {
      opacity: 1,
      transform: 'translateY(0)',
    },
    '& .MuiIconButton-root': {
      transform: 'translateX(0)',
      opacity: 1,
    }
  }
}));

const TokenCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #7C3AED 0%, #4B1FA6 100%)',
  color: '#fff',
  borderRadius: '16px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%)',
  }
}));

const IconWrapper = styled(Box)(({ theme, color }) => ({
  width: 48,
  height: 48,
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
  marginBottom: theme.spacing(2),
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
  }
}));

const StyledCardActions = styled(CardActions)(({ theme }) => ({
  opacity: 0,
  transform: 'translateY(10px)',
  transition: 'all 0.3s ease',
  justifyContent: 'flex-end',
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(124, 58, 237, 0.2)',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  transform: 'translateX(-10px)',
  opacity: 0,
  transition: 'all 0.3s ease',
  color: '#7C3AED',
  '&:hover': {
    background: 'rgba(124, 58, 237, 0.2)',
  }
}));

const StyledTable = styled(TableContainer)(({ theme }) => ({
  background: 'rgba(17, 24, 39, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(124, 58, 237, 0.2)',
  '& .MuiTableCell-root': {
    borderBottom: '1px solid rgba(124, 58, 237, 0.1)',
    color: '#fff',
  },
  '& .MuiTableHead-root .MuiTableCell-root': {
    color: '#7C3AED',
    fontWeight: 600,
  }
}));

const CreateSiteButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #7C3AED 0%, #4B1FA6 100%)',
  color: '#fff',
  padding: theme.spacing(1.5, 3),
  borderRadius: '12px',
  textTransform: 'none',
  fontSize: '1.1rem',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)',
    background: 'linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%)',
  }
}));

const StatusChip = styled(Chip)(({ status }) => ({
  background: status === 'active'
    ? 'rgba(16, 185, 129, 0.2)'
    : status === 'pending'
    ? 'rgba(245, 158, 11, 0.2)'
    : 'rgba(239, 68, 68, 0.2)',
  color: status === 'active'
    ? '#10B981'
    : status === 'pending'
    ? '#F59E0B'
    : '#EF4444',
  fontWeight: 600,
  '& .MuiChip-icon': {
    color: 'inherit'
  }
}));

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [sites, setSites] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newSite, setNewSite] = useState({
    name: '',
    description: ''
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const menuItems = [
    {
      title: 'Meus Sites',
      description: 'Gerencie seus sites',
      icon: <WebIcon />,
      color: '#7C3AED',
      path: '/meus-sites'
    },
    {
      title: 'Criar Site',
      description: 'Crie um novo site',
      icon: <AddIcon />,
      color: '#10B981',
      path: '/configuracoes-site'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon />;
      case 'pending':
        return <PendingIcon />;
      case 'error':
        return <ErrorIcon />;
      default:
        return null;
    }
  };

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const respUser = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await respUser.json();
      if (userData.success && userData.user) {
        setUser(userData.user);
        localStorage.setItem('user', JSON.stringify(userData.user));
      }
    } catch (e) {
      // Se falhar, ignora
    }
  };

  useEffect(() => {
    fetchSites();
    fetchUser();
  }, []);

  const fetchSites = async () => {
    setLoading(true);
    try {
      console.log('user.id em Dashboard:', user.id);
      console.log('Enviando header x-user-id:', user.id);
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
      setError('Erro ao carregar sites');
    }
    setLoading(false);
  };

  const handleCreateSite = () => {
    navigate('/configuracoes-site');
  };

  const handleEditSite = (siteId) => {
    navigate(`/configuracoes-site/${siteId}`);
  };

  const handleDeleteSite = async (siteId) => {
    try {
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/sites/${siteId}`, {
        headers: {
          'x-user-id': user.id
        }
      });
      if (response.data.success) {
        setSuccess('Site excluído com sucesso');
        fetchSites();
        fetchUser();
      }
    } catch (err) {
      setError('Erro ao excluir site');
    }
  };

  const handleViewSite = (site) => {
    // Usar domínio personalizado em vez da URL da Netlify
    const siteUrl = `https://${site.name}.painelftm.com.br`;
    window.open(siteUrl, '_blank');
  };

  // Filtros e paginação
  const filteredSites = sites.filter(site => {
    const matchName = site.nomeProjeto?.toLowerCase().includes(search.toLowerCase()) || site.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? (site.status === statusFilter || site.status === (statusFilter === 'ativo' ? 'active' : statusFilter)) : true;
    const matchDate = dateFilter ? (new Date(site.dataCriacao || site.createdAt).toLocaleDateString() === dateFilter) : true;
    return matchName && matchStatus && matchDate;
  });
  const totalPages = Math.ceil(filteredSites.length / rowsPerPage);
  const paginatedSites = filteredSites.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box sx={{ p: 3, background: '#111827', minHeight: '100vh' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600, color: '#fff' }}>
          Bem-vindo, {user.nome || 'Usuário'}!
        </Typography>
        <Typography variant="body1" sx={{ color: '#9CA3AF' }}>
          Gerencie seus sites e tokens de forma simples e eficiente.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <TokenCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TokenIcon sx={{ fontSize: 32, mr: 1 }} />
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Tokens Disponíveis
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  sx={{ fontWeight: 700, ml: 2, background: '#7C3AED' }}
                  onClick={() => navigate('/comprar-tokens')}
                >
                  Comprar Tokens
                </Button>
              </Box>
              <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
                {user.tokens || 0}
              </Typography>
              <Box sx={{ mb: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(user.tokens || 0) / 100 * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#fff',
                    }
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Tokens necessários para criar sites
              </Typography>
            </CardContent>
          </TokenCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#fff', fontWeight: 600 }}>
                Criar Novo Site
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: '#9CA3AF' }}>
                Comece a criar seu site agora mesmo com nossos templates exclusivos.
              </Typography>
              <CreateSiteButton
                startIcon={<AddIcon />}
                onClick={handleCreateSite}
              >
                Criar Novo Site
              </CreateSiteButton>
            </CardContent>
          </StyledCard>
        </Grid>

        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <Tooltip title={`Ir para ${item.title}`} arrow>
              <StyledCard>
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <IconWrapper color={item.color}>
                    {React.cloneElement(item.icon, { sx: { color: '#fff', fontSize: 28 } })}
                  </IconWrapper>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#fff' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                    {item.description}
                  </Typography>
                </CardContent>
                <StyledCardActions>
                  <StyledIconButton
                    onClick={() => navigate(item.path)}
                    size="small"
                  >
                    <ArrowForwardIcon />
                  </StyledIconButton>
                </StyledCardActions>
              </StyledCard>
            </Tooltip>
          </Grid>
        ))}

        <Grid item xs={12}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
                <HistoryIcon sx={{ color: '#7C3AED', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                  Histórico de Sites
                </Typography>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Buscar site..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  sx={{ ml: 2, background: '#23263a', borderRadius: 2 }}
                />
                <TextField
                  select
                  size="small"
                  variant="outlined"
                  label="Status"
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                  sx={{ minWidth: 120, background: '#23263a', borderRadius: 2 }}
                  SelectProps={{ native: true }}
                >
                  <option value="">Todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="pending">Pendente</option>
                  <option value="error">Erro</option>
                </TextField>
                <TextField
                  size="small"
                  type="date"
                  variant="outlined"
                  label="Data"
                  InputLabelProps={{ shrink: true }}
                  value={dateFilter}
                  onChange={e => { setDateFilter(e.target.value); setPage(1); }}
                  sx={{ minWidth: 150, background: '#23263a', borderRadius: 2 }}
                />
              </Box>
              <StyledTable>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome do Projeto</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Última Edição</TableCell>
                      <TableCell>Domínio</TableCell>
                      <TableCell>Link</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: rowsPerPage }).map((_, idx) => (
                        <TableRow key={idx}>
                          {Array.from({ length: 7 }).map((_, i) => (
                            <TableCell key={i}><Skeleton variant="rectangular" height={24} /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : paginatedSites.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ color: '#9CA3AF' }}>
                          Nenhum site encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedSites.map((site, idx) => (
                        <TableRow key={site._id} sx={{ background: idx % 2 === 0 ? 'rgba(124,58,237,0.04)' : 'transparent' }}>
                          <TableCell sx={{ color: '#fff' }}>{site.nomeProjeto || site.name}</TableCell>
                          <TableCell>
                            <StatusChip
                              icon={getStatusIcon(site.status)}
                              label={site.status === 'ativo' || site.status === 'active' ? 'Ativo' : site.status === 'pending' ? 'Pendente' : 'Erro'}
                              status={site.status}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#9CA3AF' }}>{new Date(site.dataCriacao || site.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell sx={{ color: '#9CA3AF' }}>{site.updatedAt ? new Date(site.updatedAt).toLocaleDateString() : '-'}</TableCell>
                          <TableCell sx={{ color: '#9CA3AF' }}>{`${site.name}.painelftm.com.br`}</TableCell>
                          <TableCell>
                            <Tooltip title="Abrir site" arrow>
                              <IconButton size="small" onClick={() => handleViewSite(site)} sx={{ color: '#7C3AED' }}>
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Copiar link" arrow>
                              <IconButton size="small" onClick={() => navigator.clipboard.writeText(`https://${site.name}.painelftm.com.br`)} sx={{ color: '#7C3AED' }}>
                                <WebIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Editar" arrow>
                              <IconButton size="small" onClick={() => handleEditSite(site._id)} sx={{ color: '#7C3AED' }}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir" arrow>
                              <IconButton size="small" onClick={() => handleDeleteSite(site._id)} sx={{ color: '#7C3AED' }}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </StyledTable>
              {/* Paginação */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 1 }}>
                  <Button disabled={page === 1} onClick={() => setPage(page - 1)} sx={{ color: '#7C3AED' }}>Anterior</Button>
                  <Typography sx={{ color: '#fff', mx: 2 }}>{page} / {totalPages}</Typography>
                  <Button disabled={page === totalPages} onClick={() => setPage(page + 1)} sx={{ color: '#7C3AED' }}>Próximo</Button>
                </Box>
              )}
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
