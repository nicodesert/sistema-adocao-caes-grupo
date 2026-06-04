window.currentUser = null;

async function apiCall(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Erro');
    }
    return data;
}

async function loadUser() {
    try {
        const data = await apiCall('/api/auth/me');
        window.currentUser = data;
    } catch {
        window.currentUser = null;
    }
}

function buildNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    if (!window.currentUser) {
        navbar.innerHTML = `
        <div class="container">
            <a href="/" class="navbar-logo">🐾 PETMEL ADOÇÕES</a>
            <ul class="navbar-menu">
                <li><a href="/" class="navbar-link">Início</a></li>
                <li><a href="/caes" class="navbar-link">Cães Disponíveis</a></li>
                <li><a href="/local" class="navbar-link">Local</a></li>
                <li><a href="/login" class="navbar-link">Login</a></li>
                <li><a href="/cadastro" class="btn btn-primary">Cadastro</a></li>
            </ul>
        </div>`;
    } else if (window.currentUser.role === 'admin') {
        navbar.innerHTML = `
        <div class="container">
            <a href="/admin" class="navbar-logo">🐾 PETMEL ADOÇÕES</a>
            <ul class="navbar-menu">
                <li><a href="/admin" class="navbar-link">Dashboard</a></li>
                <li><a href="/admin/caes" class="navbar-link">Cães</a></li>
                <li><a href="/admin/clientes" class="navbar-link">Clientes</a></li>
                <li><a href="/admin/adocoes" class="navbar-link">Adoções</a></li>
                <li><a href="/admin/local" class="navbar-link">Local</a></li>
                <li><a href="#" class="navbar-link">${window.currentUser.name}</a></li>
                <li><a href="#" class="navbar-link" onclick="logout()">Sair</a></li>
            </ul>
        </div>`;
    } else {
        navbar.innerHTML = `
        <div class="container">
            <a href="/" class="navbar-logo">🐾 PETMEL ADOÇÕES</a>
            <ul class="navbar-menu">
                <li><a href="/" class="navbar-link">Início</a></li>
                <li><a href="/caes" class="navbar-link">Cães Disponíveis</a></li>
                <li><a href="/minhas-adocoes" class="navbar-link">Minhas Adoções</a></li>
                <li><a href="/local" class="navbar-link">Local</a></li>
                <li><a href="#" class="navbar-link">${window.currentUser.name}</a></li>
                <li><a href="#" class="navbar-link" onclick="logout()">Sair</a></li>
            </ul>
        </div>`;
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
        container.innerHTML = dogs.slice(0, 6).map(dog => `
            <div class="card">
                <img class="card-image" src="${dog.photo || '/img/no-image.png'}" alt="${dog.name}">
                <div class="card-content">
                    <h3 class="card-title">${dog.name}</h3>
                    <p class="card-text">${dog.age || ''}</p>
                    <a class="btn btn-primary" href="/caes/${dog.id}">
                        Ver detalhes
                    </a>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
    }
}

function setupImagePreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;
    input.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });
}

window.appReady = (async () => {
    await loadUser();
    buildNavbar();
    loadFeaturedDogs();
})();
