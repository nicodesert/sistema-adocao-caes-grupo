// ============================================
// MIDDLEWARE DE AUTENTICAÇÃO
// Pessoa 3 é responsável por este arquivo
// ============================================

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ error: 'Faça login para continuar.' });
}

function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Acesso negado.' });
}

module.exports = { isAuthenticated, isAdmin };
