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
  Web as WebIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  Note as NoteIcon,
  Token as TokenIcon,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import logoPainel from '../imagens/logopainelftm.png.ico';

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

const TokenDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: '12px',
  background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.2) 0%, rgba(124, 58, 237, 0.1) 100%)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)',
  }
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: 'none',
  }
}));

const Layout = ({ children, onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Meus Sites', icon: <WebIcon />, path: '/meus-sites' },
    { text: 'Criar Site', icon: <AddIcon />, path: '/configuracoes-site' },
    { text: 'Comprar Tokens', icon: <TokenIcon />, path: '/comprar-tokens' }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const drawer = (
    <div>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        {user.foto ? (
          <UserAvatar src={user.foto}>
            {user.nome?.charAt(0)?.toUpperCase()}
          </UserAvatar>
        ) : (
          <img src={logoPainel} alt="Logo Painel FTM" style={{ width: 40, height: 40, borderRadius: 8, display: 'block' }} />
        )}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#fff' }}>
            {user.nome || 'Usuário'}
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
          <TokenDisplay>
            <TokenIcon sx={{ color: '#7C3AED' }} />
            <Typography variant="h6" sx={{ color: '#7C3AED', fontWeight: 600 }}>
              {user.tokens || 0} Tokens
            </Typography>
          </TokenDisplay>
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
          mt: '64px',
          background: '#111827',
          minHeight: '100vh',
          position: 'relative'
        }}
      >
        {children}
        <Box
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 2000
          }}
        >
          <Tooltip title="Fale conosco no WhatsApp" placement="left" arrow>
            <IconButton
              sx={{
                background: '#25D366',
                color: '#fff',
                width: 64,
                height: 64,
                boxShadow: '0 4px 24px rgba(37,211,102,0.3)',
                '&:hover': { background: '#128C7E' }
              }}
              href="https://wa.me/5531971391218"
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon sx={{ fontSize: 38 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 