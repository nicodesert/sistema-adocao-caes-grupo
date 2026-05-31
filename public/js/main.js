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
            <a href="/index.html" class="navbar-logo">🐾 Lar Canino</a>
            <ul class="navbar-menu">
                <li><a href="/dogs.html" class="navbar-link">Cães</a></li>
                <li><a href="/place.html" class="navbar-link">Acolhedor</a></li>
                <li><a href="/login.html" class="navbar-link">Login</a></li>
                <li><a href="/register.html" class="btn btn-primary">Cadastro</a></li>
            </ul>
        </div>`;
    } else {
        const adminLink = window.currentUser.role === 'admin'
            ? `<li><a href="/admin/index.html" class="navbar-link">Admin</a></li>` : '';
        navbar.innerHTML = `
        <div class="container">
            <a href="/index.html" class="navbar-logo">🐾 Lar Canino</a>
            <ul class="navbar-menu">
                <li><a href="/dogs.html" class="navbar-link">Cães</a></li>
                <li><a href="/my-adoptions.html" class="navbar-link">Minhas Adoções</a></li>
                ${adminLink}
                <li><a href="#" class="navbar-link">${window.currentUser.name}</a></li>
                <li><a href="#" class="navbar-link" onclick="logout()">Sair</a></li>
            </ul>
        </div>`;
    }
}

async function logout() {
    await fetch('/api/auth/logout', { method: 'GET' });
    location.href = '/login.html';
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
                    <a class="btn btn-primary" href="/dog-detail.html?id=${dog.id}">
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
