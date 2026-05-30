// ============================================
// JAVASCRIPT — Página pública do local
// Pessoa 9 é responsável por este arquivo
// ============================================

window.appReady.then(() => {
  const container = document.getElementById('place-info');
  if (container) loadPlaceInfo(container);
});

async function loadPlaceInfo(container) {
  try {
    const data = await apiCall('/api/place');
    const place = data.place;
    const photos = data.photos;

    if (!place) {
      container.innerHTML = '<p class="text-center">Informações não disponíveis.</p>';
      return;
    }

    let socialLinks = '';
    if (place.facebook) socialLinks += '<a href="' + place.facebook + '" target="_blank" class="btn btn-sm btn-primary">Facebook</a> ';
    if (place.instagram) socialLinks += '<a href="' + place.instagram + '" target="_blank" class="btn btn-sm btn-primary">Instagram</a> ';
    if (place.whatsapp) socialLinks += '<a href="' + place.whatsapp + '" target="_blank" class="btn btn-sm btn-success">WhatsApp</a> ';

    let photosHtml = '';
    if (photos.length > 0) {
      photosHtml = `
        <h2 class="mt-20 mb-10">Fotos do Local</h2>
        <div class="photo-grid">
          ${photos.map(p => '<img src="' + p.photo + '" alt="' + (p.caption || 'Foto do local') + '">').join('')}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="detail-info" style="max-width:800px;margin:0 auto">
        <h1>${place.name || 'Nosso Abrigo'}</h1>
        ${place.description ? '<p class="mt-10">' + place.description + '</p>' : ''}
        ${place.address ? '<p class="mt-10"><strong>Endereço:</strong> ' + place.address + '</p>' : ''}
        ${place.phone ? '<p><strong>Telefone:</strong> ' + place.phone + '</p>' : ''}
        ${place.email ? '<p><strong>Email:</strong> ' + place.email + '</p>' : ''}
        ${socialLinks ? '<div class="mt-10">' + socialLinks + '</div>' : ''}
      </div>
      ${photosHtml}
    `;
  } catch (err) {
    container.innerHTML = '<p class="text-center">Erro ao carregar informações.</p>';
  }
}
