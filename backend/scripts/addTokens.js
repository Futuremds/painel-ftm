const mongoose = require('mongoose');
const Afiliado = require('../models/afiliado');

console.log('Iniciando script...');

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/painel-afiliados', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado ao MongoDB com sucesso!');
}).catch(err => {
  console.error('Erro ao conectar ao MongoDB:', err);
  process.exit(1);
});

async function addTokens() {
  try {
    console.log('Buscando afiliado com email: painel@ftm.com');
    
    // Buscar o afiliado pelo email específico
    const afiliado = await Afiliado.findOne({ email: 'painel@ftm.com' });
    
    if (!afiliado) {
      console.log('Afiliado não encontrado com este email');
      process.exit(1);
    }

    console.log('Afiliado encontrado:', afiliado);

    // Adicionar 5 tokens
    afiliado.tokens = (afiliado.tokens || 0) + 5;
    await afiliado.save();

    console.log(`Tokens adicionados com sucesso para ${afiliado.email}! Novo saldo: ${afiliado.tokens}`);
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

// Esperar a conexão ser estabelecida antes de executar
mongoose.connection.once('open', () => {
  console.log('Conexão estabelecida, executando script...');
  addTokens();
}); 