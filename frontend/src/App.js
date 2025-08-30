import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ConfiguracoesSite from './components/ConfiguracoesSite';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './components/AdminPanel';
import PrivateRoute from './components/PrivateRoute';
import axios from 'axios';
import MeusSites from './components/MeusSites';
import ComprarTokens from './components/ComprarTokens';
import AdminVendas from './pages/AdminVendas';
console.log("API URL:", process.env.REACT_APP_API_URL);
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7C3AED',
    },
    secondary: {
      main: '#10B981',
    },
    background: {
      default: '#111827',
      paper: '#1F2937',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Configurar axios para incluir cookies
axios.defaults.withCredentials = true;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/check`);
        if (response.data.authenticated) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              !isAuthenticated ? (
                <Register />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Layout onLogout={handleLogout}>
                  <Dashboard user={user} onLogout={handleLogout} />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/configuracoes-site"
            element={
              <PrivateRoute>
                <Layout>
                  <ConfiguracoesSite />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/configuracoes-site/:siteId"
            element={
              <PrivateRoute>
                <Layout>
                  <ConfiguracoesSite />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-ftm"
            element={
              <PrivateRoute>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-ftm/vendas"
            element={
              <PrivateRoute>
                <AdminLayout>
                  <AdminVendas />
                </AdminLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/meus-sites"
            element={
              <PrivateRoute>
                <Layout>
                  <MeusSites />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="/comprar-tokens" element={<ComprarTokens />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
