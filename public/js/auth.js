// ============================================
// JS — Autenticação (login e cadastro)
// ============================================

const MIN_PASSWORD = 8; // mínimo de caracteres para a senha

function formatCPF(value) {
    return value.replace(/\D/g, '').slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatPhone(value) {
    return value.replace(/\D/g, '').slice(0, 11)
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
}

// Mostra/esconde indicador de força de senha abaixo do campo
function setupPasswordStrength(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    // Cria o indicador
    const wrapper = document.createElement('div');
    wrapper.id = inputId + '-strength';
    wrapper.style.cssText = 'margin-top:6px;font-size:0.8rem;font-weight:500;transition:color 0.2s';
    input.insertAdjacentElement('afterend', wrapper);

    input.addEventListener('input', () => {
        const val = input.value;
        if (!val) { wrapper.textContent = ''; return; }

        if (val.length < MIN_PASSWORD) {
            wrapper.style.color = '#dc2626';
            wrapper.textContent = `⚠ Mínimo ${MIN_PASSWORD} caracteres (${MIN_PASSWORD - val.length} faltando)`;
        } else if (val.length < 12) {
            wrapper.style.color = '#d97706';
            wrapper.textContent = '● Senha fraca — tente adicionar números e símbolos';
        } else {
            wrapper.style.color = '#16a34a';
            wrapper.textContent = '✔ Senha forte';
        }
    });
}

window.appReady.then(() => {
    // Formatação automática
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) cpfInput.addEventListener('input', e => { e.target.value = formatCPF(e.target.value); });

    const phoneInput = document.getElementById('phone');
    if (phoneInput) phoneInput.addEventListener('input', e => { e.target.value = formatPhone(e.target.value); });

    // Indicador de senha no cadastro
    setupPasswordStrength('password');

    // ── LOGIN ────────────────────────────────────────────────────
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Entrando...';

            const email    = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            try {
                const loginData = await apiCall('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                location.href = loginData.user && loginData.user.role === 'admin' ? '/admin' : '/';
            } catch (err) {
                showAlert(err.message, 'error');
                btn.disabled = false;
                btn.textContent = 'Entrar';
            }
        });
    }

    // ── CADASTRO ─────────────────────────────────────────────────
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = registerForm.querySelector('button[type="submit"]');

            const password        = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Validações client-side
            if (password.length < MIN_PASSWORD) {
                showAlert(`A senha deve ter pelo menos ${MIN_PASSWORD} caracteres.`, 'error');
                return;
            }
            if (password !== confirmPassword) {
                showAlert('As senhas não coincidem.', 'error');
                return;
            }

            btn.disabled = true;
            btn.textContent = 'Criando conta...';

            const formData = {
                name:            document.getElementById('name').value.trim(),
                email:           document.getElementById('email').value.trim(),
                phone:           document.getElementById('phone').value,
                cpf:             document.getElementById('cpf').value,
                address:         document.getElementById('address').value.trim(),
                password,
                confirmPassword
            };

            try {
                await apiCall('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                showAlert('Cadastro realizado com sucesso!');
                setTimeout(() => { location.href = '/login'; }, 1200);
            } catch (err) {
                showAlert(err.message, 'error');
                btn.disabled = false;
                btn.textContent = 'Criar conta';
            }
        });
    }
});
