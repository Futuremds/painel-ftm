const mongoose = require('mongoose');

const AfiliadoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  telefone: {
    type: String,
    required: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  senha: { 
    type: String, 
    required: false // Não obrigatório para cadastro admin
  },
  tokens: { 
    type: Number, 
    default: 0 
  },
  advogados: [{
    nome: String,
    whatsapp: String,
    siteId: String,
    status: {
      type: String,
      default: 'Pendente'
    }
  }],
  criadoEm: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Afiliado', AfiliadoSchema); 