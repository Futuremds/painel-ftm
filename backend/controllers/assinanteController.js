const Assinante = require('../models/Assinante');

exports.registrarOuAtualizar = async ({ nome, email, produtoId, produtoNome, valorPago, afiliadoEmail, dataPagamento, comissao }) => {
  let assinante = await Assinante.findOne({ email, produtoId });
  if (assinante) {
    assinante.ativo = true;
    assinante.valorPago = valorPago;
    assinante.dataUltimoPagamento = dataPagamento;
    assinante.totalPagamentos += 1;
    if (comissao !== undefined) assinante.comissao = comissao;
    await assinante.save();
  } else {
    assinante = await Assinante.create({
      nome,
      email,
      produtoId,
      produtoNome,
      valorPago,
      dataUltimoPagamento: dataPagamento,
      totalPagamentos: 1,
      afiliadoEmail,
      ativo: true,
      comissao,
    });
  }
  return assinante;
};

exports.listarPorAfiliado = async (req, res) => {
  try {
    const { afiliadoEmail, produtoId } = req.query;
    const filtro = { afiliadoEmail };
    if (produtoId) filtro.produtoId = produtoId;
    const assinantes = await Assinante.find(filtro).sort({ dataUltimoPagamento: -1 });
    res.json(assinantes);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar assinantes' });
  }
}; 