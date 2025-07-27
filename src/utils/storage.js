const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

const UPLOAD_DIR = path.resolve(__dirname, '..', 'uploads', 'covers');

// Pastikan folder upload ada & bisa ditulis
function ensureUploadDir() {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    fs.accessSync(UPLOAD_DIR, fs.constants.W_OK); // Test writable
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    try {
      fs.chmodSync(UPLOAD_DIR, 0o755);
    } catch (chmodErr) {
      console.error(
        'Gagal mengatur permission folder uploads:',
        chmodErr.message
      );
      throw new Error('Server tidak bisa mengakses folder uploads.');
    }
  }
}

async function uploadAlbumCover(albumId, file) {
  try {
    ensureUploadDir();

    // Validasi awal
    if (!file || typeof file.pipe !== 'function' || !file.hapi?.filename) {
      throw new Error('File tidak valid atau tidak berupa stream');
    }

    // Siapkan nama file aman
    const safeFilename = file.hapi.filename.replace(/[^\w.()-]/g, '_');
    const filename = `${nanoid(16)}-${safeFilename}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    console.log('Mulai upload file ke:', filepath);

    const fileStream = fs.createWriteStream(filepath);

    // Tambahkan timeout agar tidak menggantung
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Proses upload melebihi waktu maksimum 10 detik'));
      }, 10000); // 10 detik

      file.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      fileStream.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      fileStream.on('finish', () => {
        clearTimeout(timeout);
        resolve();
      });

      file.pipe(fileStream);
    });

    const coverUrl = `/covers/${filename}`;
    return coverUrl;
  } catch (error) {
    console.error('Error saat upload sampul:', error.message);
    throw new Error('Gagal mengunggah sampul album.');
  }
}

module.exports = { uploadAlbumCover };
