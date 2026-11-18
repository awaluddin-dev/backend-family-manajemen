# Family Management Backend

Backend REST API untuk **Family Management** — sebuah platform manajemen privat yang dibangun khusus untuk kebutuhan keluarga secara mandiri, aman, dan fleksibel untuk terus dikembangkan sesuai kebutuhan pribadi di masa mendatang.

---

## 📌 Latar Belakang & Tujuan

Proyek ini dibangun atas dasar kebutuhan akan aplikasi manajemen privat khusus untuk keluarga sendiri. Dengan membangun versi sendiri dari awal:
- **Privasi Penuh**: Data keluarga tersimpan aman di server dan database milik sendiri.
- **Dapat Dikembangkan Bebas**: Fitur dapat disesuaikan dan diperluas sewaktu-waktu sesuai kebutuhan spesifik keluarga (keuangan, jadwal, tugas harian, inventaris, dan lainnya).
- **Arsitektur Rapi & Skalabel**: Menerapkan *Clean Architecture* sehingga penambahan fitur baru di masa depan terisolasi dengan baik dan mudah dirawat.

---

## 🚀 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (ESM, NodeNext)
- **Database & ORM**: PostgreSQL & [`@nestjs/drizzle`](https://docs.nestjs.com/data/drizzle) (Drizzle ORM)
- **In-Memory Store**: [Redis](https://redis.io/) (`ioredis`) untuk session management, penyimpanan refresh token (7 hari), rotasi token, dan blacklist/revocation.
- **Autentikasi**: Dual JWT (*Access Token* 15 menit & *Refresh Token* 7 hari dengan token rotation)
- **Bot/Brute-force Protection**: [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) CAPTCHA pada endpoint login.
- **Validasi**: `class-validator` & `class-transformer` via Global `ValidationPipe`.
- **Testing**: [Vitest](https://vitest.dev/) untuk unit & E2E testing.
- **Linter**: [Oxlint](https://oxc.rs/) (Fast TypeScript-aware linting).

---

## 🏛️ Clean Architecture Structure

Struktur folder mengadopsi prinsip *Clean Architecture* (*Separation of Concerns* & *Dependency Inversion*):

```text
src/
├── domain/                                  # Lapisan Bisnis Inti (Enterprise Rules)
│   ├── entities/
│   │   └── user.entity.ts                   # Domain Entity User
│   ├── repositories/
│   │   ├── user.repository.interface.ts    # Port interface IUserRepository
│   │   └── token.repository.interface.ts   # Port interface ITokenRepository (Redis)
│   └── services/
│       └── captcha.service.interface.ts    # Port interface ICaptchaService
│
├── application/                             # Lapisan Use Cases & DTOs
│   ├── dto/
│   │   └── auth/
│   │       ├── signup.dto.ts                # DTO Registrasi
│   │       ├── login.dto.ts                 # DTO Login (termasuk captchaToken)
│   │       ├── refresh-token.dto.ts         # DTO Refresh Token
│   │       └── auth-response.dto.ts         # DTO Response Profil & Token
│   └── use-cases/
│       └── auth/
│           ├── signup.use-case.ts           # Logika pendaftaran akun baru
│           ├── login.use-case.ts            # Verifikasi captcha, kredensial, & generate token
│           ├── refresh-token.use-case.ts    # Validasi Redis & token rotation
│           ├── logout.use-case.ts           # Revokasi refresh token dari Redis
│           └── auth.use-cases.spec.ts       # Unit tests (Vitest)
│
├── infrastructure/                          # Lapisan Framework, Database, & Tools Eksternal
│   ├── database/
│   │   └── drizzle/
│   │       ├── drizzle.module.ts            # Konfigurasi @nestjs/drizzle
│   │       ├── database-bootstrap.service.ts# Lifecycle hook inisialisasi tabel
│   │       └── schema/
│   │           └── users.schema.ts          # Schema Drizzle PostgreSQL
│   ├── redis/
│   │   ├── redis.module.ts                  # Modul Redis
│   │   └── redis.provider.ts                # Provider koneksi Redis IoRedis
│   ├── security/
│   │   ├── hashing.service.ts               # Bcrypt password hashing
│   │   ├── token.service.ts                 # JWT signing (Access & Refresh)
│   │   └── turnstile.service.ts             # Cloudflare Turnstile verification adapter
│   ├── repositories/
│   │   ├── drizzle-user.repository.ts       # Implementasi IUserRepository via Drizzle
│   │   └── redis-token.repository.ts        # Implementasi ITokenRepository via Redis
│   ├── guards/
│   │   └── jwt-auth.guard.ts                # Guard otentikasi Bearer Access Token
│   └── decorators/
│       └── current-user.decorator.ts        # Decorator @CurrentUser()
│
├── presentation/                            # Lapisan Antarmuka REST API
│   └── controllers/
│       └── auth.controller.ts               # Endpoint /auth/*
│
├── auth.module.ts                           # Modul integrasi autentikasi
├── app.module.ts                            # Root Application Module
└── main.ts                                  # Entry point aplikasi
```

---

## 🔐 Mekanisme Autentikasi

1. **Dual Token**:
   - **Access Token**: Berumur pendek (15 menit) untuk mengakses endpoint terlindungi.
   - **Refresh Token**: Berumur panjang (**7 hari**) yang disimpan di Redis dengan TTL 7 hari (`604800` detik).
2. **Token Rotation**:
   - Setiap kali client memanggil `/auth/refresh`, refresh token lama dihapus dari Redis dan diganti dengan pasangan token baru.
   - Mencegah *replay attack* atau penyalahgunaan token yang telah dicuri.
3. **Revocation & Logout**:
   - Saat logout (`POST /auth/logout`), token langsung dihapus dari Redis, sehingga tidak lagi dapat digunakan meskipun belum melewati masa 7 hari.
4. **Cloudflare Turnstile CAPTCHA**:
   - Endpoint login mewajibkan `captchaToken` yang diverifikasi ke server Cloudflare (`https://challenges.cloudflare.com/turnstile/v0/siteverify`).

---

## 📡 Daftar Endpoint REST API

| Method | Endpoint | Keterangan | Header / Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | Pendaftaran akun pengguna baru | - |
| `POST` | `/auth/login` | Login dengan verifikasi Cloudflare Turnstile | - |
| `POST` | `/auth/refresh` | Perbarui Access Token & Refresh Token (rotasi) | - |
| `POST` | `/auth/logout` | Revokasi session / refresh token | `Bearer <accessToken>` |
| `GET` | `/auth/me` | Mengambil profil user yang sedang login | `Bearer <accessToken>` |

### Contoh Request & Response

#### 1. Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "Nama Anggota Keluarga",
  "email": "keluarga@example.com",
  "password": "PasswordKuat123!"
}
```

#### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "keluarga@example.com",
  "password": "PasswordKuat123!",
  "captchaToken": "<TOKEN_DARI_CLOUDFLARE_TURNSTILE>"
}
```

#### 3. Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "<REFRESH_TOKEN_7_HARI>"
}
```

#### 4. Protected Route (`/auth/me`)
```http
GET /auth/me
Authorization: Bearer <ACCESS_TOKEN>
```

---

## ⚙️ Konfigurasi Environment (`.env`)

Buat file `.env` di root project dengan menyalin dari `.env.example`:

```bash
cp .env.example .env
```

Contoh konfigurasi:
```env
PORT=3000
DATABASE_URL=postgres://admin:password123@localhost:5432/my_database
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
JWT_ACCESS_SECRET=your_jwt_access_secret_key_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_REFRESH_EXPIRES_IN=7d
CLOUDFLARE_TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

> **Catatan Turnstile**: Key `1x0000000000000000000000000000000AA` adalah dummy secret key resmi dari Cloudflare untuk keperluan testing/development lokal (selalu lolos validasi). Untuk production, ganti dengan Secret Key dari dashboard Cloudflare Anda.

---

## 🛠️ Instalasi & Menjalankan Project

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Jalankan PostgreSQL & Redis
Pastikan PostgreSQL dan Redis aktif di mesin lokal atau jalankan via Docker.

### 3. Jalankan Aplikasi
```bash
# Development (watch mode)
pnpm run start:dev

# Build & Run Production
pnpm run build
pnpm run start:prod
```

### 4. Menjalankan Tes & Linter
```bash
# Unit Tests (Vitest)
pnpm run test

# Linting (Oxlint)
pnpm run lint

# Formatting (Prettier)
pnpm run format
```

---

## 📄 Lisensi
Private / Personal Project.
