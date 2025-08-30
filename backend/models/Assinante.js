const mongoose = require('mongoose');

const AssinanteSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true },
  produtoId: { type: String, required: true },
  produtoNome: { type: String, required: true },
  ativo: { type: Boolean, default: true },
  valorPago: { type: Number, required: true },
  dataUltimoPagamento: { type: Date, required: true },
  totalPagamentos: { type: Number, default: 1 },
  afiliadoEmail: { type: String, required: true },
  comissao: { type: Number, default: 0 },
  dataCriacao: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Assinante', AssinanteSchema); 