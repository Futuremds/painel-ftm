import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  
  // Verifica se existe token JWT e se o usuário tem os dados necessários
  if (!token || !user.id || !user.email || !user.tipo) {
    console.log('Redirecionando para login - Dados de autenticação inválidos:', { 
      tokenJWT: !!token, 
      userId: !!user.id, 
      email: !!user.email, 
      tipo: !!user.tipo
    });
    // Limpa dados inválidos
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  // Se for rota de admin, verifica se o usuário é admin
  if (isAdminRoute && user.tipo !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Se chegou aqui, está autenticado
  console.log('Usuário autenticado:', {
    email: user.email,
    tipo: user.tipo,
    tokens: user.tokens || 0
  });
  return children;
};

export default PrivateRoute; 