window.appReady.then(() => {
    loadDogs();
    loadDogDetail();
    loadMyAdoptions();
});

async function loadDogs() {
    const container = document.getElementById('dogs-list');
    if (!container) return;
    const dogs = await apiCall('/api/dogs');
    container.innerHTML = dogs.map(dog => `
        <article class="card">
            <img class="card-img" src="${dog.photo}" alt="${dog.name}">
            <div class="card-content">
                <h3 class="card-title">${dog.name}</h3>
                <p class="card-text">
                    ${dog.age ? `<strong>Idade:</strong> ${dog.age}<br>` : ''}
                    ${dog.condition ? `<strong>Condição:</strong> ${dog.condition}` : ''}
                </p>
                <a class="btn btn-primary mt-2" href="/dog-detail.html?id=${dog.id}">
                    Ver detalhes
                </a>
            </div>
        </article>
    `).join('');
}

async function loadDogDetail() {
    const container = document.getElementById('dog-detail');
    if (!container) return;
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
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
        actionHtml = `<a class="btn btn-outline" href="/login.html">Faça login para adotar</a>`;
    } else {
        actionHtml = `<button class="btn btn-primary" onclick="requestAdopt(${dog.id})">🐾 Quero Adotar</button>`;
    }
    container.innerHTML = `
        <div class="dog-info-grid">
            <div class="dog-image">
                <img src="${dog.photo || ''}" alt="${dog.name}" class="dog-info-img">
            </div>
            <div class="dog-details">
                <h1>${dog.name}</h1>
                <div class="dog-tags">
                    ${dog.age ? `<span class="tag">🎂 ${dog.age}</span>` : ''}
                    ${dog.condition ? `<span class="tag">❤️ ${dog.condition}</span>` : ''}
                </div>
                <div class="card-text mt-3">
                    <p><strong>Descrição:</strong></p>
                    <p>${dog.description || 'Sem descrição disponível.'}</p>
                </div>
                <div style="margin-top: 2rem;">
                    ${actionHtml}
                </div>
            </div>
        </div>
    `;
}

async function requestAdopt(id) {
    try {
        await apiCall(`/api/dogs/${id}/adopt`, { method: 'POST' });
        showAlert('Solicitação enviada');
        location.href = '/my-adoptions.html';
    } catch (err) {
        showAlert(err.message, 'error');
    }
}

async function loadMyAdoptions() {
    const container = document.getElementById('my-adoptions');
    if (!container) return;
    if (!window.currentUser) {
        location.href = '/login.html';
        return;
    }
    let adoptions;
    try {
        adoptions = await apiCall('/api/dogs/my-adoptions');
    } catch (err) {
        if (err.message && err.message.includes('401')) location.href = '/login.html';
        else container.innerHTML = `<p class="text-center">Erro ao carregar adoções.</p>`;
        return;
    }
    if (!adoptions.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🐾</div>
                <h3>Nenhuma adoção ainda</h3>
                <p>Você ainda não solicitou nenhuma adoção.</p>
            </div>`;
        return;
    }
    const statusLabels = { approved: 'Aprovada', pending: 'Pendente', rejected: 'Recusada' };
    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Foto</th>
                        <th>Nome</th>
                        <th>Idade</th>
                        <th>Data</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${adoptions.map(a => `
                        <tr>
                            <td><img src="${a.photo}" alt="${a.name}"></td>
                            <td>${a.name}</td>
                            <td>${a.age || '-'}</td>
                            <td>${new Date(a.adoption_date).toLocaleDateString('pt-BR')}</td>
                            <td><span class="status-${a.status}">${statusLabels[a.status] || a.status}</span></td>
                            <td><button class="btn btn-outline" onclick="cancelAdoption(${a.adoption_id})">Cancelar</button></td>
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
