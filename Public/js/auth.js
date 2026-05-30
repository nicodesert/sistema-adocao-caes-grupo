window.appReady.then(() => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                await apiCall('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                location.href = '/index.html';
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
                password: document.getElementById('password').value
            };
            try {
                await apiCall('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                showAlert('Cadastro realizado com sucesso');
                setTimeout(() => { location.href = '/login.html'; }, 1000);
            } catch (err) {
                showAlert(err.message, 'error');
            }
        });
    }
});
