const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const auth = require('../middleware/auth');

// Middleware para verificar se é admin
const isAdmin = async (req, res, next) => {
  if (req.user.tipo !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem acessar esta rota.'
    });
  }
  next();
};

// Listar todos os usuários
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await req.dbCollections.usersCollection.find({}).toArray();
    res.json({
      success: true,
      users: users.map(user => ({
        _id: user._id,
        email: user.email,
        nome: user.nome,
        tipo: user.tipo,
        tokens: user.tokens,
        dataCriacao: user.dataCriacao
      }))
    });
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar usuários'
    });
  }
});

// Criar novo usuário
router.post('/users', auth, isAdmin, async (req, res) => {
  try {
    const { email, password, nome, tokens } = req.body;

    // Validar campos obrigatórios
    if (!email || !password || !nome) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      });
    }

    // Verificar se email já existe
    const userExists = await req.dbCollections.usersCollection.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Criptografar senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Criar usuário
    const user = {
      email,
      senha: hashedPassword,
      nome,
      tipo: 'user',
      tokens: tokens || 5,
      dataCriacao: new Date()
    };

    const result = await req.dbCollections.usersCollection.insertOne(user);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        _id: result.insertedId,
        email: user.email,
        nome: user.nome,
        tipo: user.tipo,
        tokens: user.tokens
      }
    });
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário'
    });
  }
});

// Atualizar usuário
router.put('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, nome, tokens } = req.body;

    // Validar campos obrigatórios
    if (!email || !nome) {
      return res.status(400).json({
        success: false,
        message: 'Email e nome são obrigatórios'
      });
    }

    // Verificar se usuário existe
    const user = await req.dbCollections.usersCollection.findOne({ _id: new ObjectId(id) });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se email já existe (exceto para o próprio usuário)
    if (email !== user.email) {
      const emailExists = await req.dbCollections.usersCollection.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado'
        });
      }
    }

    // Preparar dados para atualização
    const updateData = {
      email,
      nome,
      tokens: tokens || user.tokens
    };

    // Se senha foi fornecida, criptografar
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.senha = await bcrypt.hash(password, salt);
    }

    // Atualizar usuário
    await req.dbCollections.usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário'
    });
  }
});

// Excluir usuário
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se usuário existe
    const user = await req.dbCollections.usersCollection.findOne({ _id: new ObjectId(id) });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Não permitir excluir admin
    if (user.tipo === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Não é possível excluir um administrador'
      });
    }

    // Excluir usuário
    await req.dbCollections.usersCollection.deleteOne({ _id: new ObjectId(id) });

    res.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });
  } catch (err) {
    console.error('Erro ao excluir usuário:', err);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir usuário'
    });
  }
});

// Adicionar tokens
router.post('/add-tokens', auth, isAdmin, async (req, res) => {
  try {
    const { userId, quantidade } = req.body;

    if (!userId || !quantidade || quantidade <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário e quantidade são obrigatórios'
      });
    }

    // Verificar se usuário existe
    const user = await req.dbCollections.usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Atualizar tokens
    const result = await req.dbCollections.usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { tokens: quantidade } }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Erro ao adicionar tokens'
      });
    }

    res.json({
      success: true,
      message: 'Tokens adicionados com sucesso'
    });
  } catch (err) {
    console.error('Erro ao adicionar tokens:', err);
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar tokens'
    });
  }
});

// Estatísticas gerais do painel admin
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const usersCollection = req.dbCollections.usersCollection;
    const sitesCollection = req.dbCollections.sitesCollection;

    // Total de usuários
    const totalUsers = await usersCollection.countDocuments({});
    // Total de sites
    const totalSites = await sitesCollection.countDocuments({});
    // Total de tokens disponíveis
    const tokensAgg = await usersCollection.aggregate([
      { $group: { _id: null, total: { $sum: "$tokens" } } }
    ]).toArray();
    const totalTokens = tokensAgg[0]?.total || 0;
    // Usuários ativos (login nos últimos 30 dias)
    const last30 = new Date(Date.now() - 30*24*60*60*1000);
    const activeUsers = await usersCollection.countDocuments({ ultimoLogin: { $gte: last30 } });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalSites,
        totalTokens,
        activeUsers
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas', error: err.message });
  }
});

// Estatísticas de vendas
router.get('/vendas', auth, isAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const vendasPagas = await db.collection('pix_orders').find({ status: 'paid' }).toArray();
    const totalVendas = vendasPagas.length;
    const totalTokensVendidos = vendasPagas.reduce((acc, venda) => acc + (venda.quantidadeTokens || 0), 0);
    // Lista resumida para o dashboard
    const vendasResumo = vendasPagas.map(v => ({
      order_id: v.order_id,
      user_id: v.user_id,
      quantidadeTokens: v.quantidadeTokens,
      paidAt: v.paidAt || v.updatedAt || v.createdAt
    }));
    res.json({
      success: true,
      totalVendas,
      totalTokensVendidos,
      vendas: vendasResumo
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar vendas', error: err.message });
  }
});

module.exports = router; 