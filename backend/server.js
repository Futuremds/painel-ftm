console.log("=== BACKEND INICIADO ===");
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
console.log('[DEBUG] NETLIFY_TOKEN:', process.env.NETLIFY_TOKEN ? process.env.NETLIFY_TOKEN.substring(0, 8) + '...' : 'NÃO DEFINIDO');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const copiarEPreencherTemplate = require('./utils/copiarEPreencherTemplate');
const { deployToVercel, createGitHubRepo, pushToGitHub } = require('./utils/deployToVercel');
const Site = require('./models/Site');
const pagamentoRoutes = require('./routes/pagamento');

// Verificar variáveis de ambiente
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET não está definido no .env');
  process.exit(1);
}

// Criar pasta generated-sites se não existir
const generatedSitesPath = path.join(__dirname, 'generated-sites');
if (!fs.existsSync(generatedSitesPath)) {
  fs.mkdirSync(generatedSitesPath, { recursive: true });
}

// Rotas
const siteRoutes = require('./routes/siteRoutes');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware para logar todas as requisições (ADICIONADO AQUI)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('---');
  next();
});

// Middlewares globais
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://painelftm.com.br',
    'http://69.62.86.183:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(cookieParser());

// MongoDB Atlas
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Collections
let db, usersCollection, sitesCollection;

mongoose.connect(uri);
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose conectado ao MongoDB Atlas');
});
mongoose.connection.on('error', (err) => {
  console.error('Erro de conexão do Mongoose:', err);
});

// Middleware de autenticação melhorado
const authMiddleware = async (req, res, next) => {
  try {
    console.log('Verificando autenticação...');

    let token = req.cookies.token;

    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
    }

    console.log('Token recebido:', token ? token.substring(0, 10) + '...' : 'não fornecido');

    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      console.log('Token decodificado:', decoded);

      const user = await usersCollection.findOne({ _id: new ObjectId(decoded.id) });

      if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }
      // Garante que req.user.id sempre exista
      user.id = user._id.toString();
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('Erro na verificação do JWT:', jwtError);
      return res.status(401).json({ message: 'Token inválido' });
    }
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ message: 'Erro de autenticação' });
  }
};

async function start() {
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB Atlas');

    db = client.db('painelAdvogados');
    usersCollection = db.collection('users');
    sitesCollection = db.collection('sites');
    // Garante que o db estará disponível em todas as rotas via req.app.locals.db
    app.locals.db = db;

    // Middleware para injetar collections nas rotas
    app.use((req, res, next) => {
      req.dbCollections = {
        usersCollection,
        sitesCollection,
      };
      next();
    });

    // Log global de todas as requisições
    app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
      next();
    });

    // Rota raiz
    app.get('/', (req, res) => {
      res.send('Servidor Express está funcionando!');
    });

    // Rota para adicionar tokens
    app.post('/api/admin/add-tokens', async (req, res) => {
      try {
        const { userId, quantidade } = req.body;

        if (!userId || !quantidade || quantidade <= 0) {
          return res.status(400).json({ error: 'Dados inválidos' });
        }

        const result = await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          {
            $inc: { tokens: quantidade },
            $setOnInsert: {
              dataCriacao: new Date()
            }
          },
          { upsert: true }
        );

        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        res.json({
          success: true,
          message: 'Tokens adicionados com sucesso',
          tokens: user.tokens
        });
      } catch (err) {
        console.error('Erro ao adicionar tokens:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });

    // Rota para verificar tokens
    app.get('/api/user/:id/tokens', async (req, res) => {
      try {
        const user = await usersCollection.findOne({
          _id: new ObjectId(req.params.id)
        });

        if (!user) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json({
          tokens: user.tokens || 0
        });
      } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar tokens' });
      }
    });

    // Rotas da API
    app.use('/api/sites', siteRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/pagamento', pagamentoRoutes);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT} (acessível externamente)`);
    });

  } catch (error) {
    console.error('Erro na conexão com MongoDB:', error);
  }
}

start();
