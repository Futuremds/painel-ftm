const mongoose = require('mongoose');

const SiteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  config: {
    // Informações Básicas
    RAZÃO: String,
    CNPJ: String,
    MISSÃO: String,
    SOBRE: String,
    RODAPE: String,

    // Contatos
    TELEFONE: String,
    EMAIL: String,
    INSTAGRAM: String,
    WHATSAPP: String,

    // Integrações
    PIXEL_META: String,
    APP_ID: String,

    // Links
    LINK_PAGINA: String
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'error'],
    default: 'pending'
  },
  lastGenerated: {
    type: Date,
    default: null
  },
  editFreeUntil: {
    type: Date,
    default: null
  },
  githubRepo: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Site', SiteSchema, 'sites');