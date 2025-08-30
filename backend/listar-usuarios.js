const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://painelftm:7C3Ek3YKGfyes5n8@cluster0.u6gfcju.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function listarUsuarios() {
  await mongoose.connect(MONGODB_URI);
  const usuarios = await User.find({});
  console.log('Usuários cadastrados:');
  usuarios.forEach(u => {
    console.log(`- Email: ${u.email} | Nome: ${u.nome} | Tipo: ${u.tipo}`);
  });
  await mongoose.disconnect();
}

listarUsuarios().catch(err => {
  console.error('Erro ao listar usuários:', err);
  mongoose.disconnect();
}); 