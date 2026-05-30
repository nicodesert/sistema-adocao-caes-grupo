// ============================================
// JAVASCRIPT — Listagem de Cães, Detalhes e Adoções
// Pessoa 9 é responsável por este arquivo
// ============================================

window.appReady.then(() => {
  // --- Página de listagem de cães ---
  const dogsList = document.getElementById('dogs-list');
  if (dogsList) {
    loadDogsList(dogsList);
  }

  // --- Página de detalhe do cão ---
  const dogDetail = document.getElementById('dog-detail');
  if (dogDetail) {
    loadDogDetail(dogDetail);
  }

  // --- Página de minhas adoções ---
  const myAdoptions = document.getElementById('my-adoptions');
  if (myAdoptions) {
    loadMyAdoptions(myAdoptions);
  }
});

// === LISTA DE CÃES ===
async function loadDogsList(container) {
  try {
    const dogs = await apiCall('/api/dogs');

    if (dogs.length === 0) {
      container.innerHTML = '<div class="empty-message"><span>🐕</span><p>Nenhum cão disponível no momento.</p></div>';
      return;
    }

    container.innerHTML = dogs.map(dog => `
      <div class="card">
        ${dog.photo
          ? '<img src="' + dog.photo + '" alt="' + dog.name + '" class="card-img">'
          : '<div class="card-placeholder">🐕</div>'}
        <div class="card-body">
          <h3>${dog.name}</h3>
          <p><strong>Idade:</strong> ${dog.age}</p>
          ${dog.condition ? '<p><strong>Condição:</strong> ' + dog.condition + '</p>' : ''}
          <a href="/dog-detail.html?id=${dog.id}" class="btn btn-outline btn-sm">Ver Detalhes</a>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<p class="text-center">Erro ao carregar cães.</p>';
  }
}

// === DETALHE DO CÃO ===
async function loadDogDetail(container) {
  // Pega o ID da URL: dog-detail.html?id=3
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    container.innerHTML = '<p class="text-center">Cão não encontrado.</p>';
    return;
  }

  try {
    const dog = await apiCall('/api/dogs/' + id);
    const user = window.currentUser;

    // Monta o botão de adoção conforme a situação do usuário
    let adoptBtn = '';
    if (!user) {
      adoptBtn = '<a href="/login.html" class="btn btn-secondary">Faça login para adotar</a>';
    } else if (user.role === 'user' && dog.available) {
      adoptBtn = '<button class="btn btn-success" onclick="requestAdopt(' + dog.id + ')">Quero Adotar!</button>';
    } else if (!dog.available) {
      adoptBtn = '<span class="badge badge-unavailable">Já adotado</span>';
    }

    container.innerHTML = `
      <a href="/dogs.html" class="btn btn-secondary btn-sm mb-20">&larr; Voltar</a>
      <div class="detail-grid">
        <div>
          ${dog.photo
            ? '<img src="' + dog.photo + '" alt="' + dog.name + '" class="detail-img">'
            : '<div class="card-placeholder" style="height:300px;border-radius:8px">🐕</div>'}
        </div>
        <div class="detail-info">
          <h1>${dog.name}</h1>
          <p><strong>Idade:</strong> ${dog.age}</p>
          ${dog.vaccines ? '<p><strong>Vacinas:</strong> ' + dog.vaccines + '</p>' : ''}
          ${dog.condition ? '<p><strong>Condição:</strong> ' + dog.condition + '</p>' : ''}
          ${dog.description ? '<p><strong>Descrição:</strong> ' + dog.description + '</p>' : ''}
          <p><strong>Status:</strong> ${dog.available ? '<span class="badge badge-available">Disponível</span>' : '<span class="badge badge-unavailable">Indisponível</span>'}</p>
          <div class="mt-20">${adoptBtn}</div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = '<p class="text-center">Cão não encontrado.</p>';
  }
}

// === SOLICITAR ADOÇÃO (chamada pelo botão) ===
async function requestAdopt(dogId) {
  try {
    const data = await apiCall('/api/dogs/' + dogId + '/adopt', { method: 'POST' });
    showAlert(data.message, 'success');
    setTimeout(() => {
      window.location.href = '/my-adoptions.html';
    }, 1000);
  } catch (err) {
    showAlert(err.message, 'error');
  }
}

// === MINHAS ADOÇÕES ===
async function loadMyAdoptions(container) {
  if (!window.currentUser) {
    window.location.href = '/login.html';
    return;
  }

  try {
    const adoptions = await apiCall('/api/dogs/my-adoptions');

    if (adoptions.length === 0) {
      container.innerHTML = `
        <div class="empty-message">
          <span>📋</span>
          <p>Você ainda não solicitou nenhuma adoção.</p>
          <a href="/dogs.html" class="btn btn-primary mt-10">Ver Cães Disponíveis</a>
        </div>
      `;
      return;
    }

    const statusLabel = {
      pending: '<span class="badge badge-pending">Pendente</span>',
      approved: '<span class="badge badge-approved">Aprovada</span>',
      rejected: '<span class="badge badge-rejected">Rejeitada</span>'
    };

    container.innerHTML = '<div class="table-container"><table>' +
      '<thead><tr><th>Foto</th><th>Cão</th><th>Idade</th><th>Condição</th><th>Status</th><th>Data</th><th>Ação</th></tr></thead><tbody>' +
      adoptions.map(a => `
        <tr>
          <td>${a.photo ? '<img src="' + a.photo + '" class="table-img">' : '🐕'}</td>
          <td><a href="/dog-detail.html?id=${a.dog_id}">${a.name}</a></td>
          <td>${a.age}</td>
          <td>${a.condition || '-'}</td>
          <td>${statusLabel[a.status] || a.status}</td>
          <td>${new Date(a.adoption_date).toLocaleDateString('pt-BR')}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="cancelAdoption(${a.adoption_id})">Cancelar</button>
          </td>
        </tr>
      `).join('') +
      '</tbody></table></div>';
  } catch (err) {
    container.innerHTML = '<p class="text-center">Erro ao carregar adoções.</p>';
  }
}

// === CANCELAR ADOÇÃO ===
async function cancelAdoption(adoptionId) {
  if (!confirm('Tem certeza que deseja cancelar esta adoção?')) return;

  try {
    const data = await apiCall('/api/dogs/cancel-adoption/' + adoptionId, { method: 'POST' });
    showAlert(data.message, 'success');
    // Recarrega a lista
    const container = document.getElementById('my-adoptions');
    if (container) loadMyAdoptions(container);
  } catch (err) {
    showAlert(err.message, 'error');
  }
}
