const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  senha: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter no mínimo 6 caracteres']
  },
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  cpf: {
    type: String,
    required: [true, 'CPF é obrigatório'],
    trim: true
  },
  telefone: {
    type: String,
    required: [true, 'Telefone é obrigatório'],
    trim: true
  },
  tipo: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  tokens: {
    type: Number,
    default: 0
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  },
  ultimoLogin: {
    type: Date
  }
});

// Criptografar senha antes de salvar
UserSchema.pre('save', async function(next) {
  try {
    // Só criptografa se a senha foi modificada
    if (this.isModified('senha')) {
      console.log('Criptografando senha...');
      const salt = await bcrypt.genSalt(10);
      this.senha = await bcrypt.hash(this.senha, salt);
      console.log('Senha criptografada com sucesso');
    }
    next();
  } catch (error) {
    console.error('Erro ao criptografar senha:', error);
    next(error);
  }
});

// Método para comparar senha
UserSchema.methods.compararSenha = async function(senhaDigitada) {
  try {
    console.log('Comparando senhas...');
    const senhaCorreta = await bcrypt.compare(senhaDigitada, this.senha);
    console.log('Senha correta:', senhaCorreta);
    return senhaCorreta;
  } catch (error) {
    console.error('Erro ao comparar senhas:', error);
    throw error;
  }
};

// Método para criar usuário admin
UserSchema.statics.criarAdmin = async function(email, senha) {
  try {
    const admin = new this({
      email,
      senha,
      nome: 'Administrador',
      tipo: 'admin',
      tokens: 999999
    });
    await admin.save();
    return admin;
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    throw error;
  }
};

module.exports = mongoose.model('User', UserSchema); 