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
        <nav class="navbar">
            <a href="/index.html">Início</a>
            <ul class="navbar-links">
                <li><a href="/dogs.html">Cães</a></li>
                <li><a href="/place.html">Local</a></li>
                <li><a href="/login.html">Login</a></li>
                <li><a href="/register.html">Cadastro</a></li>
            </ul>
        </nav>`;
    } else {
        navbar.innerHTML = `
        <nav class="navbar">
            <a href="/index.html">Abrigo</a>
            <ul class="navbar-links">
                <li><a href="/dogs.html">Cães</a></li>
                <li><a href="/my-adoptions.html">Minhas Adoções</a></li>
                <li><a href="#">${window.currentUser.name}</a></li>
                <li><a href="#" onclick="logout()">Sair</a></li>
            </ul>
        </nav>`;
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
                <img class="card-img" src="${dog.photo || '/img/no-image.png'}">
                <div class="card-content">
                    <h3>${dog.name}</h3>
                    <p>${dog.age}</p>
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

window.appReady = (async () => {
    await loadUser();
    buildNavbar();
    loadFeaturedDogs();
})();
