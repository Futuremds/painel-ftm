import React, { useEffect, useState } from 'react';
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
  CircularProgress,
  Alert
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import axios from 'axios';

const AdminVendas = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vendas, setVendas] = useState([]);
  const [totalVendas, setTotalVendas] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);

  useEffect(() => {
    fetchVendas();
  }, []);

  const fetchVendas = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/vendas`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        setVendas(response.data.vendas);
        setTotalVendas(response.data.totalVendas);
        setTotalTokens(response.data.totalTokensVendidos);
      } else {
        setError('Erro ao buscar vendas');
      }
    } catch (err) {
      setError('Erro ao buscar vendas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <MonetizationOnIcon sx={{ color: '#F59E0B', fontSize: 36 }} /> Vendas
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Paper sx={{ p: 2, mb: 3, background: 'rgba(17,24,39,0.7)', color: '#fff' }}>
            <Typography variant="h6" sx={{ color: '#fff' }}>Total de Vendas: <b>{totalVendas}</b></Typography>
            <Typography variant="h6" sx={{ color: '#fff' }}>Total de Tokens Vendidos: <b>{totalTokens}</b></Typography>
          </Paper>
          <TableContainer component={Paper} sx={{ background: 'rgba(17,24,39,0.7)' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Usuário (ID)</TableCell>
                  <TableCell>Tokens</TableCell>
                  <TableCell>Data de Pagamento</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendas.map((venda) => (
                  <TableRow key={venda.order_id}>
                    <TableCell>{venda.order_id}</TableCell>
                    <TableCell>{venda.user_id}</TableCell>
                    <TableCell>{venda.quantidadeTokens}</TableCell>
                    <TableCell>{venda.paidAt ? new Date(venda.paidAt).toLocaleString('pt-BR') : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default AdminVendas; 

