import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, CircularProgress, Alert, Link, Snackbar, IconButton } from '@mui/material';
import { ContentCopy as CopyIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function ComprarTokens() {
  const [quantidade, setQuantidade] = useState(5);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [erro, setErro] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const valorTotal = quantidade * 4;

  const handleComprar = async () => {
    setErro('');
    setSuccess('');
    setQrCode('');
    setQrCodeUrl('');
    setCopied(false);
    setSnackbar({ open: false, message: '', severity: 'success' });
    if (quantidade < 5) {
      setErro('A quantidade mínima é 5 tokens (R$20,00)');
      setSnackbar({ open: true, message: 'A quantidade mínima é 5 tokens (R$20,00)', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/pagamento/pix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantidadeTokens: quantidade, userId: user.id })
      });
      const data = await response.json();
      if (data.success) {
        setQrCode(data.pix.qr_code);
        setQrCodeUrl(data.pix.qr_code_url);
        setOrderId(data.pix.order_id);
        setSuccess('Use o QR Code abaixo para pagar com Pix. Os tokens serão liberados automaticamente após o pagamento.');
        setSnackbar({ open: true, message: 'QR Code gerado! Pague com Pix para liberar os tokens.', severity: 'success' });
      } else {
        setErro(data.error || 'Erro ao gerar cobrança Pix');
        setSnackbar({ open: true, message: data.error || 'Erro ao gerar cobrança Pix', severity: 'error' });
      }
    } catch (err) {
      setErro('Erro ao conectar com o servidor');
      setSnackbar({ open: true, message: 'Erro ao conectar com o servidor', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Polling para checar status do pagamento
  useEffect(() => {
    if (!orderId) return;
    let interval;
    let tentativas = 0;
    const checarStatus = async () => {
      try {
        const resp = await fetch(`${process.env.REACT_APP_API_URL}/api/pagamento/status/${orderId}`);
        const data = await resp.json();
        if (data.status === 'paid') {
          setPagamentoConfirmado(true);
          setSuccess('Pagamento confirmado! Seus tokens foram liberados. Você será redirecionado para o dashboard.');
          setSnackbar({ open: true, message: 'Pagamento confirmado! Tokens liberados.', severity: 'success' });

          // Buscar dados atualizados do usuário e atualizar localStorage
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const respUser = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const userData = await respUser.json();
              if (userData.success && userData.user) {
                localStorage.setItem('user', JSON.stringify(userData.user));
              }
            } catch (e) {
              // Se falhar, ignora
            }
          }

          setTimeout(() => navigate('/dashboard'), 3500);
        }
      } catch {}
      tentativas++;
      if (tentativas > 60) clearInterval(interval); // para polling após 5 minutos
    };
    interval = setInterval(checarStatus, 3000);
    return () => clearInterval(interval);
  }, [orderId, navigate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(qrCode);
    setCopied(true);
    setSnackbar({ open: true, message: 'Código Pix copiado!', severity: 'info' });
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Box sx={{ maxWidth: 440, mx: 'auto', mt: 6 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')} sx={{ mb: 2, color: '#7C3AED', fontWeight: 700, textTransform: 'none', background: 'none', boxShadow: 'none', '&:hover': { background: 'rgba(124,58,237,0.08)' } }}>
        Voltar para o Dashboard
      </Button>
      <Paper sx={{ p: 4, borderRadius: 5, background: 'rgba(30,32,40,0.98)', boxShadow: '0 8px 32px 0 rgba(124,58,237,0.15)' }}>
        <Typography variant="h4" sx={{ color: '#7C3AED', fontWeight: 800, mb: 2, textAlign: 'center', letterSpacing: 1 }}>
          Comprar Tokens
        </Typography>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: '#fff', mb: 1 }}>
            <b>1 token = 1 site</b> <br /> Valor unitário: <b>R$4,00</b>
          </Typography>
          <Typography variant="body2" sx={{ color: '#bdbdbd', mb: 1 }}>
            Compra mínima: <b>5 tokens (R$20,00)</b>
          </Typography>
        </Box>
        <TextField
          label="Quantidade de Tokens"
          type="number"
          value={quantidade}
          onChange={e => setQuantidade(Number(e.target.value))}
          fullWidth
          inputProps={{ min: 5 }}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
            Valor total:
          </Typography>
          <Typography variant="h5" sx={{ color: '#7C3AED', fontWeight: 900, letterSpacing: 1 }}>
            R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={handleComprar}
          disabled={loading}
          sx={{ fontWeight: 700, mb: 2, py: 1.5, fontSize: 18, borderRadius: 3 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Gerar QR Code Pix'}
        </Button>
        {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {qrCode && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
              2. Pague com Pix
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrCode)}`}
                alt="QR Code Pix"
                style={{ margin: '0 auto', borderRadius: 16, border: '4px solid #7C3AED', boxShadow: '0 4px 24px 0 rgba(124,58,237,0.15)' }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: '#fff', mt: 2, mb: 1 }}>
              Ou copie o código Pix:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField
                value={qrCode}
                fullWidth
                InputProps={{ readOnly: true }}
                sx={{ background: '#23243a', borderRadius: 2 }}
                onFocus={e => e.target.select()}
              />
              <Button onClick={handleCopy} sx={{ minWidth: 44, ml: 1, color: copied ? '#10B981' : '#7C3AED' }}>
                {copied ? <CheckIcon /> : <CopyIcon />}
              </Button>
            </Box>
            <Link href={qrCodeUrl} target="_blank" rel="noopener" sx={{ color: '#7C3AED', fontWeight: 700, fontSize: 16 }}>
              Ver cobrança no site do banco
            </Link>
            <Alert severity="info" sx={{ mt: 3, background: 'rgba(124,58,237,0.08)', color: '#7C3AED', fontWeight: 600, border: '1px solid #7C3AED' }}>
              Após o pagamento, os tokens serão liberados automaticamente.<br />Você receberá uma confirmação aqui na plataforma.
            </Alert>
          </Box>
        )}
        {pagamentoConfirmado && (
          <Alert severity="success" sx={{ mt: 3, fontWeight: 700, fontSize: 18 }}>
            Pagamento confirmado! Seus tokens foram liberados.<br />Você será redirecionado para o dashboard.
          </Alert>
        )}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}
