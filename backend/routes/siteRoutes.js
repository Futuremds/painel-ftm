const express = require('express');
const router = express.Router();
const path = require('path');
const copiarEPreencherTemplate = require('../utils/copiarEPreencherTemplate');
const { ObjectId } = require('mongodb');
const Site = require('../models/Site');
const { deployToVercel } = require('../utils/deployToVercel');
const fs = require('fs-extra');
const { execSync } = require('child_process');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Middleware de autenticação igual ao server.js
const authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      req.user = { id: decoded.id, email: decoded.email, tipo: decoded.tipo };
      next();
    } catch (jwtError) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Erro de autenticação' });
  }
};

router.get('/sites/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { dominio } = req.query;

    // Verificar se o usuário está tentando acessar seus próprios sites
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado a acessar sites de outro usuário'
      });
    }

    if (dominio) {
      // Buscar site específico
      const site = await req.dbCollections.sitesCollection.findOne({
        user: new ObjectId(userId),
        nomeProjeto: dominio
      });

      if (!site) {
        return res.status(404).json({
          success: false,
          message: 'Site não encontrado'
        });
      }

      return res.json({
        success: true,
        site
      });
    } else {
      // Buscar todos os sites do usuário
      const sites = await req.dbCollections.sitesCollection
        .find({ user: new ObjectId(userId) })
        .sort({ dataCriacao: -1 })
        .toArray();

      return res.json({
        success: true,
        sites
      });
    }
  } catch (error) {
    console.error('Erro ao buscar sites:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Rota para buscar placeholders de um site já criado
router.get('/site-placeholders', authMiddleware, async (req, res) => {
  try {
    const { dominio } = req.query;
    const userId = req.user.id;

    if (!dominio) {
      return res.status(400).json({
        success: false,
        message: 'O parâmetro dominio é obrigatório'
      });
    }

    if (!req.dbCollections?.sitesCollection) {
      return res.status(500).json({
        success: false,
        message: 'Coleção do banco não disponível'
      });
    }

    const site = await req.dbCollections.sitesCollection.findOne({
      user: new ObjectId(userId),
      nomeProjeto: dominio
    });

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site não encontrado'
      });
    }

    res.json({
      success: true,
      placeholders: site.placeholders
    });
  } catch (error) {
    console.error('Erro ao buscar placeholders:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar placeholders',
      error: error.message
    });
  }
});

/**
 * @route POST /api/sites/generate
 * @desc Gera um novo site com base no template
 * @access Private
 */
router.post('/generate', authMiddleware, async (req, res) => {
  console.log('=== INÍCIO DO PROCESSO DE GERAÇÃO DE SITE ===');
  const { config } = req.body;
  const userId = req.user.id;

  console.log('Configuração recebida:', config);
  console.log('Domínio recebido:', config?.DOMINIO);

  try {
    // Validar configuração
    if (!config || !config.DOMINIO) {
      return res.status(400).json({
        success: false,
        message: 'Configuração inválida: DOMINIO é obrigatório'
      });
    }

    // Validar formato do domínio
    const dominioRegex = /^[a-z0-9-]+$/;
    if (!dominioRegex.test(config.DOMINIO)) {
      return res.status(400).json({
        success: false,
        message: 'O domínio deve conter apenas letras minúsculas, números e hífens'
      });
    }

    // Verificar tokens do usuário
    const user = await req.dbCollections.usersCollection.findOne({
      _id: new ObjectId(userId)
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (!user.tokens || user.tokens < 1) {
      return res.status(400).json({
        success: false,
        message: 'Tokens insuficientes para gerar o site'
      });
    }

    // Verificar site existente
    const siteExistente = await req.dbCollections.sitesCollection.findOne({
      user: new ObjectId(userId),
      nomeProjeto: config.DOMINIO
    });

    if (siteExistente) {
      return res.status(400).json({
        success: false,
        message: 'Este domínio já está em uso'
      });
    }

    // 1. Gerar o site
    console.log('Gerando site...');
    const templatePath = path.join(__dirname, '../template_site');
    const outputPath = path.join(__dirname, '../generated-sites', config.DOMINIO);

    // Limpar diretório se existir
    if (fs.existsSync(outputPath)) {
      await fs.remove(outputPath);
    }

    // Copiar e preencher template
    await copiarEPreencherTemplate(templatePath, outputPath, config);
    console.log('Site gerado em:', outputPath);

    // 2. Deploy na Netlify
    console.log('Iniciando deploy na Netlify...');
    console.log('Nome do site que será enviado para deploy:', config.DOMINIO);
    let netlifyResponse;
    try {
      netlifyResponse = await deployToVercel({
        siteName: config.DOMINIO,
        siteDir: outputPath
      });
      console.log('Deployment criado na Netlify:', netlifyResponse);

      // Verificar se o deploy foi bem-sucedido
      if (!netlifyResponse.success) {
        console.error('Erro no deploy:', netlifyResponse.error);

        // Se for rate limit, retornar erro específico
        if (netlifyResponse.error.includes('429') || netlifyResponse.error.includes('rate limit')) {
          return res.status(429).json({
            success: false,
            message: 'Limite de requisições da Netlify atingido. Tente novamente em alguns minutos.',
            error: 'RATE_LIMIT_EXCEEDED'
          });
        }

        throw new Error(`Erro no deploy: ${netlifyResponse.error}`);
      }

      // Aguardar o deploy ser concluído
      console.log('Aguardando deploy ser concluído...');
      await new Promise(resolve => setTimeout(resolve, 15000)); // Aguardar 15 segundos

    } catch (err) {
      console.error('Erro ao criar deployment na Netlify:', err.message);

      // Se for rate limit, retornar erro específico
      if (err.message.includes('429') || err.message.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          message: 'Limite de requisições da Netlify atingido. Tente novamente em alguns minutos.',
          error: 'RATE_LIMIT_EXCEEDED'
        });
      }

      throw err;
    }

    // 3. Atualizar tokens do usuário
    await req.dbCollections.usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { tokens: -1 } }
    );

    // 4. Salvar informações do site
    const siteUrl = `https://${config.DOMINIO}.painelftm.com.br`;
    const siteData = {
      user: getUserObjectId(userId),
      name: config.DOMINIO,
      nomeProjeto: config.DOMINIO,
      dominio: config.DOMINIO,
      url: siteUrl,
      config,
      dataCriacao: new Date(),
      status: 'active',
      netlifyDeploymentId: netlifyResponse.data.id,
      editFreeUntil: new Date(Date.now() + 60 * 60 * 1000) // 1 hora grátis para edição
    };

    await req.dbCollections.sitesCollection.insertOne(siteData);

    // 5. Não limpar arquivos temporários automaticamente
    // Os arquivos ficarão disponíveis para debug e podem ser limpos manualmente depois
    console.log('Arquivos temporários mantidos em:', outputPath);

    res.json({
      success: true,
      message: 'Site gerado com sucesso',
      url: siteUrl,
      remainingTokens: user.tokens - 1,
      siteData
    });
  } catch (error) {
    console.error('Erro ao gerar site:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar site',
      error: error.message
    });
  }
});

// @route   GET api/sites
// @desc    Get all sites
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('ID do usuário na requisição:', req.user.id);
    const sites = await Site.find({ user: new ObjectId(req.user.id) });
    console.log('Sites retornados:', sites);
    res.json({ success: true, sites });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// @route   POST api/sites
// @desc    Create a site
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      console.log('[CRIAR SITE] Nome (Domínio) obrigatório não informado');
      return res.status(400).json({ error: 'Nome (Domínio) obrigatório' });
    }
    // Verificar saldo de tokens do usuário
    const user = await req.dbCollections.usersCollection.findOne({ _id: new ObjectId(req.user.id) });
    if (!user || !user.tokens || user.tokens < 1) {
      console.log('[CRIAR SITE] Tokens insuficientes para usuário', req.user.id);
      return res.status(400).json({ success: false, message: 'Tokens insuficientes para criar o site' });
    }
    const now = new Date();
    const editFreeUntil = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora grátis
    console.log(`[CRIAR SITE] Criando site para usuário ${req.user.id} com domínio '${name}'. editFreeUntil: ${editFreeUntil.toISOString()}`);
    const newSite = new Site({
      name,
      user: getUserObjectId(req.user.id),
      editFreeUntil
    });
    const site = await newSite.save();
    console.log(`[CRIAR SITE] Site criado: ${site._id} | editFreeUntil: ${site.editFreeUntil}`);
    res.json({ success: true, site });
  } catch (err) {
    console.error('[CRIAR SITE] Erro:', err.message);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

// @route   GET api/sites/:id
// @desc    Get site by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const site = await Site.findOne({ _id: req.params.id, user: req.user.id });
    if (!site) {
      return res.status(404).json({ success: false, message: 'Site não encontrado' });
    }
    res.json({ success: true, site });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// @route   PUT api/sites/:id
// @desc    Update site
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, config } = req.body;
    const site = await Site.findOne({ _id: req.params.id, user: req.user.id });

    if (!site) {
      console.log(`[EDITAR SITE] Site não encontrado: ${req.params.id} para usuário ${req.user.id}`);
      return res.status(404).json({ success: false, message: 'Site não encontrado' });
    }

    const now = new Date();
    let cobrouToken = false;

    console.log(`[EDITAR SITE] Início edição do site ${site._id} | editFreeUntil atual: ${site.editFreeUntil}`);

    // Verificar se precisa cobrar token
    if (!site.editFreeUntil || site.editFreeUntil < now) {
      const user = await req.dbCollections.usersCollection.findOne({ _id: new ObjectId(req.user.id) });
      if (!user || !user.tokens || user.tokens < 1) {
        console.log(`[EDITAR SITE] Tokens insuficientes para usuário ${req.user.id}`);
        return res.status(400).json({ success: false, message: 'Tokens insuficientes para editar o site' });
      }

      const updateResult = await req.dbCollections.usersCollection.updateOne(
        { _id: new ObjectId(req.user.id) },
        { $inc: { tokens: -1 } }
      );

      console.log(`[EDITAR SITE] Token cobrado do usuário ${req.user.id}. Resultado:`, updateResult);
      site.editFreeUntil = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora grátis
      cobrouToken = true;
    } else {
      console.log(`[EDITAR SITE] Edição gratuita permitida para o site ${site._id}`);
    }

    // Atualizar dados do site (sem alterar o status)
    site.name = name ?? site.name;
    site.description = description ?? site.description;
    site.config = config ?? site.config;

    await site.save();
    console.log(`[EDITAR SITE] Site ${site._id} salvo com sucesso`);

    // === NOVO FLUXO: Atualizar arquivos e fazer deploy na Netlify ===
    if (config) {
      console.log('[EDITAR SITE] Iniciando atualização dos arquivos e deploy...');

      try {
        // 1. Gerar novos arquivos com as configurações atualizadas
        const templatePath = path.join(__dirname, '../template_site');
        const generatedPath = path.join(__dirname, '../generated-sites', site.name);

        console.log('[EDITAR SITE] Atualizando arquivos do template...');
        await copiarEPreencherTemplate(templatePath, generatedPath, config);
        console.log(`[EDITAR SITE] Arquivos atualizados em: ${generatedPath}`);

        // 2. Fazer deploy na Netlify
        console.log('[EDITAR SITE] Fazendo deploy na Netlify...');
        const deployResult = await deployToVercel({
          siteName: site.name,
          siteDir: generatedPath
        });

        if (deployResult.success) {
          console.log('[EDITAR SITE] ✅ Deploy realizado com sucesso!');
          console.log('[EDITAR SITE] URL do site:', deployResult.data.url);

          // 3. Atualizar URL do site no banco
          site.url = deployResult.data.url;
          site.netlifyDeploymentId = deployResult.data.id;
          await site.save();

          console.log('[EDITAR SITE] ✅ Site atualizado no banco de dados');
        } else {
          console.error('[EDITAR SITE] ❌ Erro no deploy:', deployResult.error);
          return res.status(500).json({
            success: false,
            message: 'Erro ao fazer deploy do site atualizado',
            error: deployResult.error
          });
        }

      } catch (deployErr) {
        console.error('[EDITAR SITE] ❌ Erro ao atualizar/deployar site:', deployErr);
        return res.status(500).json({
          success: false,
          message: 'Erro ao atualizar site',
          error: deployErr.message
        });
      }
    }

    // Buscar usuário atualizado para retornar tokens restantes
    const user = await req.dbCollections.usersCollection.findOne({ _id: new ObjectId(req.user.id) });

    res.json({
      success: true,
      site,
      cobrouToken,
      remainingTokens: user.tokens,
      message: 'Site atualizado com sucesso!'
    });

  } catch (err) {
    console.error('[EDITAR SITE] ❌ Erro:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      error: err.message
    });
  }
});

// @route   DELETE api/sites/:id
// @desc    Delete site
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const site = await Site.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!site) {
      return res.status(404).json({ success: false, message: 'Site não encontrado' });
    }
    res.json({ success: true, message: 'Site removido' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Ao criar site, sempre converter user para ObjectId
const getUserObjectId = (userId) => {
  if (!userId) return undefined;
  try {
    return typeof userId === 'string' ? new ObjectId(userId) : userId;
  } catch {
    return undefined;
  }
};

module.exports = router;
