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
