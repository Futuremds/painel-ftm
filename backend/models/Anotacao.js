const mongoose = require('mongoose');

const AnotacaoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  conteudo: { type: String, default: '' },
  afiliadoId: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Anotacao', AnotacaoSchema); 