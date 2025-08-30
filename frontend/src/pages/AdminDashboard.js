import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  useTheme,
  LinearProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  Web as WebIcon,
  Token as TokenIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(31, 41, 55, 0.8) 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(124, 58, 237, 0.2)',
  borderRadius: '16px',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  }
}));

const StatCard = ({ title, value, icon, color, loading }) => {
  const theme = useTheme();
  
  return (
    <StyledCard>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${color} 0%, ${theme.palette.primary.dark} 100%)`,
              borderRadius: '12px',
              p: 1,
              mr: 2
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        {loading ? (
          <LinearProgress 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: 'rgba(255,255,255,0.1)',
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${color} 0%, ${theme.palette.primary.dark} 100%)`
              }
            }} 
          />
        ) : (
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
            {value}
          </Typography>
        )}
      </CardContent>
    </StyledCard>
  );
};

const AdminDashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalSites: 0,
    totalTokens: 0,
    activeUsers: 0
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/stats`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      // Se der erro, mantém os valores em 0
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
          Dashboard
        </Typography>
        <IconButton 
          onClick={fetchStats}
          sx={{ 
            color: '#7C3AED',
            '&:hover': {
              background: 'rgba(124, 58, 237, 0.1)'
            }
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total de Usuários"
            value={stats.totalUsers}
            icon={<PeopleIcon sx={{ color: '#fff' }} />}
            color="#7C3AED"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sites Gerados"
            value={stats.totalSites}
            icon={<WebIcon sx={{ color: '#fff' }} />}
            color="#10B981"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tokens Disponíveis"
            value={stats.totalTokens}
            icon={<TokenIcon sx={{ color: '#fff' }} />}
            color="#F59E0B"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Usuários Ativos"
            value={stats.activeUsers}
            icon={<PeopleIcon sx={{ color: '#fff' }} />}
            color="#3B82F6"
            loading={loading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardHeader
              title="Atividade Recente"
              sx={{ 
                color: '#fff',
                borderBottom: '1px solid rgba(124, 58, 237, 0.2)'
              }}
            />
            <CardContent>
              {/* Adicionar lista de atividades recentes aqui */}
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Em desenvolvimento...
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardHeader
              title="Estatísticas"
              sx={{ 
                color: '#fff',
                borderBottom: '1px solid rgba(124, 58, 237, 0.2)'
              }}
            />
            <CardContent>
              {/* Adicionar gráficos ou estatísticas aqui */}
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Em desenvolvimento...
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
