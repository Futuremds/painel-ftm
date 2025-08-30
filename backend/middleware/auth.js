const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb+srv://ashercontigencia:ashercontigencia@advcluster.kbk8nfu.mongodb.net/painelAdvogados?retryWrites=true&w=majority';
const client = new MongoClient(uri);

module.exports = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'ID do usuário não fornecido' 
      });
    }
    await client.connect();
    const db = client.db('painelAdvogados');
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Usuário não encontrado' 
      });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ 
      success: false,
      message: 'Erro na autenticação',
      error: err.message 
    });
  } finally {
    try {
      await client.close();
    } catch (closeError) {
      // ignora
    }
  }
}; 