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
        <div class="card">
            <img class="card-img" src="${dog.photo}">
            <div class="card-content">
                <h2>${dog.name}</h2>
                <p>${dog.description}</p>
                <button class="btn btn-success" onclick="requestAdopt(${dog.id})">
                    Quero Adotar
                </button>
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
    container.innerHTML = adoptions.map(a => `
        <div class="card">
            <div class="card-content">
                <h3>${a.name}</h3>
                <span class="badge badge-${a.status}">${a.status}</span>
            </div>
        </div>
    `).join('');
}
