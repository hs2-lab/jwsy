(function () {
  const weddingDate = new Date('2026-08-22T11:00:00+09:00');
  const now = new Date();
  const diff = weddingDate.getTime() - now.getTime();
  const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  const textEl = document.getElementById('dday-text');
  if (textEl) textEl.textContent = String(days) + '일';

  const ENABLE_HERO_SLIDESHOW = false;
 const heroImages = ENABLE_HERO_SLIDESHOW
  ? [
      './assets/images/hero/hero-04.jpg',
      './assets/images/hero/hero-02.jpg'
    ]
  : ['./assets/images/hero/hero-04.jpg'];
  const heroSlideA = document.getElementById('hero-slide-a');
  const heroSlideB = document.getElementById('hero-slide-b');

  if (heroSlideA && heroSlideB && heroImages.length > 0) {
    let activeIndex = 0;
    let showingA = true;

    heroSlideA.style.backgroundImage = `url("${heroImages[0]}")`;
    heroSlideA.classList.add('is-active');

    if (heroImages.length === 1) {
      heroSlideB.style.display = 'none';
    }

    if (heroImages.length > 1) {
      setInterval(() => {
        activeIndex = (activeIndex + 1) % heroImages.length;
        const nextImage = heroImages[activeIndex];

        if (showingA) {
          heroSlideB.style.backgroundImage = `url("${nextImage}")`;
          heroSlideB.classList.add('is-active');
          heroSlideA.classList.remove('is-active');
        } else {
          heroSlideA.style.backgroundImage = `url("${nextImage}")`;
          heroSlideA.classList.add('is-active');
          heroSlideB.classList.remove('is-active');
        }

        showingA = !showingA;
      }, 3000);
    }
  }

  const galleryGrid = document.getElementById('gallery-grid');
  const galleryImages = Array.from({ length: 16 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return {
      src: `./assets/images/gallery/${num}.jpg`,
      alt: `갤러리 사진 ${i + 1}`
    };
  });

  if (galleryGrid) {
    galleryGrid.innerHTML = galleryImages.map((item, index) => `
      <button type="button" class="gallery-thumb" data-index="${index}" aria-label="${item.alt}">
        <img src="${item.src}" alt="${item.alt}">
      </button>
    `).join('');
  }

  const galleryItems = Array.from(document.querySelectorAll('.gallery-thumb'));
  const lightbox = document.getElementById('lightbox');
  const lightboxPhoto = document.getElementById('lightbox-photo');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  let currentIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;

  function updateArrowState() {
    if (!prevBtn || !nextBtn) return;
    prevBtn.classList.toggle('is-hidden', currentIndex === 0);
    nextBtn.classList.toggle('is-hidden', currentIndex === galleryImages.length - 1);
  }

  function renderLightbox(index) {
    currentIndex = index;
    const item = galleryImages[currentIndex];
    lightboxPhoto.src = item.src;
    lightboxPhoto.alt = item.alt;
    updateArrowState();
  }

  function openLightbox(index) {
    renderLightbox(index);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) renderLightbox(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentIndex < galleryImages.length - 1) renderLightbox(currentIndex + 1);
    });
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diffX = touchEndX - touchStartX;

      if (Math.abs(diffX) > 40) {
        if (diffX > 0 && currentIndex > 0) {
          renderLightbox(currentIndex - 1);
        } else if (diffX < 0 && currentIndex < galleryImages.length - 1) {
          renderLightbox(currentIndex + 1);
        }
      }
    }, { passive: true });
  }

  const sections = Array.from(document.querySelectorAll('section'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12
  });

  sections.forEach((section) => {
    if (!section.classList.contains('hero')) {
      observer.observe(section);
    }
  });

  const sampleMessages = [
    { id: 's1', name: 'ㅎㅎㅎ', date: '2026.05.25', text: '결혼 축하해요 ♥', sample: true }
  ];

  const STORAGE_KEY = 'wedding_guestbook_local_v6';
  const guestForm = document.getElementById('guest-form');
  const guestbookList = document.getElementById('guestbook-list');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const pageLabel = document.getElementById('guestbook-page');
  const openMessageModalBtn = document.getElementById('open-message-modal');
  const messageModal = document.getElementById('message-modal');
  const messageModalDim = document.getElementById('message-modal-dim');
  const closeMessageModalBtn = document.getElementById('close-message-modal');
  const cancelMessageModalBtn = document.getElementById('cancel-message-modal');
  const deleteModal = document.getElementById('delete-modal');
  const deleteModalDim = document.getElementById('delete-modal-dim');
  const closeDeleteModalBtn = document.getElementById('close-delete-modal');
  const cancelDeleteModalBtn = document.getElementById('cancel-delete-modal');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const deletePasswordInput = document.getElementById('delete-password');
  const copyButtons = Array.from(document.querySelectorAll('.copy-btn'));

  const pageSize = 5;
  let currentPage = 1;
  let deleteTargetId = null;

  function openMessageModal() {
    messageModal.classList.add('open');
    messageModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMessageModal() {
    messageModal.classList.remove('open');
    messageModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openDeleteModal(id) {
    deleteTargetId = id;
    deletePasswordInput.value = '';
    deleteModal.classList.add('open');
    deleteModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDeleteModal() {
    deleteTargetId = null;
    deletePasswordInput.value = '';
    deleteModal.classList.remove('open');
    deleteModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function loadStoredMessages() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveStoredMessages(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function loadGuestbook() {
    return [...loadStoredMessages(), ...sampleMessages];
  }

  let guestbookData = loadGuestbook();

  function attachDeleteEvents() {
    const deleteButtons = Array.from(document.querySelectorAll('.delete-entry-btn'));
    deleteButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const id = button.getAttribute('data-id');
        if (!id) return;
        openDeleteModal(id);
      });
    });
  }

  function renderGuestbook() {
    const totalPages = Math.max(1, Math.ceil(guestbookData.length / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * pageSize;
    const visible = guestbookData.slice(start, start + pageSize);

    guestbookList.innerHTML = visible.map(item => `
      <div class="guest-entry">
        <div class="guest-head">
          <div class="guest-name">${item.name}</div>
          <div class="guest-head-right">
            <span>${item.date}</span>
            ${item.sample ? '' : `<button type="button" class="delete-entry-btn" data-id="${item.id}" aria-label="메시지 삭제">&times;</button>`}
          </div>
        </div>
        <div class="guest-text">${item.text.replace(/\n/g, '<br>')}</div>
      </div>
    `).join('');

    pageLabel.textContent = `${currentPage} / ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    attachDeleteEvents();
  }

  if (guestForm) {
    guestForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = guestForm.name.value.trim();
      const password = guestForm.password.value.trim();
      const message = guestForm.message.value.trim();

      if (!name || !password || !message) return;

      const stored = loadStoredMessages();
      stored.unshift({
        id: Date.now().toString(36),
        name,
        password,
        message,
        date: new Date().toLocaleDateString('ko-KR').replace(/\./g, '.').replace(/\s/g, '')
      });

      saveStoredMessages(stored);
      guestbookData = loadGuestbook();
      currentPage = 1;
      renderGuestbook();
      guestForm.reset();
      closeMessageModal();
    });
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', function () {
      const password = deletePasswordInput.value.trim();
      if (!deleteTargetId || !password) return;

      const stored = loadStoredMessages();
      const target = stored.find(item => item.id === deleteTargetId);

      if (!target) {
        closeDeleteModal();
        return;
      }

      if (target.password !== password) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }

      const nextStored = stored.filter(item => item.id !== deleteTargetId);
      saveStoredMessages(nextStored);
      guestbookData = loadGuestbook();
      renderGuestbook();
      closeDeleteModal();
    });
  }

  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', function () {
      if (currentPage > 1) {
        currentPage -= 1;
        renderGuestbook();
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', function () {
      const totalPages = Math.max(1, Math.ceil(guestbookData.length / pageSize));
      if (currentPage < totalPages) {
        currentPage += 1;
        renderGuestbook();
      }
    });
  }

  if (openMessageModalBtn) openMessageModalBtn.addEventListener('click', openMessageModal);
  if (closeMessageModalBtn) closeMessageModalBtn.addEventListener('click', closeMessageModal);
  if (cancelMessageModalBtn) cancelMessageModalBtn.addEventListener('click', closeMessageModal);
  if (messageModalDim) messageModalDim.addEventListener('click', closeMessageModal);

  if (closeDeleteModalBtn) closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
  if (cancelDeleteModalBtn) cancelDeleteModalBtn.addEventListener('click', closeDeleteModal);
  if (deleteModalDim) deleteModalDim.addEventListener('click', closeDeleteModal);

  copyButtons.forEach((button) => {
    button.addEventListener('click', async function () {
      const text = button.getAttribute('data-copy');
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
        const original = button.textContent;
        button.textContent = '복사완료';
        setTimeout(() => {
          button.textContent = original;
        }, 1200);
      } catch (e) {
        alert('복사에 실패했습니다.');
      }
    });
  });

  renderGuestbook();
})();