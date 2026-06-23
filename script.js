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
