// ============================================
// JAVASCRIPT — Painel Administrativo (todas as páginas admin)
// Pessoa 10 é responsável por este arquivo
// ============================================

window.appReady.then(() => {
  // Verifica se é admin
  if (!window.currentUser || window.currentUser.role !== 'admin') {
    window.location.href = '/login.html';
    return;
  }

  // Inicializa a página correta baseado nos elementos
  if (document.getElementById('dashboard')) initDashboard();
  if (document.getElementById('admin-dogs')) initAdminDogs();
  if (document.getElementById('dog-form')) initDogForm();
  if (document.getElementById('admin-clients')) initAdminClients();
  if (document.getElementById('client-detail')) initClientDetail();
  if (document.getElementById('admin-adoptions')) initAdminAdoptions();
  if (document.getElementById('admin-place')) initAdminPlace();
});

// =============================================
// DASHBOARD
// =============================================
async function initDashboard() {
  try {
    const stats = await apiCall('/api/admin/dashboard');
    const container = document.getElementById('dashboard');
    container.innerHTML = `
      <div class="stat-card">
        <div class="stat-number">${stats.totalDogs}</div>
        <div class="stat-label">Total de Cães</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.availableDogs}</div>
        <div class="stat-label">Disponíveis</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.totalUsers}</div>
        <div class="stat-label">Clientes</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.pendingAdoptions}</div>
        <div class="stat-label">Adoções Pendentes</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.approvedAdoptions}</div>
        <div class="stat-label">Adoções Aprovadas</div>
      </div>
    `;
  } catch (err) {
    showAlert('Erro ao carregar dashboard.', 'error');
  }
}

// =============================================
// GERENCIAR CÃES (listagem admin)
// =============================================
async function initAdminDogs() {
  try {
    const dogs = await apiCall('/api/admin/dogs');
    const container = document.getElementById('admin-dogs');

    if (dogs.length === 0) {
      container.innerHTML = '<div class="empty-message"><span>🐕</span><p>Nenhum cão cadastrado.</p></div>';
      return;
    }

    container.innerHTML = '<table>' +
      '<thead><tr><th>Foto</th><th>Nome</th><th>Idade</th><th>Condição</th><th>Status</th><th>Ações</th></tr></thead><tbody>' +
      dogs.map(dog => `
        <tr>
          <td>${dog.photo ? '<img src="' + dog.photo + '" class="table-img">' : '🐕'}</td>
          <td><strong>${dog.name}</strong></td>
          <td>${dog.age}</td>
          <td>${dog.condition || '-'}</td>
          <td>${dog.available ? '<span class="badge badge-available">Disponível</span>' : '<span class="badge badge-unavailable">Adotado</span>'}</td>
          <td>
            <a href="/admin/dog-form.html?id=${dog.id}" class="btn btn-primary btn-sm">Editar</a>
            <button class="btn btn-danger btn-sm" onclick="deleteDog(${dog.id})">Excluir</button>
          </td>
        </tr>
      `).join('') +
      '</tbody></table>';
  } catch (err) {
    showAlert('Erro ao carregar cães.', 'error');
  }
}

// Excluir cão
async function deleteDog(id) {
  if (!confirm('Tem certeza que deseja excluir este cão?')) return;
  try {
    await apiCall('/api/admin/dogs/' + id + '/delete', { method: 'POST' });
    showAlert('Cão removido!', 'success');
    initAdminDogs();
  } catch (err) {
    showAlert(err.message, 'error');
  }
}

// =============================================
// FORMULÁRIO DE CÃO (cadastrar / editar)
// =============================================
async function initDogForm() {
  const form = document.getElementById('dog-form');
  const submitBtn = form.querySelector('button[type="submit"]');
  const params = new URLSearchParams(window.location.search);
  const dogId = params.get('id');

  setupImagePreview('photo', 'photo-preview');

  // Registra o listener de submit ANTES do carregamento assíncrono
  // para evitar que cliques rápidos sejam ignorados
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const url = dogId ? '/api/admin/dogs/' + dogId : '/api/admin/dogs';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvando...';
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showAlert(data.message, 'success');
      setTimeout(() => { window.location.href = '/admin/dogs.html'; }, 1000);
    } catch (err) {
      showAlert(err.message || 'Erro ao salvar.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Salvar';
    }
  });

  // Se tem ID na URL, é edição — carrega dados do cão
  if (dogId) {
    document.getElementById('form-title').textContent = 'Editar Cão';
    document.getElementById('available-group').style.display = 'block';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Carregando...';

    try {
      const dog = await apiCall('/api/admin/dogs/' + dogId);
      document.getElementById('name').value = dog.name;
      document.getElementById('age').value = dog.age;
      document.getElementById('vaccines').value = dog.vaccines || '';
      document.getElementById('condition').value = dog.condition || '';
      document.getElementById('description').value = dog.description || '';
      document.getElementById('available').value = dog.available ? '1' : '0';

      if (dog.photo) {
        const preview = document.getElementById('photo-preview');
        preview.src = dog.photo;
        preview.style.display = 'block';
      }
    } catch (err) {
      showAlert('Erro ao carregar dados do cão.', 'error');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Salvar';
  }
}

// =============================================
// CLIENTES
// =============================================
async function initAdminClients() {
  try {
    const clients = await apiCall('/api/admin/clients');
    const container = document.getElementById('admin-clients');

    if (clients.length === 0) {
      container.innerHTML = '<div class="empty-message"><span>👥</span><p>Nenhum cliente cadastrado.</p></div>';
      return;
    }

    container.innerHTML = '<table>' +
      '<thead><tr><th>Nome</th><th>Email</th><th>Telefone</th><th>CPF</th><th>Ações</th></tr></thead><tbody>' +
      clients.map(c => `
        <tr>
          <td><strong>${c.name}</strong></td>
          <td>${c.email}</td>
          <td>${c.phone}</td>
          <td>${c.cpf}</td>
          <td>
            <a href="/admin/client-detail.html?id=${c.id}" class="btn btn-primary btn-sm">Detalhes</a>
            <button class="btn btn-danger btn-sm" onclick="deleteClient(${c.id})">Excluir</button>
          </td>
        </tr>
      `).join('') +
      '</tbody></table>';
  } catch (err) {
    showAlert('Erro ao carregar clientes.', 'error');
  }
}

// Excluir cliente
async function deleteClient(id) {
  if (!confirm('Tem certeza que deseja excluir este cliente e suas adoções?')) return;
  try {
    await apiCall('/api/admin/clients/' + id + '/delete', { method: 'POST' });
    showAlert('Cliente removido!', 'success');
    initAdminClients();
  } catch (err) {
    showAlert(err.message, 'error');
  }
}

// =============================================
// DETALHES DO CLIENTE
// =============================================
async function initClientDetail() {
  const params = new URLSearchParams(window.location.search);
  const clientId = params.get('id');
  const container = document.getElementById('client-detail');

  if (!clientId) {
    container.innerHTML = '<p>Cliente não encontrado.</p>';
    return;
  }

  try {
    const data = await apiCall('/api/admin/clients/' + clientId);
    const client = data.client;
    const adoptions = data.adoptions;

    const statusLabel = {
      pending: '<span class="badge badge-pending">Pendente</span>',
      approved: '<span class="badge badge-approved">Aprovada</span>',
      rejected: '<span class="badge badge-rejected">Rejeitada</span>'
    };

    let adoptionsHtml = '';
    if (adoptions.length > 0) {
      adoptionsHtml = '<h3 class="mt-20 mb-10">Adoções</h3>' +
        '<div class="table-container"><table>' +
        '<thead><tr><th>Cão</th><th>Status</th><th>Data</th></tr></thead><tbody>' +
        adoptions.map(a => `
          <tr>
            <td>${a.dog_name}</td>
            <td>${statusLabel[a.status] || a.status}</td>
            <td>${new Date(a.created_at).toLocaleDateString('pt-BR')}</td>
          </tr>
        `).join('') +
        '</tbody></table></div>';
    }

    container.innerHTML = `
      <a href="/admin/clients.html" class="btn btn-secondary btn-sm mb-20">&larr; Voltar</a>
      <div class="detail-info" style="max-width:600px">
        <h1>${client.name}</h1>
        <p><strong>Email:</strong> ${client.email}</p>
        <p><strong>Telefone:</strong> ${client.phone}</p>
        <p><strong>CPF:</strong> ${client.cpf}</p>
        <p><strong>Endereço:</strong> ${client.address}</p>
        <p><strong>Cadastrado em:</strong> ${new Date(client.created_at).toLocaleDateString('pt-BR')}</p>
      </div>
      ${adoptionsHtml}
    `;
  } catch (err) {
    container.innerHTML = '<p>Erro ao carregar cliente.</p>';
  }
}

// =============================================
// ADOÇÕES
// =============================================
async function initAdminAdoptions() {
  try {
    const adoptions = await apiCall('/api/admin/adoptions');
    const container = document.getElementById('admin-adoptions');

    if (adoptions.length === 0) {
      container.innerHTML = '<div class="empty-message"><span>📝</span><p>Nenhuma solicitação de adoção.</p></div>';
      return;
    }

    const statusLabel = {
      pending: '<span class="badge badge-pending">Pendente</span>',
      approved: '<span class="badge badge-approved">Aprovada</span>',
      rejected: '<span class="badge badge-rejected">Rejeitada</span>'
    };

    container.innerHTML = '<table>' +
      '<thead><tr><th>Cão</th><th>Cliente</th><th>Email</th><th>Telefone</th><th>Status</th><th>Data</th><th>Ações</th></tr></thead><tbody>' +
      adoptions.map(a => `
        <tr class="adoption-row" data-status="${a.status}">
          <td>
            ${a.dog_photo ? '<img src="' + a.dog_photo + '" class="table-img">' : ''}
            ${a.dog_name}
          </td>
          <td><a href="/admin/client-detail.html?id=${a.user_id}">${a.user_name}</a></td>
          <td>${a.user_email}</td>
          <td>${a.user_phone}</td>
          <td>${statusLabel[a.status] || a.status}</td>
          <td>${new Date(a.created_at).toLocaleDateString('pt-BR')}</td>
          <td>
            ${a.status === 'pending' ? `
              <button class="btn btn-success btn-sm" onclick="approveAdoption(${a.id})">Aprovar</button>
              <button class="btn btn-danger btn-sm" onclick="rejectAdoption(${a.id})">Rejeitar</button>
            ` : '-'}
          </td>
        </tr>
      `).join('') +
      '</tbody></table>';
  } catch (err) {
    showAlert('Erro ao carregar adoções.', 'error');
  }
}

// Filtrar adoções (sem recarregar a página)
function filterAdoptions(filter) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  document.querySelectorAll('.adoption-row').forEach(row => {
    if (filter === 'all' || row.dataset.status === filter) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

// Aprovar adoção
async function approveAdoption(id) {
  if (!confirm('Aprovar esta adoção? O cão ficará indisponível.')) return;
  try {
    await apiCall('/api/admin/adoptions/' + id + '/approve', { method: 'POST' });
    showAlert('Adoção aprovada!', 'success');
    initAdminAdoptions();
  } catch (err) {
    showAlert(err.message, 'error');
  }
}

// Rejeitar adoção
async function rejectAdoption(id) {
  if (!confirm('Rejeitar esta adoção?')) return;
  try {
    await apiCall('/api/admin/adoptions/' + id + '/reject', { method: 'POST' });
    showAlert('Adoção rejeitada.', 'success');
    initAdminAdoptions();
  } catch (err) {
    showAlert(err.message, 'error');
  }
}

// =============================================
// LOCAL (edição admin)
// =============================================
async function initAdminPlace() {
  const container = document.getElementById('admin-place');

  try {
    const data = await apiCall('/api/admin/place');
    const place = data.place || {};
    const photos = data.photos || [];

    // Monta o formulário de edição + galeria de fotos
    container.innerHTML = `
      <div class="form-container mb-20">
        <h2 class="mb-20">Editar Informações</h2>
        <form id="place-form">
          <div class="form-group">
            <label for="place-name">Nome do Local:</label>
            <input type="text" id="place-name" name="name" value="${place.name || ''}">
          </div>
          <div class="form-group">
            <label for="place-address">Endereço:</label>
            <input type="text" id="place-address" name="address" value="${place.address || ''}">
          </div>
          <div class="form-group">
            <label for="place-phone">Telefone:</label>
            <input type="text" id="place-phone" name="phone" value="${place.phone || ''}">
          </div>
          <div class="form-group">
            <label for="place-email">Email:</label>
            <input type="email" id="place-email" name="email" value="${place.email || ''}">
          </div>
          <div class="form-group">
            <label for="place-description">Descrição:</label>
            <textarea id="place-description" name="description">${place.description || ''}</textarea>
          </div>
          <div class="form-group">
            <label for="place-facebook">Facebook (URL):</label>
            <input type="text" id="place-facebook" name="facebook" value="${place.facebook || ''}">
          </div>
          <div class="form-group">
            <label for="place-instagram">Instagram (URL):</label>
            <input type="text" id="place-instagram" name="instagram" value="${place.instagram || ''}">
          </div>
          <div class="form-group">
            <label for="place-whatsapp">WhatsApp (URL):</label>
            <input type="text" id="place-whatsapp" name="whatsapp" value="${place.whatsapp || ''}">
          </div>
          <button type="submit" class="btn btn-primary">Salvar Informações</button>
        </form>
      </div>

      <div class="form-container">
        <h2 class="mb-20">Fotos do Local</h2>
        <form id="place-photo-form" class="mb-20">
          <div class="form-group">
            <label for="place-photo">Adicionar Foto:</label>
            <input type="file" id="place-photo" name="photo" accept="image/*">
          </div>
          <div class="form-group">
            <label for="place-caption">Legenda (opcional):</label>
            <input type="text" id="place-caption" name="caption">
          </div>
          <button type="submit" class="btn btn-success">Enviar Foto</button>
        </form>

        ${photos.length > 0 ? `
          <div class="photo-grid">
            ${photos.map(p => `
              <div class="photo-item">
                <img src="${p.photo}" alt="${p.caption || ''}">
                <button class="photo-delete" onclick="deletePlacePhoto(${p.id})" title="Excluir">&times;</button>
              </div>
            `).join('')}
          </div>
        ` : '<p class="text-center">Nenhuma foto adicionada.</p>'}
      </div>
    `;

    // Salvar informações do local
    document.getElementById('place-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const formData = {
        name: document.getElementById('place-name').value,
        address: document.getElementById('place-address').value,
        phone: document.getElementById('place-phone').value,
        email: document.getElementById('place-email').value,
        description: document.getElementById('place-description').value,
        facebook: document.getElementById('place-facebook').value,
        instagram: document.getElementById('place-instagram').value,
        whatsapp: document.getElementById('place-whatsapp').value
      };

      try {
        const result = await apiCall('/api/admin/place', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        showAlert(result.message, 'success');
      } catch (err) {
        showAlert(err.message, 'error');
      }
    });

    // Enviar foto
    document.getElementById('place-photo-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const formData = new FormData(this);

      try {
        const res = await fetch('/api/admin/place/photo', { method: 'POST', body: formData });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        showAlert(result.message, 'success');
        initAdminPlace(); // recarrega
      } catch (err) {
        showAlert(err.message, 'error');
      }
    });
  } catch (err) {
    container.innerHTML = '<p>Erro ao carregar informações do local.</p>';
  }
}

// Excluir foto do local
async function deletePlacePhoto(id) {
  if (!confirm('Excluir esta foto?')) return;
  try {
    await apiCall('/api/admin/place/photo/' + id + '/delete', { method: 'POST' });
    showAlert('Foto removida!', 'success');
    initAdminPlace();
  } catch (err) {
    showAlert(err.message, 'error');
  }
}
