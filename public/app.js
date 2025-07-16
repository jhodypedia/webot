const API_BASE = 'https://j22stream-production.up.railway.app'; // Ganti dengan URL backend kamu

async function fetchVideos() {
  try {
    const res = await fetch(`${API_BASE}/api/videos`);
    const videos = await res.json();

    const container = document.getElementById('videos');
    container.innerHTML = '';

    videos.forEach(video => {
      const col = document.createElement('div');
      col.className = 'col-md-4';

      col.innerHTML = `
        <div class="card-video">
          <img src="${video.thumbnail}" alt="${video.title}" class="video-thumb" />
          <h5 class="mt-2">${video.title}</h5>
          <button class="btn btn-light btn-sm btn-play" onclick="playVideo('${video.file_id}')">
            <i class="fa-solid fa-play"></i> Tonton
          </button>
        </div>
      `;

      container.appendChild(col);
    });
  } catch (err) {
    alert("Gagal memuat video!");
    console.error(err);
  }
}

function playVideo(file_id) {
  const video = document.getElementById('videoPlayer');
  video.src = `${API_BASE}/api/stream/${file_id}`;
  const modal = new bootstrap.Modal(document.getElementById('playModal'));
  modal.show();
}

fetchVideos();
