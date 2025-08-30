const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function addTokens() {
  try {
    console.log('Conectando ao MongoDB Atlas...');
    await client.connect();
    
    const db = client.db('painelAdvogados');
    const collection = db.collection('afiliados');
    
    console.log('Procurando admin...');
    const result = await collection.updateOne(
      { email: 'painelftm@gmail.com' },
      { 
        $inc: { tokens: 20 },
        $setOnInsert: {
          password: 'DIVJroiDIVJ#painelftm',
          tipo: 'admin',
          nome: 'Administrador',
          dataCriacao: new Date()
        }
      },
      { upsert: true }
    );

    console.log('Resultado da operação:', result);
    console.log('Tokens adicionados com sucesso!');
  } catch (error) {
    console.error('Erro ao adicionar tokens:', error);
  } finally {
    await client.close();
  }
}

addTokens(); 