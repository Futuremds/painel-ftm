import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const Logo = () => {
  const [logos, setLogos] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [logoName, setLogoName] = useState('');
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    // Carregar logos do localStorage
    const savedLogos = localStorage.getItem('logos');
    if (savedLogos) {
      setLogos(JSON.parse(savedLogos));
    }
  }, []);

  const handleSaveLogos = (newLogos) => {
    localStorage.setItem('logos', JSON.stringify(newLogos));
    setLogos(newLogos);
  };

  const handleAddLogo = () => {
    setSelectedLogo(null);
    setLogoName('');
    setLogoFile(null);
    setOpenDialog(true);
  };

  const handleEditLogo = (logo) => {
    setSelectedLogo(logo);
    setLogoName(logo.name);
    setLogoFile(null);
    setOpenDialog(true);
  };

  const handleDeleteLogo = (logoId) => {
    const newLogos = logos.filter(logo => logo.id !== logoId);
    handleSaveLogos(newLogos);
  };

  const handleSaveLogo = () => {
    if (!logoName || (!logoFile && !selectedLogo)) return;

    const newLogo = {
      id: selectedLogo?.id || Date.now(),
      name: logoName,
      url: selectedLogo?.url || URL.createObjectURL(logoFile)
    };

    if (selectedLogo) {
      const newLogos = logos.map(logo => 
        logo.id === selectedLogo.id ? newLogo : logo
      );
      handleSaveLogos(newLogos);
    } else {
      handleSaveLogos([...logos, newLogo]);
    }

    setOpenDialog(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gerenciar Logos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddLogo}
        >
          Adicionar Logo
        </Button>
      </Box>

      <Grid container spacing={3}>
        {logos.map((logo) => (
          <Grid item xs={12} sm={6} md={4} key={logo.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={logo.url}
                alt={logo.name}
                sx={{ objectFit: 'contain', bgcolor: '#f5f5f5' }}
              />
              <CardContent>
                <Typography variant="h6" noWrap>
                  {logo.name}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleEditLogo(logo)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteLogo(logo.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {selectedLogo ? 'Editar Logo' : 'Adicionar Logo'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome da Logo"
            fullWidth
            value={logoName}
            onChange={(e) => setLogoName(e.target.value)}
            sx={{ mb: 2 }}
          />
          {!selectedLogo && (
            <Button
              variant="outlined"
              component="label"
              fullWidth
            >
              Escolher Arquivo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files[0])}
              />
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSaveLogo} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Logo; 