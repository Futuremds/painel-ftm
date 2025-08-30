const axios = require('axios');

async function registrarAdmin() {
  try {
    const response = await axios.post('http://localhost:3000/api/registrar-admin');
    console.log('Resposta:', response.data);
  } catch (error) {
    console.error('Erro:', error.response ? error.response.data : error.message);
  }
}

registrarAdmin(); 