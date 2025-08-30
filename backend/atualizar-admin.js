const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://painelftm:7C3Ek3YKGfyes5n8@cluster0.u6gfcju.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function atualizarAdmin() {
  await mongoose.connect(MONGODB_URI);
  const email = 'painelftm@gmail.com';
  const senha = 'DIVJroiDIVJ#painelftm';
  const tokenVercel = 'SEU_TOKEN_VERCEL_AQUI'; // Substitua pelo token correto

  const hash = await bcrypt.hash(senha, 10);

  const result = await User.updateOne(
    { email },
    {
      $set: {
        nome: 'Administrador',
        tipo: 'admin',
        senha: hash,
        tokenVercel,
        tokens: 999999
      }
    }
  );

  if (result.matchedCount > 0) {
    console.log('Usuário admin atualizado com sucesso!');
  } else {
    console.log('Usuário admin não encontrado para atualizar.');
  }
  await mongoose.disconnect();
}

atualizarAdmin().catch(err => {
  console.error('Erro ao atualizar admin:', err);
  mongoose.disconnect();
}); 