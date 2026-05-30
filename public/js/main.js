// ============================================
// JAVASCRIPT COMPARTILHADO — Carrega em TODAS as páginas
// Pessoa 9 é responsável por este arquivo
// ============================================

// Variável global do usuário logado (null se não logado)
window.currentUser = null;

// Promise que resolve quando a navbar e o usuário estão prontos
window.appReady = (async function () {
  // Espera o DOM carregar se ainda não carregou
  if (document.readyState === 'loading') {
    await new Promise(r => document.addEventListener('DOMContentLoaded', r));
  }
  await loadUser();
  buildNav();
  loadFeaturedDogs();
})();

// --- Carrega dados do usuário logado ---
async function loadUser() {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      window.currentUser = await res.json();
    }
  } catch (e) {
    // Não logado, tudo bem
  }
}

// --- Monta a navbar dinamicamente ---
function buildNav() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const user = window.currentUser;
  let links = '';

  if (!user) {
    // Visitante (não logado)
    links = `
      <a href="/index.html">Início</a>
      <a href="/dogs.html">Cães Disponíveis</a>
      <a href="/place.html">Sobre o Local</a>
      <a href="/login.html" class="btn-nav">Login</a>
      <a href="/register.html" class="btn-nav">Cadastre-se</a>
    `;
  } else if (user.role === 'admin') {
    // Admin
    links = `
      <a href="/admin/index.html">Dashboard</a>
      <a href="/admin/dogs.html">Cães</a>
      <a href="/admin/clients.html">Clientes</a>
      <a href="/admin/adoptions.html">Adoções</a>
      <a href="/admin/place.html">Local</a>
      <span class="navbar-user">${user.name}</span>
      <a href="#" onclick="logout()" class="btn-nav">Sair</a>
    `;
  } else {
    // Usuário comum
    links = `
      <a href="/index.html">Início</a>
      <a href="/dogs.html">Cães Disponíveis</a>
      <a href="/my-adoptions.html">Minhas Adoções</a>
      <a href="/place.html">Sobre o Local</a>
      <span class="navbar-user">${user.name}</span>
      <a href="#" onclick="logout()" class="btn-nav">Sair</a>
    `;
  }

  nav.innerHTML = `
    <a href="/index.html" class="navbar-brand">🐾 Adote um Cão</a>
    <div class="navbar-links">${links}</div>
  `;
}

// --- Logout ---
async function logout() {
  await fetch('/api/auth/logout');
  window.location.href = '/login.html';
}

// --- Mostra alerta na tela ---
function showAlert(message, type) {
  // type: 'success' ou 'error'
  const container = document.getElementById('alert-container');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'alert alert-' + type;
  div.textContent = message;
  container.appendChild(div);

  // Remove após 4 segundos
  setTimeout(() => div.remove(), 4000);
}

// --- Helper para chamadas à API ---
async function apiCall(url, options) {
  options = options || {};
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erro desconhecido');
  }
  return data;
}

// --- Carrega cães em destaque na página inicial ---
function loadFeaturedDogs() {
  const container = document.getElementById('featured-dogs');
  if (!container) return;

  fetch('/api/dogs')
    .then(res => res.json())
    .then(dogs => {
      if (dogs.length === 0) {
        container.innerHTML = '<div class="empty-message"><span>🐕</span><p>Nenhum cão disponível no momento.</p></div>';
        return;
      }
      // Mostra os 6 primeiros
      const featured = dogs.slice(0, 6);
      container.innerHTML = featured.map(dog => `
        <div class="card">
          ${dog.photo
            ? '<img src="' + dog.photo + '" alt="' + dog.name + '" class="card-img">'
            : '<div class="card-placeholder">🐕</div>'}
          <div class="card-body">
            <h3>${dog.name}</h3>
            <p>Idade: ${dog.age}</p>
            <a href="/dog-detail.html?id=${dog.id}" class="btn btn-outline btn-sm">Ver Detalhes</a>
          </div>
        </div>
      `).join('');
    })
    .catch(() => {
      container.innerHTML = '<p class="text-center">Erro ao carregar cães.</p>';
    });
}

// --- Máscara de CPF ---
function maskCPF(input) {
  input.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 9) {
      v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (v.length > 6) {
      v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (v.length > 3) {
      v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    this.value = v;
  });
}

// --- Máscara de telefone ---
function maskPhone(input) {
  input.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 6) {
      v = v.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
    } else if (v.length > 2) {
      v = v.replace(/(\d{2})(\d{1,5})/, '($1) $2');
    } else if (v.length > 0) {
      v = v.replace(/(\d{1,2})/, '($1');
    }
    this.value = v;
  });
}

// --- Preview de imagem ao selecionar arquivo ---
function setupImagePreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!input || !preview) return;

  input.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      preview.style.display = 'none';
    }
  });
}
