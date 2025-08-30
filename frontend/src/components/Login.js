import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const LoginContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.palette.background.default,
}));

const LoginPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 400,
  width: '100%',
  background: theme.palette.background.paper,
  borderRadius: 20,
  boxShadow: '0 2px 12px 0 rgba(31, 38, 135, 0.07)',
  border: '1.5px solid #7C3AED',
}));

const LoginButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  background: '#7C3AED',
  color: '#fff',
  borderRadius: 8,
  fontWeight: 600,
  textTransform: 'none',
  fontSize: 16,
  padding: theme.spacing(1.2, 2.5),
  '&:hover': {
    background: '#4B1FA6',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(17, 24, 39, 0.7)',
  backdropFilter: 'blur(10px)',
  padding: theme.spacing(4),
  borderRadius: '16px',
  border: '1px solid rgba(124, 58, 237, 0.2)',
  maxWidth: '400px',
  width: '100%',
  margin: 'auto',
  marginTop: theme.spacing(8)
}));

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
  }
}));

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        {
          email: formData.email,
          senha: formData.password,
        }
      );

      if (response.data.user && response.data.token) {
        // Salvar dados do usuário incluindo tokenVercel
        const userData = {
          ...response.data.user,
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.token); // Salva o token JWT
        console.log('Usuário salvo no localStorage:', userData);
        // Atualizar estado e navegar
        onLogin(userData);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError(error.response?.data?.message || 'Erro ao fazer login');
    }
  };

  return (
    <LoginContainer>
      <StyledPaper elevation={3}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#fff', textAlign: 'center', mb: 4 }}>
          Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <StyledTextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />

          <StyledTextField
            fullWidth
            label="Senha"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              background: 'linear-gradient(135deg, #7C3AED 0%, #4B1FA6 100%)',
              color: '#fff',
              padding: '12px',
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%)',
              }
            }}
          >
            Entrar
          </Button>
        </form>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Ainda não tem uma conta?{' '}
            <Button
              variant="text"
              sx={{ color: 'primary.main', textTransform: 'none', fontWeight: 600 }}
              onClick={() => navigate('/register')}
            >
              Cadastre-se
            </Button>
          </Typography>
        </Box>
      </StyledPaper>

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
    </LoginContainer>
  );
}
