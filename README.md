# Birthday Gift Interactive Web App

Aplikasi web interaktif untuk kado ulang tahun dengan 2 mode utama:

## 🎮 Mode Game (5 Tahapan)
1. **Teka-teki** - Jawab riddle untuk membuka pintu
2. **Buka Amplop** - Interaksi amplop virtual
3. **Memory Game** - Game mencocokkan tanggal
4. **Tiup Lilin** - Simulasi tiup lilin kue
5. **Pesan Akhir** - Form pembuatan kartu ucapan dengan fitur share

## � Mode Kartu Custom (BARU!)
- **URL Custom** - Buat link personal `namateman.domain.com`
- **Drag & Drop Editor** - Atur posisi foto dan teks sesuka hati
- **Full Customization** - Edit ukuran, posisi, dan konten kartu
- **Instant Share** - Bagikan kartu dengan link custom

## � Fitur Utama

- ✨ Animasi halus dengan Framer Motion
- 🎵 Background music dan sound effects
- 🎮 Mini game interaktif
- 📱 Responsive design untuk mobile & desktop
- 🔗 **URL Custom** - Link personal untuk kartu ucapan
- 🎨 **Drag & Drop Editor** - Edit posisi elemen kartu
- 💾 Progress saving dengan localStorage
- 🖼️ **Image Upload** - Upload foto untuk kartu
- 📝 **Text Customization** - Atur ukuran dan posisi teks
- 🌐 **Instant Share** - Share langsung ke social media

## 📋 Persyaratan

- Node.js 16+ 
- npm atau yarn
- Supabase account (untuk fitur share)

## 🛠️ Instalasi

1. Clone repository:
```bash
git clone <repository-url>
cd happybirthday1
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
```

4. Konfigurasi Supabase:
   - Buat project baru di [Supabase Dashboard](https://supabase.com)
   - Dapatkan URL dan Anon Key dari Settings > API
   - Isi file `.env` dengan:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

5. Setup database:
   - Buka Supabase SQL Editor
   - Run script dari file `database-setup.sql`
   - Atau copy paste SQL berikut:
     ```sql
     CREATE TABLE IF NOT EXISTS birthday_cards (
       id TEXT PRIMARY KEY,
       username TEXT UNIQUE NOT NULL,
       recipient TEXT,
       sender TEXT,
       message TEXT,
       image_url TEXT,
       image_position JSONB DEFAULT '{"x": 50, "y": 20}',
       text_position JSONB DEFAULT '{"x": 50, "y": 70}',
       image_scale DECIMAL(3,2) DEFAULT 1.0,
       text_size TEXT DEFAULT 'text-lg',
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     );
     ```
   - Buat storage bucket `birthday-cards` untuk upload gambar

6. Jalankan development server:
```bash
npm run dev
```

## 📁 Struktur Proyek

```
src/
├── components/
│   ├── Cake.jsx          # Komponen kue & lilin
│   ├── CardEditor.jsx    # NEW: Drag & drop editor untuk kartu custom
│   ├── Envelope.jsx      # Komponen amplop interaktif
│   ├── FinalMessage.jsx  # Form pesan akhir & share
│   ├── MemoryGame.jsx    # Game memory card
│   ├── RiddleGate.jsx    # Teka-teki pembuka
│   ├── ShareCard.jsx     # NEW: View untuk kartu custom URL
│   └── ShareView.jsx     # View untuk shared cards (old format)
├── lib/
│   └── supabaseClient.js # Supabase client configuration
├── App.jsx               # Main application component
├── main.jsx              # Entry point
└── index.css             # Global styles & animations
```

## 🎮 Cara Penggunaan

### Mode Game (Original)
1. **Teka-teki**: Jawab "kamu" pada pertanyaan untuk melanjutkan
2. **Amplop**: Klik tombol untuk membuka amplop virtual
3. **Memory Game**: Cocokkan semua pasangan tanggal yang sama
4. **Tiup Lilin**: Klik tombol untuk tiup lilin kue
5. **Pesan Akhir**: Isi form dan buat link share kartu ucapan

### Mode Kartu Custom (BARU!)
1. **Buka Halaman Utama**: Pilih "Buat Kartu Custom"
2. **Input Custom URL**: Masukkan username (contoh: `nama-teman`)
3. **Edit Kartu**: 
   - Upload foto
   - Drag & drop posisi foto dan teks
   - Atur ukuran teks dan foto
   - Edit pesan personal
4. **Share**: Dapatkan link custom `domain.com/nama-teman`

## 🔧 Konfigurasi

### Environment Variables
- `VITE_SUPABASE_URL`: URL project Supabase
- `VITE_SUPABASE_ANON_KEY`: Anonymous key dari Supabase

### Supabase Setup
1. Buat project baru di Supabase
2. Create table `birthday_cards`
3. Create storage bucket `birthday-cards`
4. Set RLS policies untuk akses publik

## 🐛 Troubleshooting

### Audio tidak berfungsi?
- Pastikan browser mendukung Web Audio API
- Cek console untuk error message
- Beberapa browser memerlukan user interaction sebelum memutar audio

### Gambar tidak muncul?
- Cek koneksi internet
- Pastikan URL gambar eksternal accessible
- Gambar akan otomatis diganti dengan placeholder jika gagal dimuat

### Fitur share tidak berfungsi?
- Pastikan Supabase sudah dikonfigurasi dengan benar
- Cek environment variables di file `.env`
- Pastikan bucket storage sudah dibuat

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## 📄 License

MIT License

## 🙏 Credits

- Framer Motion untuk animasi
- Tailwind CSS untuk styling
- Howler.js untuk audio management
- Supabase untuk backend & storage
- Mixkit untuk sound effects

---

**Note**: Aplikasi ini menggunakan gambar dan audio eksternal. Pastikan koneksi internet stabil untuk pengalaman terbaik.
