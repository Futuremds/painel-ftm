const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

async function criarAdmin() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('painelAdvogados');
    const users = db.collection('users');

    const email = 'painel@ftm.com';
    const senha = 'DIVJroiDIVJ#18072002';
    const tokenVercel = process.env.VERCEL_TOKEN;
    const nome = 'Admin FTM';

    // Verifica se já existe
    const existe = await users.findOne({ email });
    if (existe) {
      console.log('Usuário admin já existe!');
      return;
    }

    const hash = await bcrypt.hash(senha, 10);

    await users.insertOne({
      email,
      senha: hash,
      tokenVercel,
      nome,
      tipo: 'admin',
      tokens: 9999,
      telefone: '11999999999',
      cpf: '000.000.000-00',
      dataCriacao: new Date()
    });

    console.log('Usuário admin criado com sucesso!');
  } catch (err) {
    console.error('Erro ao criar admin:', err);
  } finally {
    await client.close();
  }
}

criarAdmin(); 