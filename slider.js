const SLIDER_CONFIG = {
  // 以下数值以 background.png 的原始尺寸为基准，便于直接手调。
  backgroundWidth: 528,
  start: 76,
  end: 395,
  thumbScale: 0.15,
  thumbTop: 100,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getThumbLeft(pointerX, pointerOffset, start, end) {
  return clamp(pointerX - pointerOffset, start, end);
}

function getPercentage(left, start, end) {
  if (end === start) {
    return 0;
  }

  return Math.round(clamp((left - start) / (end - start), 0, 1) * 100);
}

function getLiangStatus(percentage) {
  const normalized = clamp(Number(percentage) || 0, 0, 100);

  if (normalized < 20) {
    return '梁神';
  }

  if (normalized < 40) {
    return '梁圣';
  }

  if (normalized < 60) {
    return '梁子';
  }

  if (normalized < 80) {
    return '牢梁';
  }

  return '梁畜';
}

function getStatusMessage(percentage, prefix = '当前祖率') {
  return `${prefix}：${percentage}% · ${getLiangStatus(percentage)}`;
}

function preventNativeDrag(element) {
  element.draggable = false;
  element.addEventListener('dragstart', (event) => event.preventDefault());
}

function initSlider() {
  const stage = document.querySelector('[data-slider-stage]');
  const thumb = document.querySelector('[data-slider-thumb]');
  const background = document.querySelector('[data-slider-background]');
  const status = document.querySelector('[data-slider-status]');

  if (!stage || !thumb || !background) {
    return;
  }

  preventNativeDrag(thumb);
  preventNativeDrag(background);

  let isDragging = false;
  let grabOffset = 0;
  let currentLeft = SLIDER_CONFIG.start;

  function getScale() {
    return stage.clientWidth / SLIDER_CONFIG.backgroundWidth;
  }

  function updateVisual(left = SLIDER_CONFIG.start, statusPrefix = '当前祖率') {
    const scale = getScale();
    const thumbWidth = thumb.naturalWidth * SLIDER_CONFIG.thumbScale;
    currentLeft = clamp(left, SLIDER_CONFIG.start, SLIDER_CONFIG.end);
    const scaledLeft = currentLeft * scale;
    const percentage = getPercentage(currentLeft, SLIDER_CONFIG.start, SLIDER_CONFIG.end);

    stage.style.setProperty('--thumb-left', `${scaledLeft}px`);
    stage.style.setProperty('--thumb-top', `${SLIDER_CONFIG.thumbTop * scale}px`);
    stage.style.setProperty('--thumb-width', `${thumbWidth * scale}px`);
    thumb.setAttribute('aria-valuenow', String(percentage));
    thumb.setAttribute('aria-valuetext', `${percentage}% · ${getLiangStatus(percentage)}`);
    setStatus(getStatusMessage(percentage, statusPrefix));
  }

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function getPointerX(event) {
    const rect = stage.getBoundingClientRect();
    const scale = getScale();
    return (event.clientX - rect.left) / scale;
  }

  function getLeftFromPointer(event) {
    return getThumbLeft(
      getPointerX(event),
      grabOffset,
      SLIDER_CONFIG.start,
      SLIDER_CONFIG.end,
    );
  }

  function moveThumb(event, statusPrefix = '正在调整祖率') {
    const left = getLeftFromPointer(event);
    updateVisual(left, statusPrefix);
  }

  thumb.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    isDragging = true;
    grabOffset = getPointerX(event) - currentLeft;
    thumb.setPointerCapture(event.pointerId);
    thumb.classList.add('is-dragging');
    moveThumb(event);
  });

  thumb.addEventListener('pointermove', (event) => {
    if (isDragging) {
      moveThumb(event);
    }
  });

  function stopDragging(event) {
    if (!isDragging) {
      return;
    }

    isDragging = false;
    if (thumb.hasPointerCapture(event.pointerId)) {
      thumb.releasePointerCapture(event.pointerId);
    }
    thumb.classList.remove('is-dragging');
    updateVisual(currentLeft);
  }

  thumb.addEventListener('pointerup', stopDragging);
  thumb.addEventListener('pointercancel', stopDragging);

  thumb.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 10 : 2;
    const currentPercentage = Number(thumb.getAttribute('aria-valuenow')) || 0;
    let nextPercentage = currentPercentage;

    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      nextPercentage -= step;
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      nextPercentage += step;
    } else {
      return;
    }

    event.preventDefault();
    nextPercentage = clamp(nextPercentage, 0, 100);
    const left = SLIDER_CONFIG.start +
      ((SLIDER_CONFIG.end - SLIDER_CONFIG.start) * nextPercentage) / 100;
    updateVisual(left);
  });

  background.addEventListener('load', () => updateVisual(currentLeft));
  thumb.addEventListener('load', () => updateVisual(currentLeft));
  background.addEventListener('error', () => {
    setStatus('背景图片加载失败，请检查图片路径');
  });
  thumb.addEventListener('error', () => {
    setStatus('旋钮图片加载失败，请检查图片路径');
  });

  window.addEventListener('resize', () => updateVisual(currentLeft));
  updateVisual(currentLeft);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    clamp,
    getPercentage,
    getThumbLeft,
    getLiangStatus,
    getStatusMessage,
    preventNativeDrag,
  };
}

if (typeof document !== 'undefined') {
  initSlider();
}
