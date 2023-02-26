# Tugas 1 IF3260 Grafika Komputer2D Web Based CAD (Computer-Aided Design)

## Anggota Kelompok
- 13520088 Rio Alexander Audino
- 13520095 Firizky Ardiansyah
- 13520107 Azka Syauqy Irsyad

## Deskripsi

2D Web-based CAD (Computer-Aided Design) yang menjadi persoalan pada tugas besar pertama mata kuliah Grafika Komputer adalah suatu website yang di dalamnya memiliki beberapa fungsionalitas dalam menggambar suatu model dalam bentuk dua dimensi, dimana fungsionalitas tersebut antara lain menggambar, mengedit, serta mengedit model berupa garis, persegi, persegi panjang, dan juga poligon pada suatu canvas yang mendukung webGL. Dalam implementasinya, ada pula fungsionalitas tambahan seperti menggerakan salah satu sudut model, menggerakan suatu model secara keseluruhan, memberikan warna pada titik sudut atau pada model yang ada, melakukan tranformasi geometri seperti rotasi dan dilatasi, menyimpan model yang ada pada canvas, serta dapat juga memuat ulang kembali pada canvas. Kelompok kami juga mengimplementasikan penggunaan convex hull pada poligon yang telah dibuat.

## Cara Penggunaan Program

- Membuat Line, Square, dan Rectangle
    - Klik tombol yang sesuai pada toolbar
    - Klik pada canvas untuk mulai menggambar
    - Klik lagi pada canvas untuk mengakhiri menggambar
- Membuat Polygon
    - Klik tombol yang sesuai pada toolbar
    - Pilih mode, apakah ingin convex hull atau tidak
    - Klik pada canvas untuk mulai menggambar
    - Klik kanvas untuk menambahkan titik
    - Klik kanan untuk mengakhiri menggambar
- Mengedit Line, Square, Rectangle, dan Polygon
    - Klik tombol select pada toolbar
    - Klik pada salah satu shape yang ada pada canvas
    - Atur hal yang ingin Anda ubah pada right-side panel, seperti mengubah letak, mengubah panjang/lebar, melakukan tranformasi geometri (rotasi, dilatasi), mengubah warna shape, dan lain-lain
    - Khusus polygon, dapat juga menambahkan titik pada canvas
- Mengedit Shape dengan Menggunakan Sudut
    - Klik tombol select pada toolbar
    - Klik pada salah satu shape yang ada pada canvas
    - Klik pada salah satu sudut yang ada pada shape
    - Atur hal yang ingin Anda lakukan pada right-side panel, seperti menggerakan titik sudut, mengubah warna titik sudut, dan khusus untuk polygon, dapat juga menghapus titik sudut pada canvas, serta lain-lain
- Memindahkan Shape pada Canvas
    - Klik tombol select pada toolbar
    - Klik pada salah satu shape yang ada pada canvas
    - Klik dan tahan pada shape yang sudah dipilih untuk menggerakan
- Menyimpan Model
    - Klik tombol paling kiri pada toolbar dan pilih export design
    - Masukkan nama file yang ingin disimpan
    - Klik tombol save
- Memuat Ulang Model
    - Klik tombol paling kiri pada toolbar dan pilih open design file
    - Pilih file yang ingin dimuat ulang
    - Klik tombol open