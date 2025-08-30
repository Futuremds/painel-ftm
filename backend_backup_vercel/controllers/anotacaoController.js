const Anotacao = require('../models/Anotacao');

exports.listar = async (req, res) => {
  try {
    const { afiliadoId } = req.query;
    const anotacoes = await Anotacao.find({ afiliadoId }).sort({ createdAt: -1 });
    res.json(anotacoes);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar anotações' });
  }
};

exports.criar = async (req, res) => {
  try {
    const { nome, conteudo, afiliadoId } = req.body;
    const anotacao = await Anotacao.create({ nome, conteudo, afiliadoId });
    res.status(201).json(anotacao);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar anotação' });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const { nome, conteudo } = req.body;
    const { id } = req.params;
    const anotacao = await Anotacao.findByIdAndUpdate(id, { nome, conteudo }, { new: true });
    res.json(anotacao);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar anotação' });
  }
};

exports.excluir = async (req, res) => {
  try {
    const { id } = req.params;
    await Anotacao.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir anotação' });
  }
}; 