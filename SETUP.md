# Setup Guide - Birthday Card App

## 🎯 Overview
Aplikasi ini memungkinkan kamu membuat kartu ucapan ulang tahun dengan URL custom seperti:
- `yourdomain.com/amelia-18`
- `yourdomain.com/budi-ultah-2024`

## 🚀 Quick Start

### 1. Deploy ke Vercel
1. Push code ke GitHub
2. Connect ke Vercel
3. Environment variables (lihat step 3 di bawah)

### 2. Setup Supabase (Wajib untuk fitur persisten)

#### A. Buat Project
1. Buka [supabase.com](https://supabase.com)
2. Buat project baru
3. Copy **Project URL** dan **Anon Key** dari Settings > API

#### B. Setup Database
1. Buka SQL Editor di Supabase Dashboard
2. Copy-paste isi file `supabase_setup.sql`
3. Run SQL

#### C. Setup Storage
1. Buka Storage di sidebar
2. Buat bucket baru: `birthday-cards`
3. Set public access: ON
4. Copy bucket URL untuk environment variable

### 3. Environment Variables (Vercel)

Tambahkan di Vercel Project Settings > Environment Variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Redeploy
Setelah setup environment variables, redeploy project.

## 📱 Cara Penggunaan

### Membuat Kartu:
1. Buka halaman utama
2. Masukkan username (contoh: `amelia-18`)
3. Isi nama penerima, pesan, dan foto (opsional)
4. Klik "Buat & Buka Kartu"
5. Share link: `yourdomain.com/amelia-18`

### Melihat Kartu:
1. Buka link yang dibuat
2. Kartu akan tampil dengan animasi
3. Bisa share langsung ke WhatsApp, Instagram, dll

## 🎨 Features

### ✅ Sudah Ada:
- URL custom (username-based)
- Upload foto
- Pesan editable
- Animasi confetti
- Share button
- Responsive design
- Fallback localStorage
- Preview sebelum create

### 🔧 File Structure:
```
src/
├── components/
│   ├── CreateCard.jsx    # Form pembuatan kartu
│   └── ViewCard.jsx      # Tampilan kartu
├── lib/
│   └── supabaseClient.js # Config Supabase
├── App.jsx               # Main app & routing
└── index.css            # Styles
```

## 🔧 Troubleshooting

### "Supabase belum dikonfigurasi"
- Pastikan environment variables sudah di-set di Vercel
- Redeploy setelah set environment variables

### Kartu tidak tersimpan:
- Cek browser console untuk error
- Pastikan Supabase table sudah dibuat
- Cek RLS policies (Row Level Security)

### Foto tidak upload:
- Cek storage bucket `birthday-cards` sudah ada
- Pastikan bucket public access ON
- Cek CORS settings di Supabase

## 📝 Notes

- **Username harus unique** - jika username sudah dipakai, kartu lama akan di-update
- **Foto opsional** - kartu bisa dibuat tanpa foto
- **LocalStorage fallback** - jika Supabase error, data tersimpan di browser
- **URL case-sensitive** - `Amelia` dan `amelia` dianggap berbeda

## 🎉 Selamat!
Aplikasi sudah siap digunakan! 🎂
