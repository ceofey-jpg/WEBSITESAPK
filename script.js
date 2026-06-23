const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

navToggle.addEventListener('click', () => {
  siteNav.classList.toggle('open');
});

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Terima kasih! Pesan Anda telah terkirim.');
    contactForm.reset();
  });
}

const ppdbForm = document.querySelector('.ppdb-form');
const registrationNumber = document.querySelector('#registrationNumber');
const registrationStatus = document.querySelector('#registrationStatus');
const documentsInput = document.querySelector('#documents');
const fileList = document.querySelector('.file-list');

function generateRegistrationNumber() {
  const date = new Date();
  const shortDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `PPDB-${shortDate}-${randomPart}`;
}

if (documentsInput && fileList) {
  documentsInput.addEventListener('change', () => {
    const files = Array.from(documentsInput.files);
    if (!files.length) {
      fileList.textContent = 'Tidak ada berkas yang dipilih.';
      return;
    }
    fileList.innerHTML = files.map((file) => `• ${file.name}`).join('<br>');
  });
}

if (ppdbForm) {
  ppdbForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!documentsInput.files.length) {
      alert('Silakan unggah minimal satu berkas pendukung.');
      return;
    }

    const nomor = generateRegistrationNumber();
    registrationNumber.textContent = nomor;
    registrationStatus.textContent = 'Terkirim — menunggu verifikasi';

    alert(`Pendaftaran berhasil! Nomor Anda: ${nomor}`);
    ppdbForm.reset();
    if (fileList) {
      fileList.textContent = '';
    }
  });
}

const addStudentButton = document.querySelector('#addStudentButton');
const importStudentButton = document.querySelector('#importStudentButton');
const exportStudentExcelButton = document.querySelector('#exportStudentExcel');
const exportStudentPdfButton = document.querySelector('#exportStudentPdf');
const studentSearch = document.querySelector('#studentSearch');
const studentClassFilter = document.querySelector('#studentClassFilter');
const studentStatusFilter = document.querySelector('#studentStatusFilter');
const studentTableBody = document.querySelector('#studentTable tbody');
const studentFormCard = document.querySelector('#studentFormCard');
const studentFormTitle = document.querySelector('#studentFormTitle');
const studentForm = document.querySelector('#studentForm');
const studentIdInput = document.querySelector('#studentId');
const studentNameInput = document.querySelector('#studentName');
const studentClassSelect = document.querySelector('#studentClass');
const studentMajorInput = document.querySelector('#studentMajor');
const studentStatusSelect = document.querySelector('#studentStatus');
const closeStudentForm = document.querySelector('#closeStudentForm');
const studentImportInput = document.querySelector('#studentImport');

let students = [
  { id: 1, name: 'Alya Rahma', class: 'X', major: 'IPA', status: 'Aktif' },
  { id: 2, name: 'Budi Santoso', class: 'XI', major: 'IPS', status: 'Aktif' },
  { id: 3, name: 'Citra Dewi', class: 'XII', major: 'Bahasa', status: 'Lulus' },
  { id: 4, name: 'Dandi Pratama', class: 'XI', major: 'IPA', status: 'Aktif' },
  { id: 5, name: 'Eka Wulandari', class: 'X', major: 'IPS', status: 'Tidak Aktif' }
];
let nextStudentId = students.length + 1;

// load/save students to localStorage for persistence across reloads
const storedStudents = JSON.parse(localStorage.getItem('students') || 'null');
if (storedStudents && Array.isArray(storedStudents)) {
  students = storedStudents;
  nextStudentId = students.reduce((max, s) => Math.max(max, s.id), 0) + 1;
} else {
  localStorage.setItem('students', JSON.stringify(students));
}

function renderStudents() {
  const filtered = students.filter((student) => {
    const searchValue = studentSearch.value.trim().toLowerCase();
    const classFilter = studentClassFilter.value;
    const statusFilter = studentStatusFilter.value;

    const matchesSearch = !searchValue || student.name.toLowerCase().includes(searchValue) || student.major.toLowerCase().includes(searchValue);
    const matchesClass = !classFilter || student.class === classFilter;
    const matchesStatus = !statusFilter || student.status === statusFilter;

    return matchesSearch && matchesClass && matchesStatus;
  });

  studentTableBody.innerHTML = filtered.map((student, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${student.name}</td>
      <td>${student.class}</td>
      <td>${student.major}</td>
      <td>${student.status}</td>
      <td>
        <button class="btn btn-secondary edit-student" data-id="${student.id}">Edit</button>
        <button class="btn btn-secondary delete-student" data-id="${student.id}">Hapus</button>
      </td>
    </tr>
  `).join('');
}

function openStudentForm(student = null) {
  studentFormCard.classList.remove('hidden');
  if (student) {
    studentFormTitle.textContent = 'Edit Siswa';
    studentIdInput.value = student.id;
    studentNameInput.value = student.name;
    studentClassSelect.value = student.class;
    studentMajorInput.value = student.major;
    studentStatusSelect.value = student.status;
  } else {
    studentFormTitle.textContent = 'Tambah Siswa';
    studentIdInput.value = '';
    studentForm.reset();
  }
}

function closeStudentFormCard() {
  studentFormCard.classList.add('hidden');
  studentForm.reset();
  studentIdInput.value = '';
}

function getStudentById(id) {
  return students.find((student) => student.id === Number(id));
}

function deleteStudentById(id) {
  students = students.filter((student) => student.id !== Number(id));
  renderStudents();
}

function importStudentsFromWorkbook(workbook) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!rows.length) {
    alert('File kosong atau format tidak dikenali.');
    return;
  }

  const headers = rows[0].map((value) => String(value).trim().toLowerCase());
  const nameIndex = headers.findIndex((header) => header.includes('nama'));
  const classIndex = headers.findIndex((header) => header.includes('kelas'));
  const majorIndex = headers.findIndex((header) => header.includes('jurusan'));
  const statusIndex = headers.findIndex((header) => header.includes('status'));

  if (nameIndex === -1 || classIndex === -1 || majorIndex === -1 || statusIndex === -1) {
    alert('Format kolom tidak valid. Pastikan file Excel memiliki kolom Nama, Kelas, Jurusan, dan Status.');
    return;
  }

  const imported = rows.slice(1).reduce((result, row) => {
    const name = String(row[nameIndex] || '').trim();
    if (!name) {
      return result;
    }

    const student = {
      id: nextStudentId++,
      name,
      class: String(row[classIndex] || '').trim() || 'X',
      major: String(row[majorIndex] || '').trim() || '-',
      status: String(row[statusIndex] || '').trim() || 'Aktif'
    };

    result.push(student);
    return result;
  }, []);

  if (!imported.length) {
    alert('Tidak ada data siswa yang valid di file Excel.');
    return;
  }

  students = students.concat(imported);
  renderStudents();
  alert(`${imported.length} siswa berhasil diimpor.`);
}

function exportStudentsToExcel() {
  const rows = students.map((student, index) => ({
    No: index + 1,
    Nama: student.name,
    Kelas: student.class,
    Jurusan: student.major,
    Status: student.status
  }));
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Siswa');
  XLSX.writeFile(workbook, 'data-siswa.xlsx');
}

function exportStudentsToPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const rows = students.map((student, index) => [
    index + 1,
    student.name,
    student.class,
    student.major,
    student.status
  ]);

  doc.setFontSize(14);
  doc.text('Data Siswa', 14, 18);
  doc.autoTable({
    startY: 24,
    head: [['No.', 'Nama', 'Kelas', 'Jurusan', 'Status']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: '#2c63ff' },
    styles: { fontSize: 10 }
  });
  doc.save('data-siswa.pdf');
}

if (addStudentButton) {
  addStudentButton.addEventListener('click', () => openStudentForm());
}

if (closeStudentForm) {
  closeStudentForm.addEventListener('click', closeStudentFormCard);
}

if (studentForm) {
  studentForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const id = studentIdInput.value;
    const studentData = {
      id: id ? Number(id) : nextStudentId,
      name: studentNameInput.value.trim(),
      class: studentClassSelect.value,
      major: studentMajorInput.value.trim(),
      status: studentStatusSelect.value
    };

    if (!studentData.name || !studentData.class || !studentData.major || !studentData.status) {
      alert('Silakan lengkapi semua data siswa.');
      return;
    }

    if (id) {
      const index = students.findIndex((student) => student.id === Number(id));
      if (index !== -1) {
        students[index] = studentData;
      }
      alert('Data siswa berhasil diperbarui.');
    } else {
      students.push(studentData);
      nextStudentId += 1;
      alert('Data siswa berhasil ditambahkan.');
    }

    // persist students
    localStorage.setItem('students', JSON.stringify(students));
    renderStudents();
    closeStudentFormCard();
  });
}

if (studentTableBody) {
  studentTableBody.addEventListener('click', (event) => {
    const editButton = event.target.closest('.edit-student');
    const deleteButton = event.target.closest('.delete-student');

    if (editButton) {
      const studentId = editButton.dataset.id;
      const student = getStudentById(studentId);
      if (student) {
        openStudentForm(student);
      }
    }

    if (deleteButton) {
      const studentId = deleteButton.dataset.id;
      const student = getStudentById(studentId);
      if (!student) {
        return;
      }
      const confirmed = confirm(`Hapus data siswa ${student.name}?`);
      if (confirmed) {
        deleteStudentById(studentId);
      }
    }
  });
}

if (studentSearch) {
  studentSearch.addEventListener('input', renderStudents);
}

if (studentClassFilter) {
  studentClassFilter.addEventListener('change', renderStudents);
}

if (studentStatusFilter) {
  studentStatusFilter.addEventListener('change', renderStudents);
}

if (importStudentButton && studentImportInput) {
  importStudentButton.addEventListener('click', () => studentImportInput.click());
}

if (studentImportInput) {
  studentImportInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    importStudentsFromWorkbook(workbook);
    studentImportInput.value = '';
  });
}

if (exportStudentExcelButton) {
  exportStudentExcelButton.addEventListener('click', exportStudentsToExcel);
}

if (exportStudentPdfButton) {
  exportStudentPdfButton.addEventListener('click', exportStudentsToPdf);
}

renderStudents();

/* --- Kelola Kelas, Jurusan, dan Penempatan Siswa --- */
const classMajorSection = document.querySelector('#classMajorManager');
if (classMajorSection) {
  const addClassButton = document.querySelector('#addClassButton');
  const addMajorButton = document.querySelector('#addMajorButton');
  const assignPlacementButton = document.querySelector('#assignPlacementButton');
  const placementSearch = document.querySelector('#placementSearch');

  const classesTableBody = document.querySelector('#classesTable tbody');
  const majorsTableBody = document.querySelector('#majorsTable tbody');

  const classFormCard = document.querySelector('#classFormCard');
  const classForm = document.querySelector('#classForm');
  const classNameInput = document.querySelector('#className');
  const closeClassForm = document.querySelector('#closeClassForm');

  const majorFormCard = document.querySelector('#majorFormCard');
  const majorForm = document.querySelector('#majorForm');
  const majorNameInput = document.querySelector('#majorName');
  const closeMajorForm = document.querySelector('#closeMajorForm');

  const placementFormCard = document.querySelector('#placementFormCard');
  const placementForm = document.querySelector('#placementForm');
  const placementStudentSelect = document.querySelector('#placementStudent');
  const placementClassSelect = document.querySelector('#placementClass');
  const placementMajorSelect = document.querySelector('#placementMajor');
  const closePlacementForm = document.querySelector('#closePlacementForm');

  // storage
  let classes = JSON.parse(localStorage.getItem('classes') || 'null');
  let majors = JSON.parse(localStorage.getItem('majors') || 'null');

  if (!classes) classes = ['X', 'XI', 'XII'];
  if (!majors) majors = ['IPA', 'IPS', 'Bahasa'];
  // ensure student form selects are populated
  function populateStudentClassSelects() {
    const opts = ['<option value="">Pilih kelas</option>'].concat(classes.map(c => `<option value="${c}">${c}</option>`)).join('');
    studentClassSelect.innerHTML = opts;
    placementClassSelect.innerHTML = opts;
  }
  function populateStudentMajorSelects() {
    const opts = ['<option value="">Pilih jurusan</option>'].concat(majors.map(m => `<option value="${m}">${m}</option>`)).join('');
    // student major select
    studentMajorInput.innerHTML = opts;
    placementMajorSelect.innerHTML = opts;
  }

  function saveClassesMajors() {
    localStorage.setItem('classes', JSON.stringify(classes));
    localStorage.setItem('majors', JSON.stringify(majors));
  }

  function renderClasses() {
    classesTableBody.innerHTML = classes.map((c, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${c}</td>
        <td><button class="btn btn-secondary delete-class" data-name="${c}">Hapus</button></td>
      </tr>
    `).join('');
    populateStudentClassSelects();
  }

  function renderMajors() {
    majorsTableBody.innerHTML = majors.map((m, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${m}</td>
        <td><button class="btn btn-secondary delete-major" data-name="${m}">Hapus</button></td>
      </tr>
    `).join('');
    populateStudentMajorSelects();
  }

  function openClassForm() { classFormCard.classList.remove('hidden'); }
  function closeClassFormCard() { classFormCard.classList.add('hidden'); classForm.reset(); }
  function openMajorForm() { majorFormCard.classList.remove('hidden'); }
  function closeMajorFormCard() { majorFormCard.classList.add('hidden'); majorForm.reset(); }
  function openPlacementForm() { placementFormCard.classList.remove('hidden'); populatePlacementStudentSelect(); }
  function closePlacementFormCard() { placementFormCard.classList.add('hidden'); placementForm.reset(); }

  function populatePlacementStudentSelect() {
    const q = placementSearch.value.trim().toLowerCase();
    const options = students
      .filter(s => !q || s.name.toLowerCase().includes(q))
      .map(s => `<option value="${s.id}">${s.name} — ${s.class || '-'} / ${s.major || '-'}</option>`).join('');
    placementStudentSelect.innerHTML = '<option value="">Pilih siswa</option>' + options;
  }

  addClassButton.addEventListener('click', () => openClassForm());
  closeClassForm.addEventListener('click', closeClassFormCard);
  addMajorButton.addEventListener('click', () => openMajorForm());
  closeMajorForm.addEventListener('click', closeMajorFormCard);
  assignPlacementButton.addEventListener('click', () => openPlacementForm());
  closePlacementForm.addEventListener('click', closePlacementFormCard);

  classForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = classNameInput.value.trim();
    if (!name) { alert('Nama kelas wajib diisi.'); return; }
    if (!classes.includes(name)) classes.push(name);
    saveClassesMajors();
    renderClasses();
    alert('Kelas disimpan.');
    closeClassFormCard();
  });

  majorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = majorNameInput.value.trim();
    if (!name) { alert('Nama jurusan wajib diisi.'); return; }
    if (!majors.includes(name)) majors.push(name);
    saveClassesMajors();
    renderMajors();
    alert('Jurusan disimpan.');
    closeMajorFormCard();
  });

  placementForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const studentId = Number(placementStudentSelect.value);
    const cls = placementClassSelect.value;
    const maj = placementMajorSelect.value;
    if (!studentId || !cls || !maj) { alert('Pilih siswa, kelas, dan jurusan.'); return; }
    const s = students.find(st => st.id === studentId);
    if (s) {
      s.class = cls;
      s.major = maj;
      localStorage.setItem('students', JSON.stringify(students));
      renderStudents();
      alert('Penempatan siswa berhasil.');
      closePlacementFormCard();
    }
  });

  // delete handlers
  classesTableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('.delete-class');
    if (!btn) return;
    const name = btn.dataset.name;
    if (confirm(`Hapus kelas ${name}?`)) {
      classes = classes.filter(c => c !== name);
      // update students with that class
      students.forEach(s => { if (s.class === name) s.class = ''; });
      localStorage.setItem('students', JSON.stringify(students));
      saveClassesMajors();
      renderClasses();
      renderStudents();
    }
  });

  majorsTableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('.delete-major');
    if (!btn) return;
    const name = btn.dataset.name;
    if (confirm(`Hapus jurusan ${name}?`)) {
      majors = majors.filter(m => m !== name);
      students.forEach(s => { if (s.major === name) s.major = ''; });
      localStorage.setItem('students', JSON.stringify(students));
      saveClassesMajors();
      renderMajors();
      renderStudents();
    }
  });

  placementSearch.addEventListener('input', populatePlacementStudentSelect);

  // initial render
  renderClasses();
  renderMajors();
  populateStudentClassSelects();
  populateStudentMajorSelects();
}

/* --- Manajemen Guru, Mata Pelajaran, dan Wali Kelas (localStorage) --- */
const teacherSection = document.querySelector('#teacherManager');
if (teacherSection) {
  const addTeacherButton = document.querySelector('#addTeacherButton');
  const addSubjectButton = document.querySelector('#addSubjectButton');
  const assignWaliButton = document.querySelector('#assignWaliButton');
  const teacherSearch = document.querySelector('#teacherSearch');

  const teachersTableBody = document.querySelector('#teachersTable tbody');
  const subjectsTableBody = document.querySelector('#subjectsTable tbody');
  const homeroomTableBody = document.querySelector('#homeroomTable tbody');

  const teacherFormCard = document.querySelector('#teacherFormCard');
  const teacherFormTitle = document.querySelector('#teacherFormTitle');
  const teacherForm = document.querySelector('#teacherForm');
  const teacherIdInput = document.querySelector('#teacherId');
  const teacherNameInput = document.querySelector('#teacherName');
  const teacherSubjectInput = document.querySelector('#teacherSubject');
  const closeTeacherForm = document.querySelector('#closeTeacherForm');

  const subjectFormCard = document.querySelector('#subjectFormCard');
  const subjectForm = document.querySelector('#subjectForm');
  const subjectIdInput = document.querySelector('#subjectId');
  const subjectNameInput = document.querySelector('#subjectName');
  const closeSubjectForm = document.querySelector('#closeSubjectForm');

  const assignFormCard = document.querySelector('#assignFormCard');
  const assignForm = document.querySelector('#assignForm');
  const assignClassSelect = document.querySelector('#assignClass');
  const assignTeacherSelect = document.querySelector('#assignTeacher');
  const closeAssignForm = document.querySelector('#closeAssignForm');

  let teachers = JSON.parse(localStorage.getItem('teachers') || 'null');
  let subjects = JSON.parse(localStorage.getItem('subjects') || 'null');
  let homerooms = JSON.parse(localStorage.getItem('homerooms') || 'null');

  if (!teachers) {
    teachers = [
      { id: 1, name: 'Siti Aminah', subjects: ['Bahasa Indonesia'] },
      { id: 2, name: 'Ahmad Yusuf', subjects: ['Matematika'] },
      { id: 3, name: 'Maya Putri', subjects: ['Bahasa Inggris'] }
    ];
  }
  if (!subjects) {
    subjects = ['Matematika', 'Bahasa Inggris', 'Bahasa Indonesia', 'Fisika'];
  }
  if (!homerooms) {
    homerooms = [{ class: 'X', teacherId: null }, { class: 'XI', teacherId: null }, { class: 'XII', teacherId: null }];
  }

  function saveAll() {
    localStorage.setItem('teachers', JSON.stringify(teachers));
    localStorage.setItem('subjects', JSON.stringify(subjects));
    localStorage.setItem('homerooms', JSON.stringify(homerooms));
  }

  function renderTeachers() {
    const q = teacherSearch.value.trim().toLowerCase();
    const rows = teachers
      .filter(t => !q || t.name.toLowerCase().includes(q) || (t.subjects || []).join(', ').toLowerCase().includes(q))
      .map((t, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${t.name}</td>
          <td>${(t.subjects || []).join(', ')}</td>
          <td>
            <button class="btn btn-secondary edit-teacher" data-id="${t.id}">Edit</button>
            <button class="btn btn-secondary delete-teacher" data-id="${t.id}">Hapus</button>
          </td>
        </tr>
      `).join('');
    teachersTableBody.innerHTML = rows;
    renderSubjects();
    renderHomerooms();
    populateAssignTeacherSelect();
  }

  function renderSubjects() {
    subjectsTableBody.innerHTML = subjects.map((s, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${s}</td>
        <td>
          <button class="btn btn-secondary delete-subject" data-name="${s}">Hapus</button>
        </td>
      </tr>
    `).join('');
  }

  function renderHomerooms() {
    homeroomTableBody.innerHTML = homerooms.map(h => {
      const teacher = teachers.find(t => t.id === h.teacherId);
      return `
        <tr>
          <td>${h.class}</td>
          <td>${teacher ? teacher.name : '-'}</td>
          <td><button class="btn btn-secondary edit-homeroom" data-class="${h.class}">Ubah</button></td>
        </tr>
      `;
    }).join('');
  }

  function openTeacherForm(teacher = null) {
    teacherFormCard.classList.remove('hidden');
    if (teacher) {
      teacherFormTitle.textContent = 'Edit Guru';
      teacherIdInput.value = teacher.id;
      teacherNameInput.value = teacher.name;
      teacherSubjectInput.value = (teacher.subjects || []).join(', ');
    } else {
      teacherFormTitle.textContent = 'Tambah Guru';
      teacherIdInput.value = '';
      teacherForm.reset();
    }
  }

  function closeTeacherFormCard() {
    teacherFormCard.classList.add('hidden');
    teacherForm.reset();
    teacherIdInput.value = '';
  }

  function openSubjectForm() { subjectFormCard.classList.remove('hidden'); }
  function closeSubjectFormCard() { subjectFormCard.classList.add('hidden'); subjectForm.reset(); }

  function openAssignForm(defaultClass = '') {
    assignFormCard.classList.remove('hidden');
    assignClassSelect.value = defaultClass;
    populateAssignTeacherSelect();
  }
  function closeAssignFormCard() { assignFormCard.classList.add('hidden'); assignForm.reset(); }

  function populateAssignTeacherSelect() {
    assignTeacherSelect.innerHTML = '<option value="">Pilih guru</option>' + teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
  }

  // Events
  addTeacherButton.addEventListener('click', () => openTeacherForm());
  closeTeacherForm.addEventListener('click', closeTeacherFormCard);
  addSubjectButton.addEventListener('click', () => openSubjectForm());
  closeSubjectForm.addEventListener('click', closeSubjectFormCard);
  assignWaliButton.addEventListener('click', () => openAssignForm());
  closeAssignForm.addEventListener('click', closeAssignFormCard);

  teacherForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = teacherIdInput.value;
    const name = teacherNameInput.value.trim();
    const subj = teacherSubjectInput.value.split(',').map(s => s.trim()).filter(Boolean);
    if (!name) { alert('Nama guru wajib diisi.'); return; }
    if (id) {
      const t = teachers.find(x => x.id === Number(id));
      if (t) { t.name = name; t.subjects = subj; }
      alert('Data guru diperbarui.');
    } else {
      const newId = teachers.reduce((max, x) => Math.max(max, x.id), 0) + 1;
      teachers.push({ id: newId, name, subjects: subj });
      alert('Guru baru ditambahkan.');
    }
    saveAll();
    renderTeachers();
    closeTeacherFormCard();
  });

  subjectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = subjectNameInput.value.trim();
    if (!name) { alert('Nama mata pelajaran wajib diisi.'); return; }
    if (!subjects.includes(name)) {
      subjects.push(name);
      saveAll();
      renderSubjects();
      alert('Mata pelajaran ditambahkan.');
    } else {
      alert('Mata pelajaran sudah ada.');
    }
    closeSubjectFormCard();
  });

  assignForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cls = assignClassSelect.value;
    const teacherId = Number(assignTeacherSelect.value) || null;
    if (!cls || !teacherId) { alert('Pilih kelas dan guru.'); return; }
    const found = homerooms.find(h => h.class === cls);
    if (found) { found.teacherId = teacherId; }
    saveAll();
    renderHomerooms();
    alert('Wali kelas berhasil ditugaskan.');
    closeAssignFormCard();
  });

  // Table actions (delegation)
  teachersTableBody.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-teacher');
    const delBtn = e.target.closest('.delete-teacher');
    if (editBtn) {
      const id = Number(editBtn.dataset.id);
      const t = teachers.find(x => x.id === id);
      if (t) openTeacherForm(t);
    }
    if (delBtn) {
      const id = Number(delBtn.dataset.id);
      const t = teachers.find(x => x.id === id);
      if (!t) return;
      if (confirm(`Hapus guru ${t.name}?`)) {
        teachers = teachers.filter(x => x.id !== id);
        // remove homeroom assignments referencing this teacher
        homerooms.forEach(h => { if (h.teacherId === id) h.teacherId = null; });
        saveAll();
        renderTeachers();
      }
    }
  });

  /* --- Absensi: input harian, rekap per kelas, laporan bulanan --- */
  const attendanceSection = document.querySelector('#attendanceManager');
  if (attendanceSection) {
    const attendanceDate = document.querySelector('#attendanceDate');
    const attendanceClass = document.querySelector('#attendanceClass');
    const loadAttendance = document.querySelector('#loadAttendance');
    const attendanceTableBody = document.querySelector('#attendanceTable tbody');
    const saveAttendance = document.querySelector('#saveAttendance');
    const recapDate = document.querySelector('#recapDate');
    const showRecap = document.querySelector('#showRecap');
    const reportMonth = document.querySelector('#reportMonth');
    const reportClass = document.querySelector('#reportClass');
    const exportCsv = document.querySelector('#exportCsv');
    const exportPdf = document.querySelector('#exportPdf');

    function loadAttendanceRecords() {
      return JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    }
    function saveAttendanceRecords(records) {
      localStorage.setItem('attendanceRecords', JSON.stringify(records));
    }

    const storedClasses = JSON.parse(localStorage.getItem('classes') || 'null') || ['X','XI','XII'];
    function populateClassSelects() {
      const opts = ['<option value="">Pilih kelas</option>'].concat(storedClasses.map(c => `<option value="${c}">${c}</option>`)).join('');
      attendanceClass.innerHTML = opts;
      reportClass.innerHTML = '<option value="">Semua Kelas</option>' + storedClasses.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    function renderAttendanceTable(dateStr, cls) {
      if (!dateStr || !cls) {
        attendanceTableBody.innerHTML = '<tr><td colspan="4">Pilih tanggal dan kelas lalu klik Muat Siswa.</td></tr>';
        return;
      }
      const studentsInClass = students.filter(s => s.class === cls);
      const records = loadAttendanceRecords();
      const rows = studentsInClass.map((s, idx) => {
        const rec = records.find(r => r.date === dateStr && r.class === cls && r.studentId === s.id);
        const checked = rec && rec.status === 'Hadir' ? 'checked' : '';
        return `
          <tr>
            <td>${idx + 1}</td>
            <td>${s.name}</td>
            <td>${s.class || ''}</td>
            <td><input type="checkbox" data-id="${s.id}" class="attendance-checkbox" ${checked} /></td>
          </tr>
        `;
      }).join('');
      attendanceTableBody.innerHTML = rows || '<tr><td colspan="4">Tidak ada siswa di kelas ini.</td></tr>';
    }

    function saveDailyAttendance(dateStr, cls) {
      if (!dateStr || !cls) { alert('Pilih tanggal dan kelas.'); return; }
      const checkboxes = Array.from(document.querySelectorAll('.attendance-checkbox'));
      const records = loadAttendanceRecords().filter(r => !(r.date === dateStr && r.class === cls));
      const newRecs = checkboxes.map(cb => ({ date: dateStr, class: cls, studentId: Number(cb.dataset.id), status: cb.checked ? 'Hadir' : 'Alpha' }));
      const all = records.concat(newRecs);
      saveAttendanceRecords(all);
      alert('Absensi tersimpan.');
    }

    function showRecapForDate(dateStr) {
      if (!dateStr) { alert('Pilih tanggal rekap.'); return; }
      const records = loadAttendanceRecords().filter(r => r.date === dateStr);
      const byClass = {};
      records.forEach(r => { if (!byClass[r.class]) byClass[r.class] = { hadir:0, alpha:0 }; if (r.status === 'Hadir') byClass[r.class].hadir++; else byClass[r.class].alpha++; });
      const rows = Object.keys(byClass).map(cls => `<tr><td>${cls}</td><td>${byClass[cls].hadir}</td><td>${byClass[cls].alpha}</td></tr>`).join('');
      const tableHtml = `
        <table class="student-table" style="margin-top:1rem;">
          <thead><tr><th>Kelas</th><th>Hadir</th><th>Alpha</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="3">Tidak ada data.</td></tr>'}</tbody>
        </table>`;
      attendanceTableBody.insertAdjacentHTML('afterend', tableHtml);
    }

    function generateMonthlyCsv(monthStr, cls) {
      if (!monthStr) { alert('Pilih bulan.'); return; }
      const records = loadAttendanceRecords().filter(r => r.date.startsWith(monthStr));
      const studentsMap = {};
      students.forEach(s => { if (!cls || s.class === cls) studentsMap[s.id] = { name: s.name, hadir:0, alpha:0 }; });
      records.forEach(r => { if (studentsMap[r.studentId]) { if (r.status === 'Hadir') studentsMap[r.studentId].hadir++; else studentsMap[r.studentId].alpha++; } });
      const lines = [['Nama','Student ID','Hadir','Alpha']];
      Object.keys(studentsMap).forEach(id => { const s = studentsMap[id]; lines.push([s.name, id, s.hadir, s.alpha]); });
      const csv = lines.map(l => l.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-absensi-${monthStr}${cls ? '-'+cls : ''}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    function exportMonthlyPdf(monthStr, cls) {
      if (!monthStr) { alert('Pilih bulan.'); return; }
      const records = loadAttendanceRecords().filter(r => r.date.startsWith(monthStr));
      const studentsMap = {};
      students.forEach(s => { if (!cls || s.class === cls) studentsMap[s.id] = { name: s.name, hadir:0, alpha:0 }; });
      records.forEach(r => { if (studentsMap[r.studentId]) { if (r.status === 'Hadir') studentsMap[r.studentId].hadir++; else studentsMap[r.studentId].alpha++; } });
      const rows = Object.keys(studentsMap).map(id => [studentsMap[id].name, id, studentsMap[id].hadir, studentsMap[id].alpha]);
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.text(`Laporan Absensi Bulanan ${monthStr}${cls ? ' - '+cls : ''}`, 14, 18);
      doc.autoTable({ startY: 24, head: [['Nama','ID','Hadir','Alpha']], body: rows, theme:'grid' });
      doc.save(`laporan-absensi-${monthStr}${cls ? '-'+cls : ''}.pdf`);
    }

    loadAttendance.addEventListener('click', () => renderAttendanceTable(attendanceDate.value, attendanceClass.value));
    saveAttendance.addEventListener('click', () => saveDailyAttendance(attendanceDate.value, attendanceClass.value));
    showRecap.addEventListener('click', () => { document.querySelectorAll('table.student-table + table.student-table').forEach(n => n.remove()); showRecapForDate(recapDate.value); });
    exportCsv.addEventListener('click', () => generateMonthlyCsv(reportMonth.value, reportClass.value));
    exportPdf.addEventListener('click', () => exportMonthlyPdf(reportMonth.value, reportClass.value));

    populateClassSelects();
  }

  /* --- Nilai & Raport --- */
  const gradesSection = document.querySelector('#gradesManager');
  if (gradesSection) {
    const gradeStudentSelect = document.querySelector('#gradeStudent');
    const gradeSubjectSelect = document.querySelector('#gradeSubject');
    const gradeTugasInput = document.querySelector('#gradeTugas');
    const gradeUTSInput = document.querySelector('#gradeUTS');
    const gradeUASInput = document.querySelector('#gradeUAS');
    const saveGradeBtn = document.querySelector('#saveGrade');
    const gradesTableBody = document.querySelector('#gradesTable tbody');
    const gradeSearch = document.querySelector('#gradeSearch');

    let grades = JSON.parse(localStorage.getItem('grades') || '[]');
    let editingGradeId = null;

    function computeFinal(tugas, uts, uas) {
      const t = Number(tugas) || 0;
      const u = Number(uts) || 0;
      const a = Number(uas) || 0;
      return Number((t * 0.3 + u * 0.3 + a * 0.4).toFixed(2));
    }

    function saveGrades() {
      localStorage.setItem('grades', JSON.stringify(grades));
    }

    function populateGradeStudentSelect() {
      gradeStudentSelect.innerHTML = '<option value="">Pilih siswa</option>' + students.map(s => `<option value="${s.id}">${s.name} — ${s.class || '-'} / ${s.major || '-'}</option>`).join('');
    }

    function populateGradeSubjectSelect() {
      const subjList = JSON.parse(localStorage.getItem('subjects') || 'null') || [];
      gradeSubjectSelect.innerHTML = '<option value="">Pilih mata pelajaran</option>' + subjList.map(s => `<option value="${s}">${s}</option>`).join('');
    }

    function renderGrades() {
      const q = gradeSearch.value.trim().toLowerCase();
      const rows = grades
        .filter(g => {
          const st = students.find(s => s.id === g.studentId);
          return !q || (st && st.name.toLowerCase().includes(q)) || (g.subject && g.subject.toLowerCase().includes(q));
        })
        .map((g, idx) => {
          const st = students.find(s => s.id === g.studentId) || { name: '—' };
          return `
            <tr>
              <td>${idx + 1}</td>
              <td>${st.name}</td>
              <td>${g.subject}</td>
              <td>${g.tugas}</td>
              <td>${g.uts}</td>
              <td>${g.uas}</td>
              <td>${g.final}</td>
              <td>
                <button class="btn btn-secondary edit-grade" data-id="${g.id}">Edit</button>
                <button class="btn btn-secondary delete-grade" data-id="${g.id}">Hapus</button>
                <button class="btn btn-secondary print-grade" data-id="${g.id}">Cetak Raport</button>
              </td>
            </tr>
          `;
        }).join('');
      gradesTableBody.innerHTML = rows || '<tr><td colspan="8">Belum ada nilai.</td></tr>';
    }

    function resetGradeForm() {
      editingGradeId = null;
      gradeStudentSelect.value = '';
      gradeSubjectSelect.value = '';
      gradeTugasInput.value = '';
      gradeUTSInput.value = '';
      gradeUASInput.value = '';
    }

    saveGradeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const studentId = Number(gradeStudentSelect.value);
      const subject = gradeSubjectSelect.value.trim();
      const tugas = Number(gradeTugasInput.value);
      const uts = Number(gradeUTSInput.value);
      const uas = Number(gradeUASInput.value);
      if (!studentId || !subject) { alert('Pilih siswa dan mata pelajaran.'); return; }
      const final = computeFinal(tugas, uts, uas);
      if (editingGradeId) {
        const g = grades.find(x => x.id === editingGradeId);
        if (g) { g.studentId = studentId; g.subject = subject; g.tugas = tugas; g.uts = uts; g.uas = uas; g.final = final; }
        alert('Nilai diperbarui.');
      } else {
        const id = grades.reduce((m, x) => Math.max(m, x.id || 0), 0) + 1;
        grades.push({ id, studentId, subject, tugas, uts, uas, final });
        alert('Nilai disimpan.');
      }
      saveGrades();
      renderGrades();
      resetGradeForm();
    });

    gradesTableBody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.edit-grade');
      const delBtn = e.target.closest('.delete-grade');
      const printBtn = e.target.closest('.print-grade');
      if (editBtn) {
        const id = Number(editBtn.dataset.id);
        const g = grades.find(x => x.id === id);
        if (!g) return;
        editingGradeId = id;
        gradeStudentSelect.value = g.studentId;
        gradeSubjectSelect.value = g.subject;
        gradeTugasInput.value = g.tugas;
        gradeUTSInput.value = g.uts;
        gradeUASInput.value = g.uas;
      }
      if (delBtn) {
        const id = Number(delBtn.dataset.id);
        if (confirm('Hapus nilai?')) {
          grades = grades.filter(x => x.id !== id);
          saveGrades();
          renderGrades();
        }
      }
      if (printBtn) {
        const id = Number(printBtn.dataset.id);
        const g = grades.find(x => x.id === id);
        if (g) printRaportForStudent(g.studentId);
      }
    });

    gradeSearch.addEventListener('input', renderGrades);

    function printRaportForStudent(studentId) {
      const student = students.find(s => s.id === studentId);
      if (!student) { alert('Siswa tidak ditemukan.'); return; }
      const studentGrades = grades.filter(g => g.studentId === studentId);
      const rows = studentGrades.map(g => [g.subject, g.tugas, g.uts, g.uas, g.final]);
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text('Raport Siswa', 14, 18);
      doc.setFontSize(12);
      doc.text(`Nama: ${student.name}`, 14, 28);
      doc.text(`Kelas: ${student.class || '-'}`, 14, 36);
      doc.autoTable({ startY: 44, head: [['Mata Pelajaran','Tugas','UTS','UAS','Nilai Akhir']], body: rows, theme:'grid' });
      if (rows.length) {
        const avg = (studentGrades.reduce((s,x)=>s+x.final,0)/studentGrades.length).toFixed(2);
        doc.text(`Rata-rata Nilai Akhir: ${avg}`, 14, doc.lastAutoTable.finalY + 10);
      }
      doc.save(`raport-${student.name.replace(/\s+/g,'-')}.pdf`);
    }

    populateGradeStudentSelect();
    populateGradeSubjectSelect();
    renderGrades();
  }

  /* --- Jadwal Pelajaran (CRUD) --- */
  const scheduleSection = document.querySelector('#scheduleManager');
  if (scheduleSection) {
    const scheduleClass = document.querySelector('#scheduleClass');
    const scheduleTeacher = document.querySelector('#scheduleTeacher');
    const scheduleSubject = document.querySelector('#scheduleSubject');
    const scheduleDay = document.querySelector('#scheduleDay');
    const scheduleStart = document.querySelector('#scheduleStart');
    const scheduleEnd = document.querySelector('#scheduleEnd');
    const addScheduleBtn = document.querySelector('#addSchedule');
    const schedulesTableBody = document.querySelector('#schedulesTable tbody');
    const viewScheduleClass = document.querySelector('#viewScheduleClass');

    function loadSchedules() { return JSON.parse(localStorage.getItem('schedules') || '[]'); }
    function saveSchedules(list) { localStorage.setItem('schedules', JSON.stringify(list)); }
    function loadTeachersLocal() { return JSON.parse(localStorage.getItem('teachers') || '[]'); }
    function loadSubjectsLocal() { return JSON.parse(localStorage.getItem('subjects') || '[]'); }
    function loadClassesLocal() { return JSON.parse(localStorage.getItem('classes') || '[]'); }

    function populateScheduleSelects() {
      const classes = loadClassesLocal();
      const teachers = loadTeachersLocal();
      const subjects = loadSubjectsLocal();
      scheduleClass.innerHTML = '<option value="">Pilih kelas</option>' + classes.map(c=>`<option value="${c}">${c}</option>`).join('');
      viewScheduleClass.innerHTML = '<option value="">Semua Kelas</option>' + classes.map(c=>`<option value="${c}">${c}</option>`).join('');
      scheduleTeacher.innerHTML = '<option value="">Pilih guru</option>' + teachers.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
      scheduleSubject.innerHTML = '<option value="">Pilih mata pelajaran</option>' + subjects.map(s=>`<option value="${s}">${s}</option>`).join('');
    }

    function renderSchedules(filterClass='') {
      const schedules = loadSchedules();
      const teachers = loadTeachersLocal();
      const rows = schedules
        .filter(s => !filterClass || s.class === filterClass)
        .map((s, idx) => {
          const t = teachers.find(x=>x.id === Number(s.teacherId));
          return `
            <tr>
              <td>${idx+1}</td>
              <td>${s.class}</td>
              <td>${s.day}</td>
              <td>${s.start} - ${s.end}</td>
              <td>${s.subject}</td>
              <td>${t ? t.name : '-'}</td>
              <td>
                <button class="btn btn-secondary delete-schedule" data-id="${s.id}">Hapus</button>
              </td>
            </tr>
          `;
        }).join('');
      schedulesTableBody.innerHTML = rows || '<tr><td colspan="7">Belum ada jadwal.</td></tr>';
    }

    addScheduleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const cls = scheduleClass.value;
      const teacherId = scheduleTeacher.value;
      const subj = scheduleSubject.value;
      const day = scheduleDay.value;
      const start = scheduleStart.value;
      const end = scheduleEnd.value;
      if (!cls || !teacherId || !subj || !day || !start || !end) { alert('Lengkapi data jadwal.'); return; }
      const schedules = loadSchedules();
      const id = schedules.reduce((m,x)=>Math.max(m,x.id||0),0)+1;
      schedules.push({ id, class: cls, teacherId, subject: subj, day, start, end });
      saveSchedules(schedules);
      renderSchedules(viewScheduleClass.value);
      alert('Jadwal ditambahkan.');
    });

    schedulesTableBody.addEventListener('click', (e) => {
      const del = e.target.closest('.delete-schedule');
      if (!del) return;
      const id = Number(del.dataset.id);
      if (confirm('Hapus jadwal?')) {
        let list = loadSchedules();
        list = list.filter(s => s.id !== id);
        saveSchedules(list);
        renderSchedules(viewScheduleClass.value);
      }
    });

    viewScheduleClass.addEventListener('change', () => renderSchedules(viewScheduleClass.value));

    populateScheduleSelects();
    renderSchedules();
  }

  /* --- Keuangan Sekolah: SPP dan Pembayaran --- */
  const financeSection = document.querySelector('#financeManager');
  if (financeSection) {
    const sppAmountInput = document.querySelector('#sppAmount');
    const payStudentSelect = document.querySelector('#payStudent');
    const payMonthInput = document.querySelector('#payMonth');
    const payAmountInput = document.querySelector('#payAmount');
    const addPaymentBtn = document.querySelector('#addPayment');
    const paymentsTableBody = document.querySelector('#paymentsTable tbody');
    const filterStudentSelect = document.querySelector('#filterStudent');
    const computeOutstandingBtn = document.querySelector('#computeOutstanding');
    const outstandingSummary = document.querySelector('#outstandingSummary');

    let payments = JSON.parse(localStorage.getItem('payments') || '[]');

    function savePayments() { localStorage.setItem('payments', JSON.stringify(payments)); }

    function populateFinanceStudentSelects() {
      payStudentSelect.innerHTML = '<option value="">Pilih siswa</option>' + students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
      filterStudentSelect.innerHTML = '<option value="">Semua</option>' + students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }

    function renderPayments(filterStudentId='') {
      const rows = payments
        .filter(p => !filterStudentId || String(p.studentId) === String(filterStudentId))
        .map((p, idx) => {
          const s = students.find(st => st.id === p.studentId) || { name: '-' };
          return `
            <tr>
              <td>${idx+1}</td>
              <td>${s.name}</td>
              <td>${p.month}</td>
              <td>${p.amount}</td>
              <td>${p.date}</td>
              <td>
                <button class="btn btn-secondary print-payment" data-id="${p.id}">Bukti</button>
                <button class="btn btn-secondary delete-payment" data-id="${p.id}">Hapus</button>
              </td>
            </tr>
          `;
        }).join('');
      paymentsTableBody.innerHTML = rows || '<tr><td colspan="6">Belum ada pembayaran.</td></tr>';
    }

    function addPayment() {
      const studentId = Number(payStudentSelect.value);
      const month = payMonthInput.value;
      const amount = Number(payAmountInput.value) || 0;
      if (!studentId || !month || amount <= 0) { alert('Lengkapi data pembayaran.'); return; }
      const id = payments.reduce((m,x)=>Math.max(m,x.id||0),0)+1;
      const date = new Date().toLocaleDateString();
      payments.push({ id, studentId, month, amount, date });
      savePayments();
      renderPayments(filterStudentSelect.value);
      payMonthInput.value = '';
      payAmountInput.value = '';
      alert('Pembayaran tercatat.');
    }

    function computeOutstanding(studentId) {
      const sppPerMonth = Number(sppAmountInput.value) || 0;
      if (!sppPerMonth) { outstandingSummary.innerHTML = '<p style="color:#c00;">Tentukan SPP per bulan terlebih dahulu.</p>'; return; }
      const paidRecords = payments.filter(p => p.studentId === studentId);
      const months = Array.from({length:12}, (_,i)=>{ const d = new Date(); d.setMonth(i); return `${d.getFullYear()}-${String(i+1).padStart(2,'0')}`; });
      const unpaid = months.filter(m => !paidRecords.find(p => p.month === m));
      const totalDue = sppPerMonth * months.length;
      const totalPaid = paidRecords.reduce((s,p)=>s+p.amount,0);
      const balance = totalDue - totalPaid;
      outstandingSummary.innerHTML = `
        <p><strong>Total SPP (tahun):</strong> ${totalDue}</p>
        <p><strong>Total Dibayar:</strong> ${totalPaid}</p>
        <p><strong>Sisa / Tunggakan:</strong> ${balance}</p>
        <p><strong>Bulan belum bayar:</strong> ${unpaid.join(', ')}</p>
      `;
    }

    function printPaymentReceipt(paymentId) {
      const p = payments.find(x=>x.id===paymentId);
      if (!p) return;
      const student = students.find(s=>s.id===p.studentId) || { name: '-' };
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text('Bukti Pembayaran SPP', 14, 18);
      doc.setFontSize(12);
      doc.text(`Nama: ${student.name}`, 14, 28);
      doc.text(`Bulan: ${p.month}`, 14, 36);
      doc.text(`Jumlah: ${p.amount}`, 14, 44);
      doc.text(`Tanggal: ${p.date}`, 14, 52);
      doc.save(`bukti-pembayaran-${student.name.replace(/\s+/g,'-')}-${p.id}.pdf`);
    }

    paymentsTableBody.addEventListener('click', (e) => {
      const printBtn = e.target.closest('.print-payment');
      const delBtn = e.target.closest('.delete-payment');
      if (printBtn) {
        const id = Number(printBtn.dataset.id);
        printPaymentReceipt(id);
      }
      if (delBtn) {
        const id = Number(delBtn.dataset.id);
        if (confirm('Hapus pembayaran?')) {
          payments = payments.filter(p=>p.id!==id);
          savePayments();
          renderPayments(filterStudentSelect.value);
        }
      }
    });

    addPaymentBtn.addEventListener('click', (e) => { e.preventDefault(); addPayment(); });
    filterStudentSelect.addEventListener('change', () => renderPayments(filterStudentSelect.value));
    computeOutstandingBtn.addEventListener('click', () => {
      const sid = Number(filterStudentSelect.value);
      if (!sid) { alert('Pilih siswa pada filter untuk menghitung tunggakan.'); return; }
      computeOutstanding(sid);
    });

    populateFinanceStudentSelects();
    renderPayments();
  }

  const roleSelect = document.querySelector('#roleSelect');
  const roleNotice = document.querySelector('#roleNotice');
  const roleAccessRules = {
    Admin: ['gradesManager','attendanceManager','scheduleManager','financeManager'],
    Guru: ['gradesManager','attendanceManager','scheduleManager'],
    Siswa: ['gradesManager','attendanceManager'],
    'Orang Tua': ['gradesManager','attendanceManager']
  };

  function applyRoleAccess(role) {
    const allowed = new Set(roleAccessRules[role] || []);
    ['gradesManager','attendanceManager','scheduleManager','financeManager'].forEach(id => {
      const section = document.querySelector(`#${id}`);
      if (section) section.classList.toggle('hidden', !allowed.has(id));
    });
    if (roleNotice) roleNotice.textContent = `Akses: ${role}`;
  }

  if (roleSelect) {
    roleSelect.addEventListener('change', () => applyRoleAccess(roleSelect.value));
    applyRoleAccess(roleSelect.value);
  }
  subjectsTableBody.addEventListener('click', (e) => {
    const delBtn = e.target.closest('.delete-subject');
    if (delBtn) {
      const name = delBtn.dataset.name;
      if (confirm(`Hapus mata pelajaran ${name}?`)) {
        subjects = subjects.filter(s => s !== name);
        // remove from teachers
        teachers.forEach(t => { t.subjects = (t.subjects || []).filter(s => s !== name); });
        saveAll();
        renderSubjects();
        renderTeachers();
      }
    }
  });

  homeroomTableBody.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-homeroom');
    if (editBtn) {
      const cls = editBtn.dataset.class;
      openAssignForm(cls);
    }
  });

  teacherSearch.addEventListener('input', renderTeachers);

  // initial render
  renderTeachers();
}
