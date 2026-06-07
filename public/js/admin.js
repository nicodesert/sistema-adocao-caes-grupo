// ============================================
// JAVASCRIPT — Painel Administrativo (todas as páginas admin)
// Pessoa 10 é responsável por este arquivo
// ============================================

window.appReady.then(() => {
  if (!window.currentUser || window.currentUser.role !== 'admin') {
    window.location.href = '/login';
    return;
  }

  if (document.getElementById('dashboard'))       initDashboard();
  if (document.getElementById('admin-dogs'))      initAdminDogs();
  if (document.getElementById('dog-form'))        initDogForm();
  if (document.getElementById('admin-clients'))   initAdminClients();
  if (document.getElementById('client-detail'))   initClientDetail();
  if (document.getElementById('admin-adoptions')) initAdminAdoptions();
  if (document.getElementById('admin-place'))     initAdminPlace();
  if (document.getElementById('admin-messages'))  initAdminMessages();
});

// =============================================
// DASHBOARD
// =============================================
async function initDashboard() {
  try {
    const [stats, contacts] = await Promise.all([
      apiCall('/api/admin/dashboard'),
      apiCall('/api/contact')
    ]);

    const unread = contacts.filter(c => !c.read).length;

    const container = document.getElementById('dashboard');
    container.innerHTML = `
      <div class="stat-card stat-dogs">
        <div class="stat-number">${stats.totalDogs}</div>
        <div class="stat-label">Total de Cães</div>
      </div>
      <div class="stat-card stat-available">
        <div class="stat-number">${stats.availableDogs}</div>
        <div class="stat-label">Disponíveis</div>
      </div>
      <div class="stat-card stat-clients">
        <div class="stat-number">${stats.totalUsers}</div>
        <div class="stat-label">Clientes</div>
      </div>
      <div class="stat-card stat-pending">
        <div class="stat-number">${stats.pendingAdoptions}</div>
        <div class="stat-label">Adoções Pendentes</div>
      </div>
      <div class="stat-card stat-approved">
        <div class="stat-number">${stats.approvedAdoptions}</div>
        <div class="stat-label">Adoções Aprovadas</div>
      </div>
      <div class="stat-card" style="${unread > 0 ? 'border-left:4px solid #d97706' : ''}">
        <div class="stat-number" style="color:#d97706">${unread}</div>
        <div class="stat-label">Mensagens Novas</div>
      </div>
    `;

    // Prévia das mensagens não lidas
    if (unread > 0) {
      const preview = contacts.filter(c => !c.read).slice(0, 3);
      const section = document.createElement('div');
      section.style.cssText = 'margin-top:28px';
      section.innerHTML = `
        <div class="admin-page-header" style="margin-bottom:16px">
          <h3 style="font-size:1rem;font-weight:700;color:#0f172a">📬 Mensagens não lidas</h3>
          <a href="/admin/mensagens" class="btn btn-secondary btn-sm">Ver todas</a>
        </div>
        <div class="table-container">
          <table>
            <thead><tr><th>Nome</th><th>E-mail</th><th>Mensagem</th><th>Data</th><th>Ação</th></tr></thead>
            <tbody>
              ${preview.map(c => `
                <tr>
                  <td><strong>${c.name}</strong></td>
                  <td>${c.email}</td>
                  <td style="max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.message}</td>
                  <td>${new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                  <td><button class="btn btn-primary btn-sm" onclick="markRead(${c.id}, this)">Marcar lida</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`;
      container.insertAdjacentElement('afterend', section);
    }
  } catch (err) {
    showAlert('Erro ao carregar dashboard.', 'error');
  }
}

// =============================================
// GERENCIAR CÃES (listagem admin)
// =============================================
// Cache dos cães para a busca admin
let _adminAllDogs = [];

async function initAdminDogs() {
  try {
    _adminAllDogs = await apiCall('/api/admin/dogs');

    if (_adminAllDogs.length === 0) {
      document.getElementById('admin-dogs').innerHTML =
        '<div class="empty-message"><span>🐕</span><p>Nenhum cão cadastrado.</p></div>';
      return;
    }

    renderAdminDogs(_adminAllDogs);
    setupAdminSearch();
  } catch (err) {
    showAlert('Erro ao carregar cães.', 'error');
  }
}

function setupAdminSearch() {
  const input = document.getElementById('admin-search-input');
  const clear = document.getElementById('admin-search-clear');
  if (!input) return;

  // Evita duplicar o listener se initAdminDogs for chamado de novo (após excluir)
  input.oninput = () => {
    if (clear) clear.style.display = input.value ? 'block' : 'none';
    applyAdminSearch();
  };
}

function applyAdminSearch() {
  const input  = document.getElementById('admin-search-input');
  const select = document.getElementById('admin-filter-status');
  const count  = document.getElementById('admin-search-count');
  const term   = (input?.value || '').toLowerCase().trim();
  const status = select?.value || 'all';

  let result = _adminAllDogs.filter(dog => {
    const matchText = !term ||
      dog.name.toLowerCase().includes(term) ||
      (dog.age       || '').toLowerCase().includes(term) ||
      (dog.condition || '').toLowerCase().includes(term);

    const matchStatus =
      status === 'all' ||
      (status === 'available'   && dog.available) ||
      (status === 'unavailable' && !dog.available);

    return matchText && matchStatus;
  });

  if (count) {
    if (term || status !== 'all') {
      count.style.display = 'block';
      count.textContent = result.length === 0
        ? 'Nenhum cão encontrado para os filtros aplicados.'
        : `${result.length} cão${result.length > 1 ? 'es' : ''} encontrado${result.length > 1 ? 's' : ''}.`;
    } else {
      count.style.display = 'none';
    }
  }

  renderAdminDogs(result);
}

function clearAdminSearch() {
  const input = document.getElementById('admin-search-input');
  const clear = document.getElementById('admin-search-clear');
  const select = document.getElementById('admin-filter-status');
  if (input)  { input.value = ''; }
  if (clear)  { clear.style.display = 'none'; }
  if (select) { select.value = 'all'; }
  applyAdminSearch();
}

function renderAdminDogs(dogs) {
  const container = document.getElementById('admin-dogs');

  if (dogs.length === 0) {
    container.innerHTML = '<div class="empty-message"><span>🔍</span><p>Nenhum cão corresponde à busca.</p></div>';
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
          <a href="/admin/caes/editar?id=${dog.id}" class="btn btn-primary btn-sm">Editar</a>
          <button class="btn btn-danger btn-sm" onclick="deleteDog(${dog.id})">Excluir</button>
        </td>
      </tr>
    `).join('') +
    '</tbody></table>';
}

async function deleteDog(id) {
  if (!confirm('Tem certeza que deseja excluir este cão?')) return;
  try {
    await apiCall('/api/admin/dogs/' + id + '/delete', { method: 'POST' });
    showAlert('Cão removido!', 'success');
    // Remove do cache local e re-renderiza sem nova requisição
    _adminAllDogs = _adminAllDogs.filter(d => d.id !== id);
    applyAdminSearch();
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

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const url = dogId ? '/api/admin/dogs/' + dogId : '/api/admin/dogs';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvando...';
    try {
      const res = await fetch(url, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showAlert(data.message, 'success');
      setTimeout(() => { window.location.href = '/admin/caes'; }, 1000);
    } catch (err) {
      showAlert(err.message || 'Erro ao salvar.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Salvar';
    }
  });

  if (dogId) {
    document.getElementById('form-title').textContent = 'Editar Cão';
    document.getElementById('available-group').style.display = 'block';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Carregando...';
    try {
      const dog = await apiCall('/api/admin/dogs/' + dogId);
      document.getElementById('name').value        = dog.name;
      document.getElementById('age').value         = dog.age;
      document.getElementById('vaccines').value    = dog.vaccines || '';
      document.getElementById('condition').value   = dog.condition || '';
      document.getElementById('description').value = dog.description || '';
      document.getElementById('available').value   = dog.available ? '1' : '0';
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
            <a href="/admin/clientes/detalhes?id=${c.id}" class="btn btn-primary btn-sm">Detalhes</a>
            <button class="btn btn-danger btn-sm" onclick="deleteClient(${c.id})">Excluir</button>
          </td>
        </tr>
      `).join('') +
      '</tbody></table>';
  } catch (err) {
    showAlert('Erro ao carregar clientes.', 'error');
  }
}

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

  if (!clientId) { container.innerHTML = '<p>Cliente não encontrado.</p>'; return; }

  try {
    const data = await apiCall('/api/admin/clients/' + clientId);
    const client = data.client;
    const adoptions = data.adoptions;

    const statusLabel = {
      pending:  '<span class="badge badge-pending">Pendente</span>',
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
      <a href="/admin/clientes" class="btn btn-secondary btn-sm mb-20">&larr; Voltar</a>
      <div class="detail-info" style="max-width:600px">
        <h1>${client.name}</h1>
        <p><strong>Email:</strong> ${client.email}</p>
        <p><strong>Telefone:</strong> ${client.phone}</p>
        <p><strong>CPF:</strong> ${client.cpf}</p>
        <p><strong>Endereço:</strong> ${client.address}</p>
        <p><strong>Cadastrado em:</strong> ${new Date(client.created_at).toLocaleDateString('pt-BR')}</p>
      </div>
      ${adoptionsHtml}`;
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
      pending:  '<span class="badge badge-pending">Pendente</span>',
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
          <td><a href="/admin/clientes/detalhes?id=${a.user_id}">${a.user_name}</a></td>
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

function filterAdoptions(filter) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  document.querySelectorAll('.adoption-row').forEach(row => {
    row.style.display = (filter === 'all' || row.dataset.status === filter) ? '' : 'none';
  });
}

async function approveAdoption(id) {
  if (!confirm('Aprovar esta adoção? O cão ficará indisponível.')) return;
  try {
    await apiCall('/api/admin/adoptions/' + id + '/approve', { method: 'POST' });
    showAlert('Adoção aprovada!', 'success');
    initAdminAdoptions();
  } catch (err) { showAlert(err.message, 'error'); }
}

async function rejectAdoption(id) {
  if (!confirm('Rejeitar esta adoção?')) return;
  try {
    await apiCall('/api/admin/adoptions/' + id + '/reject', { method: 'POST' });
    showAlert('Adoção rejeitada.', 'success');
    initAdminAdoptions();
  } catch (err) { showAlert(err.message, 'error'); }
}

// =============================================
// MENSAGENS DE CONTATO
// =============================================

async function initAdminMessages() {
  try {
    _allMessages = await apiCall('/api/contact');
    renderMessages(_allMessages, 'all');
  } catch (err) {
    document.getElementById('admin-messages').innerHTML =
      '<div class="empty-message"><span>📭</span><p>Erro ao carregar mensagens.</p></div>';
  }
}

function filterMessages(filter) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderMessages(_allMessages, filter);
}

function renderMessages(messages, filter) {
  const container = document.getElementById('admin-messages');
  const filtered = filter === 'all'   ? messages
                 : filter === 'unread' ? messages.filter(m => !m.read)
                 : messages.filter(m => m.read);

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-message"><span>📭</span><p>Nenhuma mensagem${filter !== 'all' ? ' nesta categoria' : ''}.</p></div>`;
    return;
  }

  container.innerHTML = '<table>' +
    '<thead><tr><th>Status</th><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Mensagem</th><th>Data</th><th>Ações</th></tr></thead><tbody>' +
    filtered.map(c => `
      <tr id="msg-row-${c.id}" style="${!c.read ? 'font-weight:600;background:#fffbeb' : ''}">
        <td>${!c.read
          ? '<span class="badge badge-pending">Nova</span>'
          : '<span class="badge" style="background:#f1f5f9;color:#64748b">Lida</span>'}</td>
        <td>${c.name}</td>
        <td>${c.email}</td>
        <td>${c.phone || '-'}</td>
        <td style="max-width:280px">
          <span id="msg-preview-${c.id}">${c.message.length > 60 ? c.message.slice(0,60) + '…' : c.message}</span>
          ${c.message.length > 60 ? `<button onclick="toggleMessage(${c.id}, ${JSON.stringify(c.message).replace(/"/g,'&quot;')})" class="btn btn-secondary btn-sm" style="margin-left:6px;padding:2px 8px">Ver</button>` : ''}
        </td>
        <td style="white-space:nowrap">${new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
        <td style="white-space:nowrap">
          ${!c.read ? `<button class="btn btn-primary btn-sm" onclick="markRead(${c.id}, this)">Marcar lida</button> ` : ''}
          <button class="btn btn-danger btn-sm" onclick="deleteMessage(${c.id})">Excluir</button>
        </td>
      </tr>
    `).join('') +
    '</tbody></table>';
}

function toggleMessage(id, fullText) {
  const span = document.getElementById('msg-preview-' + id);
  const btn = span.nextElementSibling;
  if (btn.textContent === 'Ver') {
    span.textContent = fullText;
    btn.textContent = 'Recolher';
  } else {
    span.textContent = fullText.slice(0, 60) + '…';
    btn.textContent = 'Ver';
  }
}

async function markRead(id, btn) {
  try {
    await apiCall('/api/contact/' + id + '/read', { method: 'POST' });
    // Atualiza localmente sem recarregar tudo
    const msg = _allMessages.find(m => m.id === id);
    if (msg) msg.read = 1;
    const row = document.getElementById('msg-row-' + id);
    if (row) {
      row.style.fontWeight = '';
      row.style.background = '';
      row.cells[0].innerHTML = '<span class="badge" style="background:#f1f5f9;color:#64748b">Lida</span>';
      btn.remove();
    }
  } catch (err) {
    showAlert('Erro ao marcar mensagem.', 'error');
  }
}

async function deleteMessage(id) {
  if (!confirm('Excluir esta mensagem?')) return;
  try {
    await apiCall('/api/contact/' + id + '/delete', { method: 'POST' });
    _allMessages = _allMessages.filter(m => m.id !== id);
    const row = document.getElementById('msg-row-' + id);
    if (row) row.remove();
    showAlert('Mensagem excluída.', 'success');
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

    container.innerHTML = `
      <div class="form-container mb-20">
        <h2 class="mb-20">Editar Informações</h2>
        <form id="place-form">
          <div class="form-group"><label>Nome do Local:</label><input type="text" id="place-name" value="${place.name || ''}"></div>
          <div class="form-group"><label>Endereço:</label><input type="text" id="place-address" value="${place.address || ''}"></div>
          <div class="form-group"><label>Telefone:</label><input type="text" id="place-phone" value="${place.phone || ''}"></div>
          <div class="form-group"><label>Email:</label><input type="email" id="place-email" value="${place.email || ''}"></div>
          <div class="form-group"><label>Descrição:</label><textarea id="place-description">${place.description || ''}</textarea></div>
          <div class="form-group"><label>Facebook (URL):</label><input type="text" id="place-facebook" value="${place.facebook || ''}"></div>
          <div class="form-group"><label>Instagram (URL):</label><input type="text" id="place-instagram" value="${place.instagram || ''}"></div>
          <div class="form-group"><label>WhatsApp (URL):</label><input type="text" id="place-whatsapp" value="${place.whatsapp || ''}"></div>
          <button type="submit" class="btn btn-primary">Salvar Informações</button>
        </form>
      </div>
      <div class="form-container">
        <h2 class="mb-20">Fotos do Local</h2>
        <form id="place-photo-form" class="mb-20">
          <div class="form-group"><label>Adicionar Foto:</label><input type="file" id="place-photo" name="photo" accept="image/*"></div>
          <div class="form-group"><label>Legenda (opcional):</label><input type="text" id="place-caption" name="caption"></div>
          <button type="submit" class="btn btn-success">Enviar Foto</button>
        </form>
        ${photos.length > 0
          ? `<div class="photo-grid">${photos.map(p => `
              <div class="photo-item">
                <img src="${p.photo}" alt="${p.caption || ''}">
                <button class="photo-delete" onclick="deletePlacePhoto(${p.id})" title="Excluir">&times;</button>
              </div>`).join('')}</div>`
          : '<p class="text-center">Nenhuma foto adicionada.</p>'}
      </div>`;

    document.getElementById('place-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const result = await apiCall('/api/admin/place', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:        document.getElementById('place-name').value,
            address:     document.getElementById('place-address').value,
            phone:       document.getElementById('place-phone').value,
            email:       document.getElementById('place-email').value,
            description: document.getElementById('place-description').value,
            facebook:    document.getElementById('place-facebook').value,
            instagram:   document.getElementById('place-instagram').value,
            whatsapp:    document.getElementById('place-whatsapp').value
          })
        });
        showAlert(result.message, 'success');
      } catch (err) { showAlert(err.message, 'error'); }
    });

    document.getElementById('place-photo-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch('/api/admin/place/photo', { method: 'POST', body: new FormData(e.target) });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        showAlert(result.message, 'success');
        initAdminPlace();
      } catch (err) { showAlert(err.message, 'error'); }
    });
  } catch (err) {
    container.innerHTML = '<p>Erro ao carregar informações do local.</p>';
  }
}

async function deletePlacePhoto(id) {
  if (!confirm('Excluir esta foto?')) return;
  try {
    await apiCall('/api/admin/place/photo/' + id + '/delete', { method: 'POST' });
    showAlert('Foto removida!', 'success');
    initAdminPlace();
  } catch (err) { showAlert(err.message, 'error'); }
}
