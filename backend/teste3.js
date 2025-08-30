const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Servidor rodando com sucesso!');
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Servidor teste rodando na porta 3000');
});
