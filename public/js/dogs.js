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
        <div class="card">
            <img class="card-img" src="${dog.photo}">
            <div class="card-content">
                <h3>${dog.name}</h3>
                <p>${dog.age}</p>
                <a class="btn btn-primary" href="/dog-detail.html?id=${dog.id}">
                    Ver detalhes
                </a>
            </div>
        </div>
    `).join('');
}

async function loadDogDetail() {
    const container = document.getElementById('dog-detail');
    if (!container) return;
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const dog = await apiCall(`/api/dogs/${id}`);
    container.innerHTML = `
        <div class="dog-info-grid">
            <div class="dog-image">
                <img src="${dog.photo}" alt="${dog.name}" class="dog-info-img">
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
                    <button class="btn btn-primary" onclick="requestAdopt(${dog.id})">
                        🐾 Quero Adotar
                    </button>
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
    const adoptions = await apiCall('/api/dogs/my-adoptions');
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
                            <td>${a.status !== 'approved' ? `<button class="btn btn-outline" onclick="cancelAdoption(${a.adoption_id})">Cancelar</button>` : ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
}
