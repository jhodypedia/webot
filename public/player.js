fetch('/api/videos')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('video-list');
    container.innerHTML = '';

    if (data.length === 0) {
      toastr.warning('Belum ada video tersedia.');
      return;
    }

    data.forEach(video => {
      const col = document.createElement('div');
      col.className = 'col-md-4';

      const card = document.createElement('div');
      card.className = 'video-card card bg-dark text-white';

      card.innerHTML = `
        <img src="${video.thumbnail}" class="card-img-top" alt="${video.title}">
        <div class="card-body">
          <h5 class="card-title text-center">${video.title}</h5>
        </div>
      `;

      card.onclick = () => {
        container.innerHTML = `
          <div class="video-player">
            <video controls autoplay width="100%">
              <source src="/api/stream?file_id=${video.file_id}" type="video/mp4">
              Browser tidak mendukung video.
            </video>
            <h2 class="text-center mt-3">${video.title}</h2>
            <div class="text-center mt-3">
              <button class="btn btn-secondary" onclick="location.reload()">
                <i class="fa-solid fa-arrow-left"></i> Kembali ke daftar
              </button>
            </div>
          </div>
        `;
        toastr.success(`Memutar: ${video.title}`);
      };

      col.appendChild(card);
      container.appendChild(col);
    });
  })
  .catch(err => {
    toastr.error("Gagal memuat video.");
    console.error(err);
  });
