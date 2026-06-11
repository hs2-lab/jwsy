(function () {
  var weddingDate = new Date('2026-08-22T11:00:00+09:00');
  var now = new Date();
  var diff = weddingDate.getTime() - now.getTime();
  var days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  var textEl = document.getElementById('dday-text');
  if (textEl) textEl.textContent = String(days) + '일';

  var heroBg = document.getElementById('hero-bg');
  if (heroBg) {
    var videoEl = document.createElement('video');

    // 영상 파일 경로 (본인의 파일명으로 수정하세요)
    videoEl.src = './assets/images/hero/01.mp4';

    // 🔇 소리 없이 계속 재생하기 위한 핵심 설정
    videoEl.autoplay = true;   // 페이지 열리면 자동 재생
    videoEl.loop = true;       // 끝까지 재생되면 처음부터 무한 반복
    videoEl.muted = true;      // ⚠️ 음소거 (이게 없으면 모바일에서 재생이 안 됩니다)
    videoEl.playsInline = true; // ⚠️ iOS 아이폰에서 전체화면으로 튕기는 현상 방지

    // 꽉 차게 보여주기 위한 스타일 설정
    videoEl.style.width = '100%';
    videoEl.style.height = '100%';
    videoEl.style.objectFit = 'cover'; // 영상 비율 유지하며 화면 채우기
    videoEl.style.position = 'absolute';
    videoEl.style.top = '0';
    videoEl.style.left = '0';

    heroBg.innerHTML = '';
    heroBg.style.aspectRatio = '8 / 10';
    heroBg.style.width = '100%';
    heroBg.style.height = 'auto';
    heroBg.appendChild(videoEl);
  }

  var galleryGrid = document.getElementById('gallery-grid');
  var galleryImages = Array.from({ length: 16 }, function (_, i) {
    var num = String(i + 1).padStart(2, '0');
    return {
      src: './assets/images/gallery/' + num + '.jpg',
      alt: '갤러리 사진 ' + (i + 1)
    };
  });

  if (galleryGrid) {
    galleryGrid.innerHTML = galleryImages.map(function (item, index) {
      return '<button type="button" class="gallery-thumb" data-index="' + index + '" aria-label="' + item.alt + '">' +
        '<img src="' + item.src + '" alt="' + item.alt + '">' +
        '</button>';
    }).join('');
  }

  var galleryItems = Array.from(document.querySelectorAll('.gallery-thumb'));
  var lightbox = document.getElementById('lightbox');
  var lightboxPhoto = document.getElementById('lightbox-photo');
  var closeBtn = document.getElementById('lightbox-close');
  var prevBtn = document.getElementById('lightbox-prev');
  var nextBtn = document.getElementById('lightbox-next');

  var currentIndex = 0;
  var touchStartX = 0;
  var touchEndX = 0;

  function updateArrowState() {
    if (!prevBtn || !nextBtn) return;
    prevBtn.classList.toggle('is-hidden', currentIndex === 0);
    nextBtn.classList.toggle('is-hidden', currentIndex === galleryImages.length - 1);
  }

  function renderLightbox(index) {
    currentIndex = index;
    var item = galleryImages[currentIndex];
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

  galleryItems.forEach(function (item, index) {
    item.addEventListener('click', function () { openLightbox(index); });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (currentIndex > 0) renderLightbox(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (currentIndex < galleryImages.length - 1) renderLightbox(currentIndex + 1);
    });
  }

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diffX = touchEndX - touchStartX;

      if (Math.abs(diffX) > 40) {
        if (diffX > 0 && currentIndex > 0) {
          renderLightbox(currentIndex - 1);
        } else if (diffX < 0 && currentIndex < galleryImages.length - 1) {
          renderLightbox(currentIndex + 1);
        }
      }
    }, { passive: true });
  }

  var sections = Array.from(document.querySelectorAll('section'));
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12
  });

  sections.forEach(function (section) {
    if (!section.classList.contains('hero')) {
      observer.observe(section);
    }
  });
  
  // 페이지 로딩이 완료되면 네비게이션 버튼 애니메이션을 바로 실행합니다.
window.addEventListener('DOMContentLoaded', function() {
  var navButtons = document.querySelectorAll('.wedding-nav-bar .nav-btn');
  
  navButtons.forEach(function(btn, index) {
    // 0.2초(200ms) 정도 살짝 대기했다가 좌측부터 순서대로 0.1초 시차를 두고 슥 올라옵니다.
    setTimeout(function() {
      btn.classList.add('is-visible');
    }, 200 + (index * 100)); 
  });
});


  var sampleMessages = [
    { id: 's1', name: 'ㅎㅎㅎ', date: '2026.05.25', text: '결혼 축하해요 ♥', sample: true }
  ];

  var STORAGE_KEY = 'wedding_guestbook_local_v6';
  var guestForm = document.getElementById('guest-form');
  var guestbookList = document.getElementById('guestbook-list');
  var prevPageBtn = document.getElementById('prev-page');
  var nextPageBtn = document.getElementById('next-page');
  var pageLabel = document.getElementById('guestbook-page');
  var openMessageModalBtn = document.getElementById('open-message-modal');
  var messageModal = document.getElementById('message-modal');
  var messageModalDim = document.getElementById('message-modal-dim');
  var closeMessageModalBtn = document.getElementById('close-message-modal');
  var cancelMessageModalBtn = document.getElementById('cancel-message-modal');
  var deleteModal = document.getElementById('delete-modal');
  var deleteModalDim = document.getElementById('delete-modal-dim');
  var closeDeleteModalBtn = document.getElementById('close-delete-modal');
  var cancelDeleteModalBtn = document.getElementById('cancel-delete-modal');
  var confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  var deletePasswordInput = document.getElementById('delete-password');
  var copyButtons = Array.from(document.querySelectorAll('.copy-btn'));

  var pageSize = 5;
  var currentPage = 1;
  var deleteTargetId = null;

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
    return [].concat(loadStoredMessages(), sampleMessages);
  }


  // 1. 카카오 SDK 초기화 (중복 초기화 방지)
  if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
    Kakao.init('32599aff7bd9dd685d2d1ba374b08f7b');
  }


  // 2. 버튼 클릭 이벤트 리스너 등록
  var kakaoBtn = document.getElementById('kakao-share-btn');

  if (kakaoBtn) {
    kakaoBtn.addEventListener('click', function () {
      if (typeof Kakao !== 'undefined') {

        // 카카오톡 공유 - 위치 템플릿 호출
        Kakao.Share.sendDefault({
          objectType: 'feed', // 위치 템플릿 필수 지정
          address: '서울 송파구 올림픽로 319', // [필수] 실제 예식장 도로명/지번 주소
          addressTitle: '더컨벤션 잠실(교통회관) 1층 그랜드볼룸홀', // [선택] 카카오톡 지도 뷰 상단에 표시될 식장 이름
          content: {
            title: '지운♡송이 결혼합니다', // [필수] 메시지 대제목
            description: '2026년 8월 22일 11시, 오시는 길과 상세 안내를 확인해 보세요.', // [필수] 상세 설명
            imageUrl: 'https://hs2-lab.github.io/jwsy/assets/images/hero/thn.jpg', // [필수] 메인 사진 URL
            imageWidth: 600, // [선택] 이미지 너비 (픽셀)
            imageHeight: 720, // [선택] 이미지 높이 (픽셀)
            link: {
              mobileWebUrl: 'https://hs2-lab.github.io/jwsy/',
              webUrl: 'https://hs2-lab.github.io/jwsy/',
            },
          },
          buttons: [
            {
              title: '모바일 청첩장', // 좌측 첫 번째 버튼
              link: {
                mobileWebUrl: 'https://hs2-lab.github.io/jwsy/',
                webUrl: 'https://hs2-lab.github.io/jwsy/',
              },
            },
            {
              title: '위치 보기', // 우측 두 번째 버튼
              link: {
                // 더컨벤션 잠실점 카카오맵 위치로 바로 연결되는 실제 주소입니다.
                mobileWebUrl: 'https://kakao.com 잠실점,37.51475,127.10304',
                webUrl: 'https://kakao.com 잠실점,37.51475,127.10304',
              },
            },
          ],
        });

      }
    });
  }


  var navButtons = document.querySelectorAll('.nav-btn');

  navButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      // 1. 버튼의 목적지 ID 가져오기 (#location-section 등)
      var targetId = this.getAttribute('data-target');
      var targetSection = document.querySelector(targetId);

      if (targetSection) {
        // 2. 해당 구역이 화면 최상단에서 얼마나 떨어져 있는지 절대 거리 계산
        var targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;

        // 3. 브라우저 창 전체를 해당 높이 좌표로 부드럽게 스크롤
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });


  var guestbookData = loadGuestbook();

  function attachDeleteEvents() {
    var deleteButtons = Array.from(document.querySelectorAll('.delete-entry-btn'));
    deleteButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var id = button.getAttribute('data-id');
        if (!id) return;
        openDeleteModal(id);
      });
    });
  }

  function renderGuestbook() {
    var totalPages = Math.max(1, Math.ceil(guestbookData.length / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    var start = (currentPage - 1) * pageSize;
    var visible = guestbookData.slice(start, start + pageSize);

    guestbookList.innerHTML = visible.map(function (item) {
      return '<div class="guest-entry">' +
        '<div class="guest-head">' +
        '<div class="guest-name">' + item.name + '</div>' +
        '<div class="guest-head-right">' +
        '<span>' + item.date + '</span>' +
        (item.sample ? '' : '<button type="button" class="delete-entry-btn" data-id="' + item.id + '" aria-label="메시지 삭제">&times;</button>') +
        '</div>' +
        '</div>' +
        '<div class="guest-text">' + item.text.replace(/\n/g, '<br>') + '</div>' +
        '</div>';
    }).join('');

    pageLabel.textContent = currentPage + ' / ' + totalPages;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    attachDeleteEvents();
  }

  if (guestForm) {
    guestForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = guestForm.name.value.trim();
      var password = guestForm.password.value.trim();
      var message = guestForm.message.value.trim();

      if (!name || !password || !message) return;

      var stored = loadStoredMessages();
      stored.unshift({
        id: Date.now().toString(36),
        name: name,
        password: password,
        message: message,
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
      var password = deletePasswordInput.value.trim();
      if (!deleteTargetId || !password) return;

      var stored = loadStoredMessages();
      var target = stored.find(function (item) { return item.id === deleteTargetId; });

      if (!target) {
        closeDeleteModal();
        return;
      }

      if (target.password !== password) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }

      var nextStored = stored.filter(function (item) { return item.id !== deleteTargetId; });
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
      var totalPages = Math.max(1, Math.ceil(guestbookData.length / pageSize));
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

  copyButtons.forEach(function (button) {
    button.addEventListener('click', async function () {
      var text = button.getAttribute('data-copy');
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
        var original = button.textContent;
        button.textContent = '복사완료';
        setTimeout(function () {
          button.textContent = original;
        }, 1200);
      } catch (e) {
        alert('복사에 실패했습니다.');
      }
    });
  });

  renderGuestbook();
})();
