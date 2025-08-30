const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://ashercontigencia:ashercontigencia@advcluster.kbk8nfu.mongodb.net/painelAdvogados?retryWrites=true&w=majority';
const client = new MongoClient(uri);

async function addTokens() {
  try {
    console.log('Conectando ao MongoDB Atlas...');
    await client.connect();
    
    const db = client.db('painelAdvogados');
    const collection = db.collection('afiliados');
    
    console.log('Procurando afiliado...');
    const result = await collection.updateOne(
      { email: 'painel@ftm.com' },
      { 
        $inc: { tokens: 5 },
        $setOnInsert: {
          senha: '123456',
          advogados: [],
          criadoEm: new Date()
        }
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log('Novo afiliado criado com 5 tokens!');
    } else {
      console.log('Tokens adicionados ao afiliado existente!');
    }

    const afiliado = await collection.findOne({ email: 'painel@ftm.com' });
    console.log('Saldo atual de tokens:', afiliado.tokens);

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
    process.exit();
  }
}

addTokens(); 