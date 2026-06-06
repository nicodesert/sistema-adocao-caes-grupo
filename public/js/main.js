// ============================================
// JS — Base global (navbar, alertas, home, footer)
// ============================================

window.currentUser = null;

async function apiCall(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro');
    return data;
}

async function loadUser() {
    try {
        window.currentUser = await apiCall('/api/auth/me');
    } catch {
        window.currentUser = null;
    }
}

function buildNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let links = '';
    if (!window.currentUser) {
        links = `
            <li><a href="/" class="navbar-link">Início</a></li>
            <li><a href="/caes" class="navbar-link">Cães Disponíveis</a></li>
            <li><a href="/local" class="navbar-link">Local</a></li>
            <li><a href="/login" class="navbar-link">Login</a></li>
            <li><a href="/cadastro" class="btn btn-primary">Cadastro</a></li>`;
    } else if (window.currentUser.role === 'admin') {
        links = `
            <li><a href="/admin" class="navbar-link">Dashboard</a></li>
            <li><a href="/admin/caes" class="navbar-link">Cães</a></li>
            <li><a href="/admin/clientes" class="navbar-link">Clientes</a></li>
            <li><a href="/admin/adocoes" class="navbar-link">Adoções</a></li>
            <li><a href="/admin/local" class="navbar-link">Local</a></li>
            <li><a href="#" class="navbar-link">${window.currentUser.name}</a></li>
            <li><a href="#" class="navbar-link" onclick="logout()">Sair</a></li>`;
    } else {
        links = `
            <li><a href="/" class="navbar-link">Início</a></li>
            <li><a href="/caes" class="navbar-link">Cães Disponíveis</a></li>
            <li><a href="/minhas-adocoes" class="navbar-link">Minhas Adoções</a></li>
            <li><a href="/local" class="navbar-link">Local</a></li>
            <li><a href="#" class="navbar-link">${window.currentUser.name}</a></li>
            <li><a href="#" class="navbar-link" onclick="logout()">Sair</a></li>`;
    }

    const logoHref = window.currentUser?.role === 'admin' ? '/admin' : '/';

    navbar.innerHTML = `
        <div class="container">
            <a href="${logoHref}" class="navbar-logo">🐾 PETMEL ADOÇÕES</a>
            <button class="navbar-toggle" id="navbar-toggle" aria-label="Abrir menu">
                <span></span><span></span><span></span>
            </button>
            <ul class="navbar-menu" id="navbar-menu">${links}</ul>
        </div>`;

    // Hambúrguer
    const toggle = document.getElementById('navbar-toggle');
    const menu   = document.getElementById('navbar-menu');
    toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        toggle.classList.toggle('open', open);
        toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            menu.classList.remove('open');
            toggle.classList.remove('open');
        });
    });
}

// ── Footer dinâmico — preenche contato real do banco ─────────────────────────
async function loadFooter() {
    try {
        const data  = await apiCall('/api/place');
        const place = data.place;
        if (!place) return;

        // Preenche todos os footers que usam os IDs padrão
        const emailEl   = document.getElementById('footer-email');
        const phoneEl   = document.getElementById('footer-phone');
        const addressEl = document.getElementById('footer-address');
        const nameEl    = document.getElementById('footer-name');

        if (nameEl    && place.name)    nameEl.textContent    = '🐾 ' + place.name;
        if (emailEl   && place.email)   emailEl.textContent   = '📧 ' + place.email;
        if (phoneEl   && place.phone)   phoneEl.textContent   = '📱 ' + place.phone;
        if (addressEl && place.address) addressEl.textContent = '📍 ' + place.address;
    } catch {
        // silencioso — footer estático já serve como fallback
    }
}

async function logout() {
    await fetch('/api/auth/logout', { method: 'GET' });
    location.href = '/login';
}

function showAlert(message, type = 'success') {
    const container = document.getElementById('alert-container');
    if (!container) return;
    const div = document.createElement('div');
    div.className = `alert alert-${type}`;
    div.innerText = message;
    container.appendChild(div);
    setTimeout(() => div.remove(), 4000);
}

async function loadFeaturedDogs() {
    const container = document.getElementById('featured-dogs');
    if (!container) return;
    try {
        const dogs = await apiCall('/api/dogs');
        if (!dogs.length) {
            container.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:3rem 1rem">
                    <div style="font-size:3rem;margin-bottom:1rem">🐾</div>
                    <p style="color:var(--text-light)">Nenhum cão disponível no momento. Volte em breve!</p>
                </div>`;
            return;
        }
        container.innerHTML = dogs.slice(0, 6).map(dog => `
            <div class="card">
                <img class="card-image"
                     src="${dog.photo || ''}"
                     alt="${dog.name}"
                     onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                <div class="card-image" style="display:none;height:200px;background:#f1f5f9;align-items:center;justify-content:center;font-size:3rem;">🐕</div>
                <div class="card-content">
                    <h3 class="card-title">${dog.name}</h3>
                    <p class="card-text">${dog.age || ''}</p>
                    <a class="btn btn-primary" href="/caes/${dog.id}" style="margin-top:0.75rem;display:inline-block">
                        Ver detalhes
                    </a>
                </div>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = `<p class="text-center">Erro ao carregar cães.</p>`;
    }
}

function setupImagePreview(inputId, previewId) {
    const input   = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;
    input.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => { preview.src = e.target.result; preview.style.display = 'block'; };
        reader.readAsDataURL(file);
    });
}

window.appReady = (async () => {
    await loadUser();
    buildNavbar();
    loadFeaturedDogs();
    loadFooter();
})();
