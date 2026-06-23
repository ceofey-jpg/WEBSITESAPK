-- ============================================================================
-- SCHEMA DATABASE SISTEM MANAJEMEN SEKOLAH SMA NEGERI
-- ============================================================================
-- Dibuat: 2026-06-23
-- Database: school_management_system
-- Deskripsi: Skema lengkap dengan relasi untuk manajemen siswa, guru, kelas, 
--            absensi, nilai, pembayaran, jadwal, dan pengumuman
-- ============================================================================

-- ============================================================================
-- 1. TABEL ROLES (Peran/Hak Akses)
-- ============================================================================
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik peran',
  name VARCHAR(50) UNIQUE NOT NULL COMMENT 'Nama peran (Admin, Guru, Siswa, Orang Tua)',
  description TEXT COMMENT 'Deskripsi peran dan hak akses',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabel peran pengguna di sistem';

-- ============================================================================
-- 2. TABEL USERS (Pengguna Sistem)
-- ============================================================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik pengguna',
  username VARCHAR(100) UNIQUE NOT NULL COMMENT 'Username login',
  email VARCHAR(100) UNIQUE NOT NULL COMMENT 'Email pengguna',
  password_hash VARCHAR(255) NOT NULL COMMENT 'Hash password',
  full_name VARCHAR(100) NOT NULL COMMENT 'Nama lengkap',
  phone_number VARCHAR(20) COMMENT 'Nomor telepon',
  profile_photo LONGBLOB COMMENT 'Foto profil (data URL atau path)',
  address TEXT COMMENT 'Alamat pengguna',
  birth_date DATE COMMENT 'Tanggal lahir',
  id_number VARCHAR(50) COMMENT 'Nomor identitas (KTP/NISN)',
  role_id INT NOT NULL COMMENT 'Referensi ke tabel roles',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Status aktif pengguna',
  last_login DATETIME COMMENT 'Waktu login terakhir',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_role_id (role_id),
  KEY idx_email (email),
  KEY idx_username (username),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabel pengguna sistem (admin, guru, siswa, orang tua)';

-- ============================================================================
-- 3. TABEL DEPARTMENTS (Jurusan)
-- ============================================================================
CREATE TABLE departments (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik jurusan',
  name VARCHAR(100) UNIQUE NOT NULL COMMENT 'Nama jurusan (IPA, IPS, Bahasa)',
  code VARCHAR(20) UNIQUE NOT NULL COMMENT 'Kode jurusan',
  description TEXT COMMENT 'Deskripsi jurusan',
  head_id INT COMMENT 'Kepala jurusan (referensi ke users)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_head_id (head_id),
  FOREIGN KEY (head_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabel jurusan/program studi';

-- ============================================================================
-- 4. TABEL CLASSES (Kelas)
-- ============================================================================
CREATE TABLE classes (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik kelas',
  name VARCHAR(50) NOT NULL COMMENT 'Nama kelas (X IPA 1, XI IPS 2)',
  class_level VARCHAR(10) NOT NULL COMMENT 'Tingkat kelas (X, XI, XII)',
  department_id INT NOT NULL COMMENT 'Referensi ke tabel departments',
  homeroom_teacher_id INT COMMENT 'Wali kelas (referensi ke users)',
  academic_year VARCHAR(10) NOT NULL COMMENT 'Tahun akademik (2025/2026)',
  max_students INT DEFAULT 35 COMMENT 'Kapasitas maksimal siswa',
  room_number VARCHAR(20) COMMENT 'Nomor ruangan',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_class_year (name, academic_year),
  KEY idx_department_id (department_id),
  KEY idx_homeroom_teacher_id (homeroom_teacher_id),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (homeroom_teacher_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabel kelas/rombongan belajar';

-- ============================================================================
-- 5. TABEL TEACHERS (Guru)
-- ============================================================================
CREATE TABLE teachers (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik guru',
  user_id INT UNIQUE NOT NULL COMMENT 'Referensi ke tabel users',
  nip VARCHAR(20) UNIQUE NOT NULL COMMENT 'Nomor Induk Pegawai',
  specialization VARCHAR(100) COMMENT 'Keahlian/spesialisasi',
  certification_number VARCHAR(50) COMMENT 'Nomor sertifikasi pengajar',
  employment_status ENUM('PNS', 'Non-PNS', 'Honorer') DEFAULT 'Non-PNS' COMMENT 'Status kepegawaian',
  hire_date DATE NOT NULL COMMENT 'Tanggal mulai bekerja',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Status aktif guru',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabel guru';

-- ============================================================================
-- 6. TABEL SUBJECTS (Mata Pelajaran)
-- ============================================================================
CREATE TABLE subjects (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik mata pelajaran',
  name VARCHAR(100) NOT NULL COMMENT 'Nama mata pelajaran',
  code VARCHAR(20) UNIQUE NOT NULL COMMENT 'Kode mata pelajaran',
  description TEXT COMMENT 'Deskripsi mata pelajaran',
  credit_hours INT DEFAULT 2 COMMENT 'Jumlah jam kredit per minggu',
  is_mandatory BOOLEAN DEFAULT TRUE COMMENT 'Apakah wajib diambil',
  department_id INT COMMENT 'Jurusan yang mengajar (opsional)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_department_id (department_id),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabel mata pelajaran';

-- ============================================================================
-- 7. TABEL TEACHER_SUBJECTS (Guru - Mata Pelajaran)
-- ============================================================================
CREATE TABLE teacher_subjects (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik relasi guru-mapel',
  teacher_id INT NOT NULL COMMENT 'Referensi ke tabel teachers',
  subject_id INT NOT NULL COMMENT 'Referensi ke tabel subjects',
  is_primary BOOLEAN DEFAULT FALSE COMMENT 'Apakah mata pelajaran utama',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_teacher_subject (teacher_id, subject_id),
  KEY idx_subject_id (subject_id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabel relasi guru dengan mata pelajaran yang diajar';

-- ============================================================================
-- 8. TABEL STUDENTS (Siswa)
-- ============================================================================
CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik siswa',
  user_id INT UNIQUE NOT NULL COMMENT 'Referensi ke tabel users',
  nisn VARCHAR(20) UNIQUE NOT NULL COMMENT 'Nomor Induk Siswa Nasional',
  nis VARCHAR(20) UNIQUE COMMENT 'Nomor Induk Sekolah',
  class_id INT NOT NULL COMMENT 'Referensi ke tabel classes',
  department_id INT NOT NULL COMMENT 'Referensi ke tabel departments',
  academic_year VARCHAR(10) NOT NULL COMMENT 'Tahun akademik masuk',
  parent_phone VARCHAR(20) COMMENT 'Nomor telepon orang tua/wali',
  parent_name VARCHAR(100) COMMENT 'Nama orang tua/wali',
  parent_email VARCHAR(100) COMMENT 'Email orang tua/wali',
  emergency_contact VARCHAR(100) COMMENT 'Kontak darurat',
  emergency_phone VARCHAR(20) COMMENT 'Nomor telepon darurat',
  enrollment_status ENUM('Active', 'Inactive', 'Graduated', 'Withdrawn') DEFAULT 'Active' COMMENT 'Status pendaftaran',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Status aktif siswa',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_user_id (user_id),
  KEY idx_class_id (class_id),
  KEY idx_department_id (department_id),
  KEY idx_nisn (nisn),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabel siswa';

-- ============================================================================
-- 9. TABEL SCHEDULES (Jadwal Pelajaran)
-- ============================================================================
CREATE TABLE schedules (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik jadwal',
  class_id INT NOT NULL COMMENT 'Referensi ke tabel classes',
  subject_id INT NOT NULL COMMENT 'Referensi ke tabel subjects',
  teacher_id INT NOT NULL COMMENT 'Referensi ke tabel teachers',
  day_of_week ENUM('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat') NOT NULL COMMENT 'Hari dalam seminggu',
  start_time TIME NOT NULL COMMENT 'Jam mulai pelajaran',
  end_time TIME NOT NULL COMMENT 'Jam selesai pelajaran',
  room_number VARCHAR(20) COMMENT 'Ruangan/Lab',
  academic_year VARCHAR(10) NOT NULL COMMENT 'Tahun akademik',
  semester INT DEFAULT 1 COMMENT 'Semester (1 atau 2)',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Status jadwal aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_class_id (class_id),
  KEY idx_subject_id (subject_id),
  KEY idx_teacher_id (teacher_id),
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabel jadwal pelajaran';

-- ============================================================================
-- 10. TABEL ATTENDANCES (Absensi)
-- ============================================================================
CREATE TABLE attendances (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik absensi',
  student_id INT NOT NULL COMMENT 'Referensi ke tabel students',
  schedule_id INT NOT NULL COMMENT 'Referensi ke tabel schedules',
  attendance_date DATE NOT NULL COMMENT 'Tanggal absensi',
  status ENUM('Present', 'Absent', 'Late', 'Sick', 'Permission') DEFAULT 'Present' COMMENT 'Status kehadiran',
  notes TEXT COMMENT 'Keterangan/alasan',
  recorded_by INT COMMENT 'Guru yang mencatat (referensi ke users)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_attendance (student_id, schedule_id, attendance_date),
  KEY idx_schedule_id (schedule_id),
  KEY idx_attendance_date (attendance_date),
  KEY idx_recorded_by (recorded_by),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabel absensi harian siswa';

-- ============================================================================
-- 11. TABEL GRADES (Nilai/Raport)
-- ============================================================================
CREATE TABLE grades (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik nilai',
  student_id INT NOT NULL COMMENT 'Referensi ke tabel students',
  subject_id INT NOT NULL COMMENT 'Referensi ke tabel subjects',
  teacher_id INT NOT NULL COMMENT 'Guru pengajar (referensi ke teachers)',
  academic_year VARCHAR(10) NOT NULL COMMENT 'Tahun akademik',
  semester INT DEFAULT 1 COMMENT 'Semester (1 atau 2)',
  
  -- Komponen Penilaian
  assignment_score DECIMAL(5,2) COMMENT 'Nilai tugas (0-100)',
  midterm_score DECIMAL(5,2) COMMENT 'Nilai UTS (0-100)',
  final_score DECIMAL(5,2) COMMENT 'Nilai UAS (0-100)',
  project_score DECIMAL(5,2) COMMENT 'Nilai proyek (0-100)',
  participation_score DECIMAL(5,2) COMMENT 'Nilai partisipasi (0-100)',
  
  -- Bobot Perhitungan
  assignment_weight INT DEFAULT 20 COMMENT 'Bobot tugas (%)',
  midterm_weight INT DEFAULT 30 COMMENT 'Bobot UTS (%)',
  final_weight INT DEFAULT 40 COMMENT 'Bobot UAS (%)',
  project_weight INT DEFAULT 10 COMMENT 'Bobot proyek (%)',
  
  final_score_calculated DECIMAL(5,2) COMMENT 'Nilai akhir terkalkulasi',
  grade CHAR(1) COMMENT 'Grade huruf (A, B, C, D, E)',
  grade_point DECIMAL(3,2) COMMENT 'Poin grade (4.0, 3.5, 3.0, dll)',
  
  remarks TEXT COMMENT 'Catatan guru tentang siswa',
  entered_by INT COMMENT 'Guru yang memasukkan (referensi ke users)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_grade (student_id, subject_id, academic_year, semester),
  KEY idx_subject_id (subject_id),
  KEY idx_teacher_id (teacher_id),
  KEY idx_academic_year (academic_year),
  KEY idx_entered_by (entered_by),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (entered_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabel nilai/raport siswa per mata pelajaran';

-- ============================================================================
-- 12. TABEL PAYMENTS (Pembayaran SPP/Iuran)
-- ============================================================================
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik pembayaran',
  student_id INT NOT NULL COMMENT 'Referensi ke tabel students',
  payment_type ENUM('SPP', 'Registration', 'Activity', 'Other') DEFAULT 'SPP' COMMENT 'Jenis pembayaran',
  month VARCHAR(7) COMMENT 'Bulan pembayaran (YYYY-MM format)',
  academic_year VARCHAR(10) COMMENT 'Tahun akademik',
  amount DECIMAL(12,2) NOT NULL COMMENT 'Jumlah pembayaran',
  payment_date DATE NOT NULL COMMENT 'Tanggal pembayaran',
  payment_method ENUM('Cash', 'Bank Transfer', 'Check', 'E-Wallet') DEFAULT 'Bank Transfer' COMMENT 'Metode pembayaran',
  reference_number VARCHAR(50) COMMENT 'Nomor referensi (transfer, cek)',
  receipt_number VARCHAR(50) UNIQUE COMMENT 'Nomor bukti pembayaran',
  verified_by INT COMMENT 'Petugas yang memverifikasi (referensi ke users)',
  verification_date DATETIME COMMENT 'Waktu verifikasi',
  payment_status ENUM('Pending', 'Verified', 'Cancelled') DEFAULT 'Pending' COMMENT 'Status pembayaran',
  notes TEXT COMMENT 'Catatan pembayaran',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_student_id (student_id),
  KEY idx_payment_date (payment_date),
  KEY idx_verified_by (verified_by),
  KEY idx_month (month),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabel pembayaran SPP dan iuran siswa';

-- ============================================================================
-- 13. TABEL ANNOUNCEMENTS (Pengumuman)
-- ============================================================================
CREATE TABLE announcements (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik pengumuman',
  title VARCHAR(200) NOT NULL COMMENT 'Judul pengumuman',
  content TEXT NOT NULL COMMENT 'Isi pengumuman',
  author_id INT NOT NULL COMMENT 'Penulis pengumuman (referensi ke users)',
  announcement_type ENUM('General', 'Academic', 'Event', 'Important', 'Other') DEFAULT 'General' COMMENT 'Kategori pengumuman',
  priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium' COMMENT 'Prioritas pengumuman',
  target_audience ENUM('All', 'Teachers', 'Students', 'Parents', 'Staff') DEFAULT 'All' COMMENT 'Target penerima',
  attachment_url VARCHAR(500) COMMENT 'URL dokumen lampiran',
  is_published BOOLEAN DEFAULT TRUE COMMENT 'Status publikasi',
  start_date DATETIME COMMENT 'Tanggal mulai tampil',
  end_date DATETIME COMMENT 'Tanggal akhir tampil',
  view_count INT DEFAULT 0 COMMENT 'Jumlah kali dilihat',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_author_id (author_id),
  KEY idx_announcement_type (announcement_type),
  KEY idx_is_published (is_published),
  KEY idx_created_at (created_at),
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabel pengumuman sekolah';

-- ============================================================================
-- 14. TABEL REGISTRATIONS (Pendaftaran Siswa Baru)
-- ============================================================================
CREATE TABLE registrations (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik pendaftaran',
  registration_number VARCHAR(50) UNIQUE NOT NULL COMMENT 'Nomor pendaftaran',
  full_name VARCHAR(100) NOT NULL COMMENT 'Nama calon siswa',
  email VARCHAR(100) COMMENT 'Email calon siswa',
  phone_number VARCHAR(20) COMMENT 'Nomor telepon calon siswa',
  birth_date DATE COMMENT 'Tanggal lahir calon siswa',
  gender ENUM('Male', 'Female') COMMENT 'Jenis kelamin',
  origin_school VARCHAR(100) COMMENT 'Sekolah asal',
  origin_school_address TEXT COMMENT 'Alamat sekolah asal',
  parent_name VARCHAR(100) COMMENT 'Nama orang tua/wali',
  parent_phone VARCHAR(20) COMMENT 'Nomor telepon orang tua',
  parent_email VARCHAR(100) COMMENT 'Email orang tua',
  address TEXT COMMENT 'Alamat calon siswa',
  city VARCHAR(50) COMMENT 'Kota/Kabupaten',
  province VARCHAR(50) COMMENT 'Provinsi',
  postal_code VARCHAR(10) COMMENT 'Kode pos',
  
  -- Dokumen & Status Pendaftaran
  documents_submitted BOOLEAN DEFAULT FALSE COMMENT 'Apakah dokumen sudah diserahkan',
  document_urls JSON COMMENT 'Array URL dokumen (KTP, rapor, akta lahir, dll)',
  
  registration_status ENUM('Submitted', 'Verified', 'Accepted', 'Rejected', 'Waitlist') DEFAULT 'Submitted' COMMENT 'Status pendaftaran',
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Tanggal pengajuan',
  verification_date DATETIME COMMENT 'Tanggal verifikasi',
  verification_notes TEXT COMMENT 'Catatan verifikasi',
  verified_by INT COMMENT 'Petugas yang memverifikasi (referensi ke users)',
  
  -- Link ke Siswa (setelah diterima)
  student_id INT UNIQUE COMMENT 'Referensi ke tabel students (setelah diterima)',
  
  admission_date DATE COMMENT 'Tanggal diterima',
  academic_year_admitted VARCHAR(10) COMMENT 'Tahun akademik masuk',
  class_assigned_id INT COMMENT 'Kelas yang ditugaskan (referensi ke classes)',
  
  rejection_reason TEXT COMMENT 'Alasan penolakan (jika ditolak)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_registration_number (registration_number),
  KEY idx_email (email),
  KEY idx_registration_status (registration_status),
  KEY idx_verified_by (verified_by),
  KEY idx_student_id (student_id),
  KEY idx_class_assigned_id (class_assigned_id),
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (class_assigned_id) REFERENCES classes(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabel pendaftaran siswa baru';

-- ============================================================================
-- 15. TABEL ACTIVITY_LOG (Log Aktivitas Sistem)
-- ============================================================================
CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik log',
  user_id INT COMMENT 'Pengguna yang melakukan aktivitas',
  action VARCHAR(100) NOT NULL COMMENT 'Jenis aksi (Create, Update, Delete, Login, etc)',
  entity_type VARCHAR(50) NOT NULL COMMENT 'Tipe entitas (Student, Teacher, Grade, etc)',
  entity_id INT COMMENT 'ID entitas yang diubah',
  old_values JSON COMMENT 'Nilai sebelumnya (untuk audit trail)',
  new_values JSON COMMENT 'Nilai sesudahnya (untuk audit trail)',
  description TEXT COMMENT 'Deskripsi aksi',
  ip_address VARCHAR(45) COMMENT 'Alamat IP pengguna',
  user_agent VARCHAR(500) COMMENT 'Browser/client info',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  KEY idx_user_id (user_id),
  KEY idx_action (action),
  KEY idx_entity_type (entity_type),
  KEY idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabel log aktivitas untuk audit trail';

-- ============================================================================
-- SEEDS DATA / MASTER DATA
-- ============================================================================

-- Masukkan Data Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'Admin', 'Administrator sistem dengan akses penuh'),
(2, 'Guru', 'Guru pengajar'),
(3, 'Siswa', 'Siswa aktif sekolah'),
(4, 'Orang Tua', 'Orang tua/wali siswa'),
(5, 'Staff', 'Staf/TU sekolah');

-- Masukkan Data Departments
INSERT INTO departments (id, name, code, description) VALUES
(1, 'IPA', 'IPA', 'Jurusan Ilmu Pengetahuan Alam'),
(2, 'IPS', 'IPS', 'Jurusan Ilmu Pengetahuan Sosial'),
(3, 'Bahasa', 'BHS', 'Jurusan Bahasa');

-- Masukkan Data Subjects
INSERT INTO subjects (id, name, code, credit_hours, department_id) VALUES
(1, 'Matematika', 'MTK', 4, 1),
(2, 'Fisika', 'FIS', 3, 1),
(3, 'Kimia', 'KIM', 3, 1),
(4, 'Biologi', 'BIO', 3, 1),
(5, 'Ekonomi', 'EKO', 3, 2),
(6, 'Sejarah', 'SEJ', 2, 2),
(7, 'Geografi', 'GEO', 2, 2),
(8, 'Bahasa Indonesia', 'BIX', 3, 3),
(9, 'Bahasa Inggris', 'BIG', 3, 3),
(10, 'Bahasa Mandarin', 'BMD', 2, 3);

-- ============================================================================
-- VIEWS UNTUK PELAPORAN
-- ============================================================================

-- View: Ringkasan Absensi Siswa
CREATE OR REPLACE VIEW v_attendance_summary AS
SELECT 
  s.id,
  u.full_name as student_name,
  c.name as class_name,
  DATE(a.attendance_date) as attendance_date,
  a.status,
  sc.day_of_week,
  subj.name as subject_name
FROM attendances a
JOIN students s ON a.student_id = s.id
JOIN users u ON s.user_id = u.id
JOIN classes c ON s.class_id = c.id
JOIN schedules sc ON a.schedule_id = sc.id
JOIN subjects subj ON sc.subject_id = subj.id
ORDER BY a.attendance_date DESC;

-- View: Ringkasan Nilai Siswa
CREATE OR REPLACE VIEW v_grades_summary AS
SELECT 
  s.id,
  u.full_name as student_name,
  c.name as class_name,
  subj.name as subject_name,
  t.user_id as teacher_id,
  tu.full_name as teacher_name,
  g.academic_year,
  g.semester,
  g.assignment_score,
  g.midterm_score,
  g.final_score,
  g.final_score_calculated,
  g.grade,
  g.grade_point
FROM grades g
JOIN students s ON g.student_id = s.id
JOIN users u ON s.user_id = u.id
JOIN classes c ON s.class_id = c.id
JOIN subjects subj ON g.subject_id = subj.id
JOIN teachers t ON g.teacher_id = t.id
JOIN users tu ON t.user_id = tu.id
ORDER BY g.academic_year DESC, g.semester DESC;

-- View: Status Pembayaran Siswa
CREATE OR REPLACE VIEW v_payment_status AS
SELECT 
  s.id,
  u.full_name as student_name,
  c.name as class_name,
  COALESCE(SUM(CASE WHEN p.payment_status = 'Verified' THEN p.amount ELSE 0 END), 0) as total_paid,
  COALESCE(COUNT(CASE WHEN p.payment_status = 'Verified' THEN 1 END), 0) as payment_count,
  MAX(p.payment_date) as last_payment_date
FROM students s
JOIN users u ON s.user_id = u.id
JOIN classes c ON s.class_id = c.id
LEFT JOIN payments p ON s.id = p.student_id AND p.academic_year = YEAR(CURDATE())
GROUP BY s.id, u.full_name, c.name;

-- View: Jadwal Mengajar Guru
CREATE OR REPLACE VIEW v_teacher_schedule AS
SELECT 
  t.id,
  u.full_name as teacher_name,
  sc.day_of_week,
  sc.start_time,
  sc.end_time,
  c.name as class_name,
  subj.name as subject_name,
  sc.room_number,
  sc.academic_year
FROM schedules sc
JOIN teachers t ON sc.teacher_id = t.id
JOIN users u ON t.user_id = u.id
JOIN classes c ON sc.class_id = c.id
JOIN subjects subj ON sc.subject_id = subj.id
WHERE sc.is_active = TRUE
ORDER BY sc.day_of_week, sc.start_time;

-- ============================================================================
-- INDEKS TAMBAHAN UNTUK OPTIMASI PERFORMA
-- ============================================================================

CREATE INDEX idx_students_class_department ON students(class_id, department_id);
CREATE INDEX idx_grades_student_subject_year ON grades(student_id, subject_id, academic_year, semester);
CREATE INDEX idx_attendances_student_date ON attendances(student_id, attendance_date);
CREATE INDEX idx_payments_student_month ON payments(student_id, month, academic_year);
CREATE INDEX idx_schedules_class_teacher ON schedules(class_id, teacher_id, academic_year);
CREATE INDEX idx_users_role_active ON users(role_id, is_active);
CREATE INDEX idx_registrations_status_date ON registrations(registration_status, registration_date);
CREATE INDEX idx_announcements_published_type ON announcements(is_published, announcement_type, created_at);

-- ============================================================================
-- TRIGGERS UNTUK OTOMASI
-- ============================================================================

-- Trigger: Update final score otomatis saat nilai diubah
DELIMITER $$

CREATE TRIGGER trg_calculate_final_score AFTER UPDATE ON grades
FOR EACH ROW
BEGIN
  DECLARE final_calc DECIMAL(5,2);
  
  SET final_calc = 
    (COALESCE(NEW.assignment_score, 0) * NEW.assignment_weight / 100) +
    (COALESCE(NEW.midterm_score, 0) * NEW.midterm_weight / 100) +
    (COALESCE(NEW.final_score, 0) * NEW.final_weight / 100) +
    (COALESCE(NEW.project_score, 0) * NEW.project_weight / 100);
  
  UPDATE grades 
  SET final_score_calculated = ROUND(final_calc, 2),
      grade = CASE 
        WHEN final_calc >= 85 THEN 'A'
        WHEN final_calc >= 75 THEN 'B'
        WHEN final_calc >= 65 THEN 'C'
        WHEN final_calc >= 55 THEN 'D'
        ELSE 'E'
      END,
      grade_point = CASE 
        WHEN final_calc >= 85 THEN 4.00
        WHEN final_calc >= 75 THEN 3.00
        WHEN final_calc >= 65 THEN 2.00
        WHEN final_calc >= 55 THEN 1.00
        ELSE 0.00
      END
  WHERE id = NEW.id;
END$$

DELIMITER ;

-- Trigger: Catat log aktivitas saat ada perubahan data siswa
DELIMITER $$

CREATE TRIGGER trg_log_student_changes AFTER UPDATE ON students
FOR EACH ROW
BEGIN
  INSERT INTO activity_logs (user_id, action, entity_type, entity_id, old_values, new_values, description)
  VALUES (
    COALESCE(@current_user_id, 1),
    'UPDATE',
    'Student',
    NEW.id,
    JSON_OBJECT('nisn', OLD.nisn, 'enrollment_status', OLD.enrollment_status),
    JSON_OBJECT('nisn', NEW.nisn, 'enrollment_status', NEW.enrollment_status),
    CONCAT('Update data siswa: ', NEW.nisn)
  );
END$$

DELIMITER ;

-- ============================================================================
-- DOKUMENTASI RELASI
-- ============================================================================
/*
RELASI DATABASE:

1. USERS & ROLES (One-to-Many)
   - Banyak users dapat memiliki satu role
   - Role menentukan hak akses pengguna

2. USERS & TEACHERS (One-to-One)
   - Satu user adalah satu guru
   - Satu guru adalah satu user (dengan role 'Guru')

3. USERS & STUDENTS (One-to-One)
   - Satu user adalah satu siswa
   - Satu siswa adalah satu user (dengan role 'Siswa')

4. TEACHERS & SUBJECTS (Many-to-Many)
   - Melalui tabel teacher_subjects
   - Satu guru dapat mengajar banyak mata pelajaran
   - Satu mata pelajaran dapat diajarkan oleh banyak guru

5. STUDENTS & CLASSES (Many-to-One)
   - Banyak siswa dalam satu kelas
   - Satu siswa hanya di satu kelas

6. STUDENTS & DEPARTMENTS (Many-to-One)
   - Banyak siswa dalam satu jurusan
   - Satu siswa dalam satu jurusan

7. CLASSES & DEPARTMENTS (Many-to-One)
   - Banyak kelas dalam satu jurusan
   - Satu kelas hanya satu jurusan

8. CLASSES & TEACHERS (One-to-One)
   - Satu kelas memiliki satu wali kelas
   - Satu guru bisa menjadi wali kelas di banyak kelas

9. SCHEDULES & CLASSES (Many-to-One)
   - Banyak jadwal untuk satu kelas
   - Satu jadwal untuk satu kelas

10. SCHEDULES & TEACHERS (Many-to-One)
    - Banyak jadwal untuk satu guru
    - Satu jadwal mengajar oleh satu guru

11. SCHEDULES & SUBJECTS (Many-to-One)
    - Banyak jadwal untuk satu mata pelajaran
    - Satu jadwal mengajar satu mata pelajaran

12. ATTENDANCES & STUDENTS (Many-to-One)
    - Banyak record absensi untuk satu siswa
    - Satu record absensi untuk satu siswa pada satu jadwal

13. ATTENDANCES & SCHEDULES (Many-to-One)
    - Banyak absensi untuk satu jadwal
    - Satu absensi pada satu jadwal

14. GRADES & STUDENTS (Many-to-One)
    - Banyak nilai untuk satu siswa
    - Satu nilai untuk satu siswa per mata pelajaran per semester

15. GRADES & SUBJECTS (Many-to-One)
    - Banyak nilai untuk satu mata pelajaran
    - Satu nilai untuk satu mata pelajaran

16. GRADES & TEACHERS (Many-to-One)
    - Banyak nilai diinput oleh satu guru
    - Satu nilai diinput oleh satu guru

17. PAYMENTS & STUDENTS (Many-to-One)
    - Banyak pembayaran untuk satu siswa
    - Satu pembayaran untuk satu siswa pada satu bulan

18. ANNOUNCEMENTS & USERS (Many-to-One)
    - Satu pengumuman dibuat oleh satu user
    - Satu user dapat membuat banyak pengumuman

19. REGISTRATIONS & STUDENTS (One-to-One)
    - Satu pendaftaran menjadi satu siswa (setelah diterima)

20. REGISTRATIONS & CLASSES (Many-to-One)
    - Banyak pendaftaran ditugaskan ke satu kelas

21. ACTIVITY_LOGS & USERS (Many-to-One)
    - Banyak log aktivitas untuk satu user
    - Satu log aktivitas untuk satu user
*/

-- ============================================================================
-- CONTOH QUERY UMUM
-- ============================================================================

-- 1. Mencari jadwal mengajar guru pada hari tertentu
-- SELECT * FROM v_teacher_schedule 
-- WHERE teacher_name = 'Bapak Ahmad' AND day_of_week = 'Senin';

-- 2. Mencari status pembayaran siswa
-- SELECT * FROM v_payment_status 
-- WHERE student_name = 'Alya Rahma';

-- 3. Mencari absensi siswa dalam satu bulan
-- SELECT * FROM v_attendance_summary 
-- WHERE student_name = 'Alya Rahma' AND MONTH(attendance_date) = 6;

-- 4. Mencari nilai akhir siswa dalam satu semester
-- SELECT * FROM v_grades_summary 
-- WHERE student_name = 'Alya Rahma' AND academic_year = '2025/2026' AND semester = 1;

-- 5. Menghitung rerata nilai siswa
-- SELECT student_name, AVG(final_score_calculated) as avg_score
-- FROM v_grades_summary
-- GROUP BY student_name;

-- ============================================================================
-- END OF SCHEMA DEFINITION
-- ============================================================================
