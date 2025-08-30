const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://painelftm:7C3Ek3YKGfyes5n8@cluster0.u6gfcju.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function criarAdmin() {
  await mongoose.connect(MONGODB_URI);
  const email = 'painelftm@gmail.com';
  const senha = 'DIVJroiDIVJ#painelftm';
  const tokenVercel = 'SEU_TOKEN_VERCEL_AQUI'; // Substitua pelo token desejado

  let admin = await User.findOne({ email });
  if (admin) {
    console.log('Admin já existe:', email);
    await mongoose.disconnect();
    return;
  }

  admin = new User({
    email,
    senha,
    tokenVercel,
    nome: 'Administrador',
    tipo: 'admin',
    tokens: 999999
  });
  await admin.save();
  console.log('Admin criado com sucesso:', email);
  await mongoose.disconnect();
}

criarAdmin().catch(err => {
  console.error('Erro ao criar admin:', err);
  mongoose.disconnect();
}); 