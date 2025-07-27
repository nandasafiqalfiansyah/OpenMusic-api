# 🎵 OpenMusic API

OpenMusic API adalah backend RESTful API untuk mengelola data musik seperti album, lagu, user, dan playlist. Proyek ini dibangun menggunakan Node.js dengan framework Hapi.js dan PostgreSQL sebagai basis data.

## 🚀 Teknologi yang Digunakan

- [Node.js](https://nodejs.org/)
- [Hapi.js](https://hapi.dev/)
- [PostgreSQL](https://www.postgresql.org/)
- [node-pg-migrate](https://salsita.github.io/node-pg-migrate/)
- [JWT Authentication](https://jwt.io/)
- [Joi](https://joi.dev/) (validasi)
- [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/) (linting & formatting)

## 🛠️ Cara Instalasi

### 1. Clone Repository

```bash
cd openmusic-api
````

### 2. Install Dependency

```bash
npm install
```

### 3. Konfigurasi Environment

Buat file `.env` di root proyek:

```bash
cp .env.example .env
```

Lalu isi file `.env` sesuai kebutuhan:

```
HOST=localhost
PORT=5000

PGUSER=your_db_user
PGHOST=localhost
PGPASSWORD=your_db_password
PGDATABASE=openmusic
PGPORT=5432

ACCESS_TOKEN_KEY=your_super_secret_key
REFRESH_TOKEN_KEY=your_refresh_secret_key
ACCESS_TOKEN_AGE=1800
```

### 4. Setup Database (Migration)

Pastikan PostgreSQL sudah aktif, lalu jalankan migrasi:

```bash
npm run migrate
```

> Jika ingin rollback:

```bash
npm run migrate:down
```

> Jika ingin reset (semua turun dan naik ulang):

```bash
npm run migrate:reset
```

---

## 🧪 Menjalankan Project

### Untuk Development (dengan auto-reload)

```bash
npm run dev
```

### Untuk Production

```bash
npm start
```

## ✅ Menjalankan Testing

```bash
npm test
```

## 🧹 Linting dan Formatting

### Lint:

```bash
npm run lint
```

### Perbaiki otomatis:

```bash
npm run lint:fix
```

### Format kode dengan Prettier:

```bash
npm run format
```

---

## 📁 Struktur Direktori

```
src/
├── api/
│   └── albums/
│   └── songs/
├── services/
├── utils/
├── validations/
├── server.js
migrations/
.env
```

---

## 📄 Lisensi

[MIT License](LICENSE)

---

## 🙋 Kontribusi

Pull Request, issue, dan saran sangat diterima. Yuk bantu kembangkan OpenMusic API menjadi lebih baik!

---

```

Kalau kamu ingin aku bantu buatin `README.md` ini ke file langsung atau masukkan beberapa logo dan badge (seperti CI/CD, Build Passing, dll), tinggal bilang saja ya!
```
