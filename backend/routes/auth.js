const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'segredo';

// Middleware para validar dados do usuário
const validarDadosUsuario = (req, res, next) => {
  const { email, senha, nome } = req.body;

  if (!email || !senha || !nome) {
    return res.status(400).json({
      success: false,
      message: 'Todos os campos são obrigatórios'
    });
  }

  if (senha.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'A senha deve ter no mínimo 6 caracteres'
    });
  }

  next();
};

// Cadastro
router.post('/register', validarDadosUsuario, async (req, res) => {
  try {
    console.log('Tentativa de registro:', req.body.email);

    // Verificar se email já existe
    const usuarioExistente = await User.findOne({ email: req.body.email });
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    const user = new User(req.body);
    await user.save();

    // Gerar token JWT igual ao login
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        tipo: user.tipo
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Configurar cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });

    console.log('Usuário registrado com sucesso:', user.email);
    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      token,
      user: {
        id: user._id,
        email: user.email,
        nome: user.nome,
        tipo: user.tipo,
        tokens: user.tokens
      }
    });
  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(500).json({
      success: false,
      message: 'Erro ao cadastrar usuário',
      error: err.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('=== TENTATIVA DE LOGIN ===');
    console.log('Dados recebidos:', {
      email: req.body.email,
      senha: req.body.senha ? '***' : 'não fornecida'
    });

    const { email, senha } = req.body;

    if (!email || !senha) {
      console.log('Email ou senha não fornecidos');
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário
    const user = await User.findOne({ email });
    console.log('Usuário encontrado:', user ? 'Sim' : 'Não');

    if (!user) {
      console.log('Usuário não encontrado para o email:', email);
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const senhaValida = await user.compararSenha(senha);
    console.log('Senha válida:', senhaValida ? 'Sim' : 'Não');

    if (!senhaValida) {
      console.log('Senha inválida para o usuário:', email);
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Atualizar último login
    user.ultimoLogin = new Date();
    await user.save();

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        tipo: user.tipo
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Configurar cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });

    console.log('Login realizado com sucesso para:', user.email);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        nome: user.nome,
        tipo: user.tipo,
        tokens: user.tokens
      }
    });
  } catch (err) {
    console.error('ERRO NO LOGIN:', err);
    res.status(500).json({
      success: false,
      message: 'Erro ao realizar login',
      error: err.message
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logout realizado com sucesso' });
});

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-senha');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        nome: user.nome,
        tipo: user.tipo,
        tokens: user.tokens
      }
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
});

// Checagem de autenticação
router.get('/check', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.token || req.headers['x-access-token'] || req.headers['token'];
    if (!token) {
      return res.json({ authenticated: false });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    // Buscar usuário no banco para garantir que existe
    const user = await User.findById(decoded.id).select('-senha');
    if (!user) {
      return res.json({ authenticated: false });
    }
    return res.json({ authenticated: true, user: {
      id: user._id,
      email: user.email,
      nome: user.nome,
      tipo: user.tipo,
      tokens: user.tokens
    }});
  } catch (err) {
    return res.json({ authenticated: false });
  }
});

// Rota para retornar dados do usuário autenticado
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-senha');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        nome: user.nome,
        tipo: user.tipo,
        tokens: user.tokens,
        tokenVercel: user.tokenVercel,
        cpf: user.cpf,
        telefone: user.telefone
      }
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
});

module.exports = router;
