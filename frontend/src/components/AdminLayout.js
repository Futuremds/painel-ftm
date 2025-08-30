import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  Avatar,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ExitToApp as ExitToAppIcon,
  Settings as SettingsIcon,
  MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const drawerWidth = 280;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    background: 'linear-gradient(180deg, #111827 0%, #1F2937 100%)',
    color: '#fff',
    borderRight: '1px solid rgba(124, 58, 237, 0.2)',
    boxShadow: '4px 0 24px rgba(0, 0, 0, 0.2)'
  },
}));

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  margin: '8px 16px',
  borderRadius: '12px',
  background: selected 
    ? 'linear-gradient(90deg, rgba(124, 58, 237, 0.2) 0%, rgba(124, 58, 237, 0.1) 100%)' 
    : 'transparent',
  color: selected ? '#7C3AED' : '#fff',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.2) 0%, transparent 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    background: 'rgba(124, 58, 237, 0.1)',
    '&::before': {
      opacity: 1,
    },
  },
  '& .MuiListItemIcon-root': {
    color: selected ? '#7C3AED' : '#fff',
    transition: 'transform 0.3s ease',
  },
  '&:hover .MuiListItemIcon-root': {
    transform: 'scale(1.1)',
  },
  '& .MuiListItemText-root': {
    color: selected ? '#7C3AED' : '#fff',
  }
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  width: `calc(100% - ${drawerWidth}px)`,
  marginLeft: drawerWidth,
  background: 'rgba(17, 24, 39, 0.8)',
  backdropFilter: 'blur(10px)',
  color: '#fff',
  boxShadow: 'none',
  borderBottom: '1px solid rgba(124, 58, 237, 0.2)'
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  background: 'linear-gradient(135deg, #7C3AED 0%, #4B1FA6 100%)',
  border: '2px solid rgba(124, 58, 237, 0.2)',
  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 16px rgba(124, 58, 237, 0.3)',
  }
}));

const AdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Verificar se é admin
  if (user.tipo !== 'admin') {
    navigate('/login');
    return null;
  }

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin-ftm' },
    { text: 'Usuários', icon: <PeopleIcon />, path: '/admin-ftm/usuarios' },
    { text: 'Vendas', icon: <MonetizationOnIcon />, path: '/admin-ftm/vendas' },
    { text: 'Configurações', icon: <SettingsIcon />, path: '/admin-ftm/settings' }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const drawer = (
    <div>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <UserAvatar src={user.foto}>
          {user.nome?.charAt(0)?.toUpperCase()}
        </UserAvatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#fff' }}>
            {user.nome || 'Administrador'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {user.email}
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List>
        {menuItems.map((item) => (
          <Tooltip 
            key={item.text} 
            title={item.text} 
            placement="right"
            arrow
          >
            <StyledListItem 
              button 
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </StyledListItem>
          </Tooltip>
        ))}
        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
        <Tooltip title="Sair" placement="right" arrow>
          <StyledListItem button onClick={handleLogout}>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Sair" />
          </StyledListItem>
        </Tooltip>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', background: '#111827' }}>
      <StyledAppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ color: '#7C3AED', fontWeight: 600 }}>
            Painel de Administração
          </Typography>
        </Toolbar>
      </StyledAppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: 'linear-gradient(180deg, #111827 0%, #1F2937 100%)',
              color: '#fff'
            },
          }}
        >
          {drawer}
        </Drawer>
        <StyledDrawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
          }}
          open
        >
          {drawer}
        </StyledDrawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: '64px'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout; 