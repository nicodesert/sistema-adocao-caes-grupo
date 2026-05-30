// ============================================
// MIDDLEWARE DE AUTENTICAÇÃO
// Pessoa 3 é responsável por este arquivo
// ============================================
// Middleware = função que roda ANTES da rota
// Se o usuário não tem permissão, retorna erro JSON

// Verifica se o usuário está logado
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next(); // está logado, pode continuar
  }
  res.status(401).json({ error: 'Faça login para continuar.' });
}

// Verifica se é administrador
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next(); // é admin, pode continuar
  }
  res.status(403).json({ error: 'Acesso negado.' });
}

module.exports = { isAuthenticated, isAdmin };
