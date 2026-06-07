// ============================================
// JS — Cães (listagem, detalhe, adoção, minhas adoções)
// ============================================

const DOGS_PER_PAGE = 9;
let currentPage  = 1;
let allDogs      = [];  // todos os cães carregados da API
let filteredDogs = [];  // resultado após busca

window.appReady.then(() => {
    loadDogs();
    loadDogDetail();
    loadMyAdoptions();
    setupPublicSearch();
});

// ── BUSCA PÚBLICA ─────────────────────────────────────────────────────────────

function setupPublicSearch() {
    const input = document.getElementById('search-input');
    const clear = document.getElementById('search-clear');
    if (!input) return;

    input.addEventListener('input', () => {
        clear.style.display = input.value ? 'block' : 'none';
        currentPage = 1;
        applyPublicSearch();
    });

    clear.addEventListener('click', () => {
        input.value = '';
        clear.style.display = 'none';
        currentPage = 1;
        applyPublicSearch();
    });
}

function applyPublicSearch() {
    const term  = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
    const count = document.getElementById('search-count');

    filteredDogs = term
        ? allDogs.filter(d =>
            d.name.toLowerCase().includes(term) ||
            (d.age       || '').toLowerCase().includes(term) ||
            (d.condition || '').toLowerCase().includes(term) ||
            (d.description || '').toLowerCase().includes(term)
          )
        : [...allDogs];

    if (count) {
        if (term) {
            count.style.display = 'block';
            count.textContent = filteredDogs.length === 0
                ? `Nenhum cão encontrado para "${term}"`
                : `${filteredDogs.length} cão${filteredDogs.length > 1 ? 'es' : ''} encontrado${filteredDogs.length > 1 ? 's' : ''} para "${term}"`;
        } else {
            count.style.display = 'none';
        }
    }

    renderPage(1);
}

// ── LISTAGEM COM PAGINAÇÃO ────────────────────────────────────────────────────

async function loadDogs() {
    const container = document.getElementById('dogs-list');
    if (!container) return;

    try {
        allDogs      = await apiCall('/api/dogs');
        filteredDogs = [...allDogs];
    } catch (err) {
        container.innerHTML = `<p class="text-center">Erro ao carregar cães. Tente novamente.</p>`;
        return;
    }

    if (!allDogs.length) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;text-align:center;padding:3rem 1rem">
                <div style="font-size:3.5rem;margin-bottom:1rem">🐾</div>
                <h3 style="margin-bottom:0.5rem;color:var(--secondary)">Nenhum cão disponível no momento</h3>
                <p style="color:var(--gray-600)">Novos cães chegam em breve. Volte mais tarde!</p>
            </div>`;
        return;
    }

    renderPage(1);
}

function renderPage(page) {
    currentPage = page;
    const container = document.getElementById('dogs-list');
    if (!container) return;

    // Empty state da busca
    if (!filteredDogs.length) {
        container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:3rem 1rem">
                <div style="font-size:3rem;margin-bottom:1rem">🔍</div>
                <p style="color:var(--gray-600)">Nenhum cão corresponde à sua busca.</p>
            </div>`;
        removePagination();
        return;
    }

    const totalPages = Math.ceil(filteredDogs.length / DOGS_PER_PAGE);
    const start      = (page - 1) * DOGS_PER_PAGE;
    const pageDogs   = filteredDogs.slice(start, start + DOGS_PER_PAGE);

    container.innerHTML = pageDogs.map(dog => `
        <article class="card">
            <img class="card-img"
                 src="${dog.photo || ''}"
                 alt="${dog.name}"
                 onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <div class="card-img-placeholder" style="display:none;height:280px;background:#f1f5f9;align-items:center;justify-content:center;font-size:4rem;">🐕</div>
            <div class="card-content">
                <h3 class="card-title">${dog.name}</h3>
                <p class="card-text">
                    ${dog.age       ? `<strong>Idade:</strong> ${dog.age}<br>` : ''}
                    ${dog.condition ? `<strong>Condição:</strong> ${dog.condition}` : ''}
                </p>
                <a class="btn btn-primary mt-2" href="/caes/${dog.id}">Ver detalhes</a>
            </div>
        </article>
    `).join('');

    renderPagination(page, totalPages);
}

function renderPagination(page, totalPages) {
    removePagination();
    if (totalPages <= 1) return;

    const container = document.getElementById('dogs-list');
    const nav = document.createElement('nav');
    nav.id = 'pagination';
    nav.setAttribute('aria-label', 'Paginação');
    nav.style.cssText = 'grid-column:1/-1;display:flex;justify-content:center;align-items:center;gap:8px;margin-top:1rem;flex-wrap:wrap';

    const btnStyle = (active) =>
        `padding:8px 14px;border-radius:6px;border:2px solid var(--primary);font-weight:600;cursor:pointer;transition:all 0.2s;font-size:0.875rem;background:${active ? 'var(--primary)' : 'transparent'};color:${active ? '#fff' : 'var(--primary)'};`;

    const prev = document.createElement('button');
    prev.textContent = '← Anterior';
    prev.style.cssText = btnStyle(false);
    if (page === 1) prev.style.opacity = '0.4';
    prev.disabled = page === 1;
    prev.addEventListener('click', () => { renderPage(currentPage - 1); window.scrollTo(0, 0); });
    nav.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.style.cssText = btnStyle(i === page);
        btn.setAttribute('aria-current', i === page ? 'page' : undefined);
        btn.addEventListener('click', () => { renderPage(i); window.scrollTo(0, 0); });
        nav.appendChild(btn);
    }

    const next = document.createElement('button');
    next.textContent = 'Próximo →';
    next.style.cssText = btnStyle(false);
    if (page === totalPages) next.style.opacity = '0.4';
    next.disabled = page === totalPages;
    next.addEventListener('click', () => { renderPage(currentPage + 1); window.scrollTo(0, 0); });
    nav.appendChild(next);

    container.insertAdjacentElement('afterend', nav);
}

function removePagination() {
    const old = document.getElementById('pagination');
    if (old) old.remove();
}

// ── DETALHE DO CÃO ────────────────────────────────────────────────────────────

async function loadDogDetail() {
    const container = document.getElementById('dog-detail');
    if (!container) return;

    const segments = location.pathname.split('/').filter(Boolean);
    const id = segments[segments.length - 1] || new URLSearchParams(location.search).get('id');

    let dog;
    try {
        dog = await apiCall(`/api/dogs/${id}`);
    } catch (err) {
        container.innerHTML = `<p class="text-center">Cão não encontrado.</p>`;
        return;
    }

    let actionHtml;
    if (!dog.available) {
        actionHtml = `<span class="badge badge-unavailable">Já adotado 🏠</span>`;
    } else if (!window.currentUser) {
        actionHtml = `<a class="btn btn-outline" href="/login">Faça login para adotar</a>`;
    } else {
        actionHtml = `<button class="btn btn-primary" onclick="requestAdopt(${dog.id})">🐾 Quero Adotar</button>`;
    }

    container.innerHTML = `
        <div class="dog-info-grid">
            <div class="dog-image">
                <img src="${dog.photo || ''}" alt="${dog.name}" class="dog-info-img"
                     onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                <div style="display:none;height:360px;background:#f1f5f9;align-items:center;justify-content:center;font-size:5rem;border-radius:12px">🐕</div>
            </div>
            <div class="dog-details">
                <h1>${dog.name}</h1>
                <div class="dog-tags">
                    ${dog.age       ? `<span class="tag">🎂 ${dog.age}</span>` : ''}
                    ${dog.condition ? `<span class="tag">❤️ ${dog.condition}</span>` : ''}
                </div>
                <div class="card-text mt-3">
                    <p><strong>Descrição:</strong></p>
                    <p>${dog.description || 'Sem descrição disponível.'}</p>
                </div>
                <div style="margin-top:2rem">${actionHtml}</div>
            </div>
        </div>`;
}

async function requestAdopt(id) {
    try {
        await apiCall(`/api/dogs/${id}/adopt`, { method: 'POST' });
        showAlert('Solicitação enviada');
        location.href = '/minhas-adocoes';
    } catch (err) {
        showAlert(err.message, 'error');
    }
}

// ── MINHAS ADOÇÕES ────────────────────────────────────────────────────────────

async function loadMyAdoptions() {
    const container = document.getElementById('my-adoptions');
    if (!container) return;

    if (!window.currentUser) { location.href = '/login'; return; }

    let adoptions;
    try {
        adoptions = await apiCall('/api/dogs/my-adoptions');
    } catch (err) {
        if (err.message && err.message.includes('401')) location.href = '/login';
        else container.innerHTML = `<p class="text-center">Erro ao carregar adoções.</p>`;
        return;
    }

    if (!adoptions.length) {
        container.innerHTML = `
            <div class="empty-state" style="text-align:center;padding:3rem 1rem">
                <div style="font-size:3.5rem;margin-bottom:1rem">🐾</div>
                <h3 style="margin-bottom:0.5rem">Nenhuma adoção ainda</h3>
                <p style="color:var(--gray-600)">Você ainda não solicitou nenhuma adoção.</p>
                <a href="/caes" class="btn btn-primary" style="margin-top:1.5rem;display:inline-block">Ver cães disponíveis</a>
            </div>`;
        return;
    }

    const statusLabels = { approved: 'Aprovada', pending: 'Pendente', rejected: 'Recusada' };
    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr><th>Foto</th><th>Nome</th><th>Idade</th><th>Data</th><th>Status</th><th>Ações</th></tr>
                </thead>
                <tbody>
                    ${adoptions.map(a => `
                        <tr>
                            <td><img src="${a.photo}" alt="${a.name}" onerror="this.style.display='none'"></td>
                            <td>${a.name}</td>
                            <td>${a.age || '-'}</td>
                            <td>${new Date(a.adoption_date).toLocaleDateString('pt-BR')}</td>
                            <td><span class="status-${a.status}">${statusLabels[a.status] || a.status}</span></td>
                            <td>
                                ${a.status === 'pending'
                                    ? `<button class="btn btn-outline" onclick="cancelAdoption(${a.adoption_id})">Cancelar</button>`
                                    : '-'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
}

async function cancelAdoption(adoptionId) {
    if (!confirm('Tem certeza que deseja cancelar esta solicitação de adoção?')) return;
    try {
        await apiCall(`/api/dogs/cancel-adoption/${adoptionId}`, { method: 'POST' });
        showAlert('Adoção cancelada com sucesso.');
        await loadMyAdoptions();
    } catch (err) {
        showAlert(err.message || 'Erro ao cancelar adoção.', 'error');
    }
}
