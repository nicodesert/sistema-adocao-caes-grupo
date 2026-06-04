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

window.appReady.then(() => {
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) cpfInput.addEventListener('input', e => { e.target.value = formatCPF(e.target.value); });

    const phoneInput = document.getElementById('phone');
    if (phoneInput) phoneInput.addEventListener('input', e => { e.target.value = formatPhone(e.target.value); });

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
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
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                cpf: document.getElementById('cpf').value,
                address: document.getElementById('address').value,
                password: document.getElementById('password').value,
                confirmPassword: document.getElementById('confirm-password').value
            };
            try {
                await apiCall('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                showAlert('Cadastro realizado com sucesso');
                setTimeout(() => { location.href = '/login'; }, 1000);
            } catch (err) {
                showAlert(err.message, 'error');
            }
        });
    }
});
