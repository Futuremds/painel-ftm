const mongoose = require('mongoose');
const Afiliado = require('../models/afiliado');

console.log('Iniciando script...');

// Adiciona handler para erros não tratados
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

mongoose.set('debug', true); // Ativa logs do mongoose

const uri = 'mongodb+srv://ashercontigencia:ashercontigencia@advcluster.kbk8nfu.mongodb.net/painelAdvogados?retryWrites=true&w=majority';
console.log('Tentando conectar ao MongoDB Atlas...');

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout após 5 segundos
}).then(() => {
  console.log('Conectado ao MongoDB Atlas com sucesso!');
}).catch(err => {
  console.error('Erro ao conectar ao MongoDB:', err);
  process.exit(1);
});

async function createAfiliado() {
  try {
    console.log('Verificando se o afiliado existe...');
    
    // Primeiro verifica se já existe
    const existingAfiliado = await Afiliado.findOne({ email: 'painel@ftm.com' });
    
    if (existingAfiliado) {
      console.log('Afiliado já existe. Atualizando tokens...');
      existingAfiliado.tokens = (existingAfiliado.tokens || 0) + 5;
      await existingAfiliado.save();
      console.log(`Tokens atualizados! Novo saldo: ${existingAfiliado.tokens}`);
    } else {
      console.log('Criando novo afiliado...');
      // Criar novo afiliado
      const novoAfiliado = new Afiliado({
        email: 'painel@ftm.com',
        senha: '123456', // você deve alterar isso depois
        tokens: 5,
        advogados: []
      });

      await novoAfiliado.save();
      console.log('Novo afiliado criado com 5 tokens!');
    }

    await mongoose.connection.close();
    console.log('Conexão com MongoDB fechada.');
    process.exit(0);
  } catch (error) {
    console.error('Erro durante a execução:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Esperar a conexão ser estabelecida antes de executar
mongoose.connection.once('open', () => {
  console.log('Conexão estabelecida, executando script...');
  createAfiliado();
}); 