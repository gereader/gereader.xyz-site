(function() {
  'use strict';
  
  if (window.lightboxLoaded) return;
  window.lightboxLoaded = true;

  let overlay = null;
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let lastTouchDistance = 0;

  window.openLightbox = function(src, alt) {
    if (overlay) return;
    
    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    
    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'lightbox-close';
    closeBtn.onclick = closeLightbox;
    
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.className = 'lightbox-image';
    
    // Reset state
    scale = 1; translateX = 0; translateY = 0; isDragging = false;
    
    setupEvents(img, overlay);
    
    overlay.appendChild(img);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
    document.addEventListener('keydown', escHandler);
  };

  function closeLightbox() {
    if (!overlay) return;
    document.body.removeChild(overlay);
    document.removeEventListener('keydown', escHandler);
    overlay = null;
  }

  function escHandler(e) {
    if (e.key === 'Escape') closeLightbox();
  }

  function setupEvents(img, overlay) {
    // Wheel zoom
    overlay.addEventListener('wheel', function(e) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      scale = Math.max(0.5, Math.min(scale * delta, 5));
      updateTransform(img);
    });

    // Touch zoom
    overlay.addEventListener('touchstart', function(e) {
      if (e.touches.length === 2) {
        lastTouchDistance = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
      }
    });

    overlay.addEventListener('touchmove', function(e) {
      e.preventDefault();
      if (e.touches.length === 2) {
        const touchDistance = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        scale = Math.max(0.5, Math.min(scale * (touchDistance / lastTouchDistance), 5));
        lastTouchDistance = touchDistance;
        updateTransform(img);
      }
    });

    // Mouse drag
    img.addEventListener('mousedown', function(e) {
      startDrag(e.clientX, e.clientY);
    });

    document.addEventListener('mousemove', function(e) {
      drag(e.clientX, e.clientY, img);
    });

    document.addEventListener('mouseup', stopDrag);

    // Touch drag
    img.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) {
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    });

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeLightbox();
    });
  }

  function startDrag(clientX, clientY) {
    isDragging = true;
    startX = clientX - translateX;
    startY = clientY - translateY;
  }

  function drag(clientX, clientY, img) {
    if (!isDragging) return;
    translateX = clientX - startX;
    translateY = clientY - startY;
    updateTransform(img);
  }

  function stopDrag() {
    isDragging = false;
  }

  function updateTransform(img) {
    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }
})();
