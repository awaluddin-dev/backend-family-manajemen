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
- **Task Scheduling**: [`@nestjs/schedule`](https://docs.nestjs.com/application/task-scheduling) untuk cron job eksekusi auto-income/outcome harian.
- **Autentikasi**: Dual JWT (*Access Token* 15 menit & *Refresh Token* 7 hari dengan token rotation).
- **Bot/Brute-force Protection**: [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) CAPTCHA pada endpoint login.
- **Validasi**: `class-validator` & `class-transformer` via Global `ValidationPipe`.
- **Testing**: [Vitest](https://vitest.dev/) untuk unit & E2E testing.
- **Linter**: [Oxlint](https://oxc.rs/) (Fast TypeScript-aware linting).

---

## 🏛️ Clean Architecture Structure

```text
src/
├── domain/                                  # Lapisan Bisnis Inti (Entities & Ports)
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── wallet.entity.ts                 # Dompet / Rekening sumber dana
│   │   ├── category.entity.ts               # Kategori transaksi
│   │   ├── tax-config.entity.ts             # Konfigurasi pajak acuan
│   │   ├── recurring-schedule.entity.ts     # Jadwal rutin & rincian komponen
│   │   └── cashflow-transaction.entity.ts   # Transaksi riil income/outcome
│   └── repositories/
│       ├── user.repository.interface.ts
│       ├── token.repository.interface.ts
│       ├── wallet.repository.interface.ts
│       ├── category.repository.interface.ts
│       ├── tax-config.repository.interface.ts
│       ├── recurring-schedule.repository.interface.ts
│       └── cashflow-transaction.repository.interface.ts
│
├── application/                             # Lapisan Use Cases & DTOs
│   ├── dto/
│   │   ├── auth/ (signup, login, refresh)
│   │   ├── wallet/ (create-wallet)
│   │   ├── category/ (create-category)
│   │   ├── tax-config/ (create-tax-config)
│   │   ├── income/ (record-manual-income, create-auto-income)
│   │   ├── outcome/ (record-manual-outcome, preview-tax, create-auto-outcome)
│   │   └── cashflow/ (cashflow-filter)
│   └── use-cases/
│       ├── auth/ (signup, login, refresh, logout)
│       ├── wallet/ (create-wallet, get-wallets)
│       ├── category/ (create-category, get-categories)
│       ├── tax-config/ (create-tax-config, get-tax-configs)
│       ├── income/
│       │   ├── record-manual-income.use-case.ts
│       │   ├── create-auto-income-schedule.use-case.ts
│       │   └── simulate-annual-income.use-case.ts
│       ├── outcome/
│       │   ├── calculate-tax-preview.use-case.ts
│       │   ├── record-manual-outcome.use-case.ts
│       │   └── create-auto-outcome-schedule.use-case.ts
│       └── cashflow/
│           ├── get-cashflow-transactions.use-case.ts
│           ├── get-cashflow-summary.use-case.ts
│           └── process-due-recurring-schedules.use-case.ts
│
├── infrastructure/                          # Framework, Database & Third-party
│   ├── database/drizzle/
│   │   ├── drizzle.module.ts
│   │   ├── database-bootstrap.service.ts
│   │   └── schema/ (users, wallets, categories, tax-configs, recurring, cashflow)
│   ├── redis/ (redis.module, redis.provider)
│   ├── security/ (hashing, token, turnstile)
│   ├── repositories/ (Drizzle & Redis implementations)
│   ├── scheduler/ (cashflow-cron.service.ts)
│   ├── guards/ (jwt-auth.guard.ts)
│   └── decorators/ (current-user.decorator.ts)
│
├── presentation/                            # REST API Controllers
│   └── controllers/
│       ├── auth.controller.ts
│       ├── wallet.controller.ts             # /wallets
│       ├── category.controller.ts           # /categories
│       ├── tax-config.controller.ts         # /tax-configs
│       ├── income.controller.ts             # /cashflow/incomes
│       ├── outcome.controller.ts            # /cashflow/outcomes
│       └── cashflow.controller.ts           # /cashflow
│
├── auth.module.ts
├── cashflow.module.ts
├── app.module.ts
└── main.ts
```

---

## 💰 Fitur Cashflow (Income & Outcome)

### 1. Dompet / Rekening Sumber Dana (`/wallets`)
- Mencatat berbagai rekening dan tempat penyimpanan dana: Bank (BCA, Mandiri, dll), E-Wallet (GoPay, OVO), Kas Tunai (*Cash*), atau Poin Hadiah.
- Setiap pemasukan menambah saldo rekening secara otomatis, dan pengeluaran memotong saldo rekening tujuan.

### 2. Pemasukan (Income)
- **Manual Income**: Pemasukan insidental atau harian (misal claim poin harian, freelance, hadiah) lengkap dengan tanggal, sumber, dan penerima manfaat (*forMember*).
- **Auto Income**: Pemasukan rutin bulanan (seperti gaji) dengan rincian slip gaji (*allowances* seperti gaji pokok & tunjangan, serta *deductions* seperti potongan PPh 21 & BPJS).
- **Simulasi 1 Tahun**: Endpoint kalkulasi proyeksi pendapatan 12 bulan beserta estimasi THR.

### 3. Pengeluaran (Outcome)
- **Kalkulasi Pajak (PPN Prediksi vs Realita)**: Sistem menyediakan kalkulasi PPN otomatis (misal 11%), dengan fleksibilitas pengguna memasukkan nominal pajak riil sesuai struk belanja.
- **Detail Belanja**: Menyimpan kanal belanja (`ONLINE` / `OFFLINE`), tujuan (misal: "Baju Lebaran"), anggota keluarga yang dibelanjakan (*forMember*, misal: "Anak 1"), dan nama toko/merchant (misal: "Shopee").
- **Auto Outcome**: Pengeluaran rutin otomatis seperti tagihan bulanan atau langganan.

### 4. Ringkasan & Laporan Cashflow (`/cashflow/summary`)
- Total Pemasukan, Total Pengeluaran, dan Arus Kas Bersih (*Net Cashflow*).
- Total Likuiditas Kas Keluarga di seluruh dompet/rekening.
- Distribusi pengeluaran per kategori (persentase).
- Distribusi pemasukan & pengeluaran per anggota keluarga (*By Who*).
- Perbandingan pengeluaran kanal `ONLINE` vs `OFFLINE`.

---

## 📡 Daftar Endpoint REST API

### Autentikasi
| Method | Endpoint | Keterangan | Header / Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | Registrasi akun keluarga | - |
| `POST` | `/auth/login` | Login + validasi Turnstile Captcha | - |
| `POST` | `/auth/refresh` | Rotasi token (Refresh Token 7 hari) | - |
| `POST` | `/auth/logout` | Revokasi session dari Redis | `Bearer <accessToken>` |
| `GET` | `/auth/me` | Profil user aktif | `Bearer <accessToken>` |

### Dompet, Kategori, & Pajak
| Method | Endpoint | Keterangan | Header / Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/wallets` | Buat dompet/rekening baru | `Bearer <accessToken>` |
| `GET` | `/wallets` | Ambil daftar dompet & saldo | `Bearer <accessToken>` |
| `POST` | `/categories` | Buat kategori transaksi baru | `Bearer <accessToken>` |
| `GET` | `/categories` | Ambil daftar kategori | `Bearer <accessToken>` |
| `POST` | `/tax-configs` | Buat konfigurasi pajak (misal PPN 11%) | `Bearer <accessToken>` |
| `GET` | `/tax-configs` | Ambil daftar konfigurasi pajak | `Bearer <accessToken>` |

### Cashflow
| Method | Endpoint | Keterangan | Header / Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/cashflow/incomes/manual` | Catat pemasukan manual (poin harian, dll) | `Bearer <accessToken>` |
| `POST` | `/cashflow/incomes/auto-schedule` | Buat jadwal auto gaji & rincian slip | `Bearer <accessToken>` |
| `GET` | `/cashflow/incomes/simulation/annual` | Simulasi proyeksi pendapatan 1 tahun + THR | `Bearer <accessToken>` |
| `POST` | `/cashflow/outcomes/preview-tax` | Preview prediksi pajak sebelum submit | `Bearer <accessToken>` |
| `POST` | `/cashflow/outcomes/manual` | Catat pengeluaran (PPN riil, online/offline, tujuan) | `Bearer <accessToken>` |
| `POST` | `/cashflow/outcomes/auto-schedule` | Buat jadwal pengeluaran rutin otomatis | `Bearer <accessToken>` |
| `GET` | `/cashflow/transactions` | Riwayat transaksi dengan filter lengkap | `Bearer <accessToken>` |
| `GET` | `/cashflow/summary` | Ringkasan cashflow, likuiditas, kategori, & member | `Bearer <accessToken>` |
| `POST` | `/cashflow/trigger-scheduler` | Trigger manual pemrosesan jadwal recurring | `Bearer <accessToken>` |

---

## 🛠️ Instalasi & Menjalankan Project

```bash
# 1. Install dependencies
pnpm install

# 2. Jalankan PostgreSQL & Redis
# (Pastikan database & redis aktif)

# 3. Jalankan aplikasi
pnpm run start:dev

# 4. Jalankan pengujian & linter
pnpm run test
pnpm run lint
```

---

## 📄 Lisensi
Private / Personal Project.
