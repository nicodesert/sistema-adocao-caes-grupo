window.appReady.then(() => {
    const hostForm = document.getElementById('host-form');
    if (!hostForm) return;

    hostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = hostForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Enviando...';

        try {
            await apiCall('/api/place/host', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    address: document.getElementById('address').value,
                    housing: document.getElementById('housing').value,
                    hasYard: document.getElementById('has-yard').value,
                    experience: document.getElementById('experience').value,
                })
            });
            showAlert('Solicitação enviada com sucesso! Entraremos em contato em breve.');
            hostForm.reset();
        } catch (err) {
            showAlert(err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Enviar solicitação';
        }
    });
});
