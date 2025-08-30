import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Token as TokenIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(17, 24, 39, 0.7)',
  backdropFilter: 'blur(10px)',
  padding: theme.spacing(3),
  borderRadius: '16px',
  border: '1px solid rgba(124, 58, 237, 0.2)',
  marginTop: theme.spacing(3)
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

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome: '',
    tokens: 5
  });
  const [tab, setTab] = useState(0);
  const [searchEmail, setSearchEmail] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchSites();
  }, []);

  useEffect(() => {
    if (searchEmail.trim() === '') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(u => u.email.toLowerCase().includes(searchEmail.toLowerCase())));
    }
  }, [searchEmail, users]);

  const fetchUsers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
        headers: {
          'x-user-id': user.id
        }
      });
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/sites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setSites(response.data.sites);
      }
    } catch (err) {
      // Se não conseguir, ignora
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: '',
        nome: user.nome || '',
        tokens: user.tokens || 5
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        nome: '',
        tokens: 5
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      nome: '',
      tokens: 5
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const url = editingUser 
        ? `${process.env.REACT_APP_API_URL}/api/admin/users/${editingUser._id}`
        : `${process.env.REACT_APP_API_URL}/api/admin/users`;
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(editingUser ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
        handleCloseDialog();
        fetchUsers();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erro ao salvar usuário');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Usuário excluído com sucesso!');
        fetchUsers();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erro ao excluir usuário');
    }
  };

  const handleAddTokens = async (userId) => {
    const quantidade = prompt('Quantos tokens deseja adicionar?');
    if (!quantidade || isNaN(quantidade)) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/add-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId, quantidade: parseInt(quantidade) })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Tokens adicionados com sucesso!');
        fetchUsers();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erro ao adicionar tokens');
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
    <Box sx={{ p: 3 }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Usuários" />
        <Tab label="Histórico de Sites" />
      </Tabs>
      {tab === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ color: '#fff' }}>
              Painel de Administração
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #4B1FA6 100%)',
                color: '#fff',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%)',
                }
              }}
            >
              Novo Usuário
            </Button>
          </Box>
          <TextField
            fullWidth
            placeholder="Buscar usuário por email"
            value={searchEmail}
            onChange={e => setSearchEmail(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <StyledPaper>
            <StyledTable>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Tokens</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.nome}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.tokens}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenDialog(user)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(user._id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                        <IconButton onClick={() => handleAddTokens(user._id)} color="success">
                          <TokenIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTable>
          </StyledPaper>
        </>
      )}
      {tab === 1 && (
        <StyledPaper>
          <Typography variant="h5" sx={{ color: '#fff', mb: 2 }}>
            Histórico de Sites Criados
          </Typography>
          <StyledTable>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuário</TableCell>
                  <TableCell>Domínio</TableCell>
                  <TableCell>Data de Criação</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>URL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sites.map((site) => (
                  <TableRow key={site._id}>
                    <TableCell>{site.user?.nome || site.user || '-'}</TableCell>
                    <TableCell>{site.name}</TableCell>
                    <TableCell>{new Date(site.createdAt || site.dataCriacao).toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{site.status}</TableCell>
                    <TableCell>
                      {site.url ? (
                        <a href={site.url.startsWith('http') ? `https://${site.name}.painelftm.com.br` : `https://${site.name}.painelftm.com.br`} target="_blank" rel="noopener noreferrer" style={{ color: '#7C3AED' }}>
                          {site.url.startsWith('http') ? `${site.name}.painelftm.com.br` : `${site.name}.painelftm.com.br`}
                        </a>
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTable>
        </StyledPaper>
      )}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              margin="normal"
              required={!editingUser}
              helperText={editingUser ? "Deixe em branco para manter a senha atual" : ""}
            />
            <TextField
              fullWidth
              label="Tokens"
              type="number"
              value={formData.tokens}
              onChange={(e) => setFormData({ ...formData, tokens: parseInt(e.target.value) })}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingUser ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel; 
