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

  // 1. 카카오 SDK 초기화 (중복 초기화 방지)
  if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
    Kakao.init('32599aff7bd9dd685d2d1ba374b08f7b');
  }

  // 2. 버튼 클릭 이벤트 리스너 등록
  var kakaoBtn = document.getElementById('kakao-share-btn');

  if (kakaoBtn) {
    kakaoBtn.addEventListener('click', function () {
      if (typeof Kakao !== 'undefined') {

        Kakao.Share.sendCustom({
          templateId: 134256,
        });
      }
    });
  }

   // 📜 네비게이션 버튼 기능 통합 구역 (애니메이션 + 부드러운 스크롤)
  window.addEventListener('DOMContentLoaded', function () {
    // 1. 네비게이션 바 안의 버튼들을 정확하게 수집합니다.
    var navButtons = document.querySelectorAll('.wedding-nav-bar .nav-btn');

    // 2. 버튼 등장 애니메이션 실행
    navButtons.forEach(function (btn, index) {
      // 0.2초 대기 후 좌측 버튼부터 0.1초 시차를 두고 슥 올라옵니다.
      setTimeout(function () {
        btn.classList.add('is-visible');
      }, 200 + (index * 100));
    });

    // 3. 버튼 클릭 시 해당 위치로 부드러운 스크롤 이동 이벤트 연결
    navButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var targetId = this.getAttribute('data-target');
        var targetSection = document.querySelector(targetId);

        if (targetSection) {
          // 해당 구역이 화면 최상단에서 얼마나 떨어져 있는지 절대 거리 계산
          var targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;

          // 브라우저 창 전체를 해당 높이 좌표로 부드럽게 이동
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  });


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

    // 🎵 iOS / iPadOS 완벽 대응 배경음악 스크립트
  var weddingAudio = null;

  function startWeddingBgm() {
    // 최초 터치 시점에 오디오 객체를 메모리에 직접 생성하여 보안 락을 깹니다.
    if (!weddingAudio) {
      weddingAudio = new Audio('./assets/images/bgm.mp3');
      weddingAudio.loop = true; // 무한 반복 설정
      weddingAudio.volume = 0.3; 
    }

    if (weddingAudio.paused) {
      weddingAudio.play().then(function() {
        console.log("👉 iOS BGM 재생 성공!");
        removeAudioEvents(); // 성공 시 이벤트 해제
      }).catch(function(error) {
        console.log("👉 재생 대기 중:", error);
      });
    }
  }

  function removeAudioEvents() {
    document.removeEventListener('click', startWeddingBgm);
    document.removeEventListener('touchstart', startWeddingBgm);
  }

  // 화면 터치 및 마우스 클릭 시 가동
  document.addEventListener('click', startWeddingBgm);
  document.addEventListener('touchstart', startWeddingBgm);


})();
