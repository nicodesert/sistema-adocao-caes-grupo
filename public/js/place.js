window.appReady.then(async () => {
    await loadPlaceInfo();

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

async function loadPlaceInfo() {
    const container = document.getElementById('place-info');
    if (!container) return;
    try {
        const data = await apiCall('/api/place');
        const place = data.place;
        const photos = data.photos || [];

        if (!place) {
            container.innerHTML = '<p class="text-center">Informações do local não disponíveis.</p>';
            return;
        }

        const socialLinks = [];
        if (place.facebook) socialLinks.push(`<a href="${place.facebook}" target="_blank" rel="noopener">📘 Facebook</a>`);
        if (place.instagram) socialLinks.push(`<a href="${place.instagram}" target="_blank" rel="noopener">📸 Instagram</a>`);
        if (place.whatsapp) socialLinks.push(`<a href="https://wa.me/${place.whatsapp.replace(/\D/g,'')}" target="_blank" rel="noopener">💬 WhatsApp</a>`);

        container.innerHTML = `
            <h1 class="section-title">${place.name || 'PETMEL ADOÇÕES'}</h1>
            <p style="font-size:1.1rem;margin:1rem 0 2rem;">${place.description || ''}</p>
            <div style="display:flex;flex-wrap:wrap;gap:2rem;">
                <div>
                    <h3>📍 Endereço</h3>
                    <p>${place.address || 'Não informado'}</p>
                </div>
                <div>
                    <h3>📱 Telefone</h3>
                    <p>${place.phone || 'Não informado'}</p>
                </div>
                <div>
                    <h3>📧 E-mail</h3>
                    <p>${place.email || 'Não informado'}</p>
                </div>
                ${socialLinks.length ? `<div><h3>🔗 Redes sociais</h3><p>${socialLinks.join(' &nbsp; ')}</p></div>` : ''}
            </div>
        `;

        // Gallery
        if (photos.length > 0) {
            const gallerySection = document.getElementById('gallery-section');
            if (gallerySection) gallerySection.style.display = '';
            const galleryContainer = document.getElementById('place-gallery');
            if (galleryContainer) {
                galleryContainer.innerHTML = photos.map(p => `
                    <div class="card">
                        <img class="card-image" src="${p.photo}" alt="${p.caption || 'Foto do local'}">
                        ${p.caption ? `<div class="card-content"><p class="card-text">${p.caption}</p></div>` : ''}
                    </div>
                `).join('');
            }
        }
    } catch (err) {
        if (container) container.innerHTML = '<p class="text-center">Erro ao carregar informações do local.</p>';
    }
}

