// ============================================
// JAVASCRIPT — Login e Cadastro
// Pessoa 9 é responsável por este arquivo
// ============================================

window.appReady.then(() => {
  // Se já está logado, redireciona
  if (window.currentUser) {
    if (window.currentUser.role === 'admin') {
      window.location.href = '/admin/index.html';
    } else {
      window.location.href = '/index.html';
    }
    return;
  }

  // --- Formulário de Login ---
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const data = await apiCall('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        // Redireciona após login
        if (data.user.role === 'admin') {
          window.location.href = '/admin/index.html';
        } else {
          window.location.href = '/index.html';
        }
      } catch (err) {
        showAlert(err.message, 'error');
      }
    });
  }

  // --- Formulário de Cadastro ---
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    // Aplica máscaras nos inputs
    const cpfInput = document.getElementById('cpf');
    const phoneInput = document.getElementById('phone');
    if (cpfInput) maskCPF(cpfInput);
    if (phoneInput) maskPhone(phoneInput);

    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        cpf: document.getElementById('cpf').value,
        address: document.getElementById('address').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
      };

      try {
        const data = await apiCall('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        showAlert(data.message, 'success');
        // Redireciona para login após 1 segundo
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 1000);
      } catch (err) {
        showAlert(err.message, 'error');
      }
    });
  }
});
