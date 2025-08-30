const axios = require('axios');

async function resetAdminPassword() {
  try {
    const response = await axios.put('http://localhost:3000/api/admin/reset-password');
    console.log('Resposta:', response.data);
  } catch (error) {
    console.error('Erro:', error.response ? error.response.data : error.message);
  }
}

resetAdminPassword(); 