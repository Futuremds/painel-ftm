require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function criarAdmin() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/painel-ftm');
    console.log('Conectado ao MongoDB');

    const email = 'painelftm@gmail.com';
    const senha = 'DIVJroiDIVJ#painelftm';
    const tokenVercel = 'XJJKEBiPcj6EWQQyPXckJVUI';

    // Verificar se o admin já existe
    const adminExistente = await User.findOne({ email });
    if (adminExistente) {
      console.log('Admin já existe, atualizando...');
      adminExistente.senha = senha;
      adminExistente.tokenVercel = tokenVercel;
      await adminExistente.save();
      console.log('Admin atualizado com sucesso!');
    } else {
      console.log('Criando novo admin...');
      await User.criarAdmin(email, senha, tokenVercel);
      console.log('Admin criado com sucesso!');
    }

    console.log('Processo finalizado!');
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

criarAdmin(); 