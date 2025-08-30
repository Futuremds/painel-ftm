const fs = require('fs');
const path = require('path');
const { PurgeCSS } = require('purgecss');
const postcss = require('postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');

async function optimizeCSS() {
  try {
    // Diretório do template
    const templateDir = path.resolve(__dirname, '../backend/templates/template1');
    const cssDir = path.join(templateDir, 'css');
    
    console.log('📂 Diretório do template:', templateDir);
    console.log('📂 Diretório CSS:', cssDir);

    // Criar diretório otimizado se não existir
    const optimizedDir = path.join(cssDir, 'optimized');
    if (!fs.existsSync(optimizedDir)) {
      fs.mkdirSync(optimizedDir, { recursive: true });
    }

    // Encontrar todos os arquivos CSS
    const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
    console.log('📄 Arquivos CSS encontrados:', cssFiles);

    // Encontrar todos os arquivos HTML
    const htmlFiles = [];
    function findHtmlFiles(dir) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          findHtmlFiles(filePath);
        } else if (file.endsWith('.html')) {
          htmlFiles.push(filePath);
        }
      });
    }
    findHtmlFiles(templateDir);
    console.log('📄 Arquivos HTML encontrados:', htmlFiles);

    for (const cssFile of cssFiles) {
      console.log(`\n🔄 Processando ${cssFile}...`);
      
      const cssPath = path.join(cssDir, cssFile);
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      console.log(`📊 Tamanho original: ${(cssContent.length / 1024).toFixed(2)}KB`);

      // 1. Remover CSS não utilizado com PurgeCSS
      console.log('🧹 Removendo CSS não utilizado...');
      const purgeCSSResult = await new PurgeCSS().purge({
        content: htmlFiles,
        css: [{ raw: cssContent }],
        safelist: {
          standard: [/^elementor-/],
          deep: [/^elementor-/],
          greedy: [/^elementor-/]
        }
      });

      if (!purgeCSSResult[0]?.css) {
        console.error('❌ Erro: PurgeCSS não retornou CSS válido');
        continue;
      }

      // 2. Otimizar com PostCSS
      console.log('✨ Otimizando com PostCSS...');
      const optimizedCSS = await postcss([
        autoprefixer,
        cssnano({
          preset: ['default', {
            discardComments: { removeAll: true },
            normalizeWhitespace: true
          }]
        })
      ]).process(purgeCSSResult[0].css, {
        from: undefined
      });

      console.log(`📊 Tamanho após otimização: ${(optimizedCSS.css.length / 1024).toFixed(2)}KB`);

      // 3. Dividir em arquivos menores
      console.log('📦 Dividindo em chunks...');
      const chunks = splitCSS(optimizedCSS.css);
      console.log(`📊 Número de chunks: ${chunks.length}`);

      // Salvar chunks
      chunks.forEach((chunk, index) => {
        const chunkName = `${path.parse(cssFile).name}.chunk${index + 1}.css`;
        const chunkPath = path.join(optimizedDir, chunkName);
        fs.writeFileSync(chunkPath, chunk);
        console.log(`💾 Chunk ${index + 1} salvo: ${chunkName} (${(chunk.length / 1024).toFixed(2)}KB)`);
      });

      // Criar arquivo de manifesto
      const manifest = chunks.map((_, index) => ({
        chunk: `chunk${index + 1}`,
        file: `${path.parse(cssFile).name}.chunk${index + 1}.css`
      }));

      fs.writeFileSync(
        path.join(optimizedDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
      );
      console.log('📝 Manifesto criado');
    }

    console.log('\n✅ CSS otimizado com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro durante a otimização:', error);
  }
}

// Função para dividir CSS em chunks menores
function splitCSS(css, maxSize = 500000) { // 500KB por chunk
  const rules = css.split('}').filter(Boolean);
  const chunks = [];
  let currentChunk = '';

  for (const rule of rules) {
    const ruleWithBrace = rule + '}';
    if ((currentChunk + ruleWithBrace).length > maxSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = ruleWithBrace;
    } else {
      currentChunk += ruleWithBrace;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

// Executar otimização
optimizeCSS(); 