import { cgStudies } from './cg-studies-data.js?v=20261030-smooth1';
import { getMediaSources } from './media-sources.js?v=20261030-smooth1';

const MOTION_TABS = ['demo', 'comparison', 'film', 'storyboards'];
let viewerCount = 0;

export function createCGProjectViewer(getLang, { additionalEntries = [] } = {}) {
  const suffix = ++viewerCount;
  const events = new AbortController();
  const listen = (node, type, callback, options = {}) => node.addEventListener(type, callback, { ...options, signal: events.signal });
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const button = (className, callback) => {
    const node = make('button', className);
    node.type = 'button';
    listen(node, 'click', callback);
    return node;
  };
  const en = () => getLang() === 'en';
  const label = (zh, english) => en() ? english : zh;
  const titleOf = value => en() ? value?.titleEn || value?.title || '' : value?.title || value?.titleEn || '';
  const cgEntries = Array.isArray(cgStudies) ? cgStudies : Object.entries(cgStudies).map(([id, value]) => ({ id, ...value }));
  const entries = [...cgEntries, ...additionalEntries];
  const sheet = make('link');
  sheet.rel = 'stylesheet';
  sheet.href = new URL('./cg-project-viewer.css?v=20261030-smooth1', import.meta.url).href;
  document.head.append(sheet);

  const dialog = make('dialog', 'cg-project-dialog');
  dialog.id = suffix === 1 ? 'cgProjectDialog' : `cgProjectDialog${suffix}`;
  dialog.setAttribute('aria-labelledby', `cgViewerTitle${suffix}`);
  const head = make('div', 'cg-viewer-head');
  const identity = make('div', 'cg-viewer-identity');
  const eyebrow = make('p', 'cg-viewer-eyebrow', 'CG & MOTION / MINGZE LI');
  const title = make('h2', 'cg-viewer-title');
  title.id = `cgViewerTitle${suffix}`;
  identity.append(eyebrow, title);
  const closeButton = button('cg-viewer-close', close);
  head.append(identity, closeButton);

  const tabs = make('div', 'cg-viewer-tabs');
  tabs.setAttribute('role', 'tablist');
  const panel = make('div', 'cg-viewer-panel');
  panel.id = `cgViewerPanel${suffix}`;
  panel.setAttribute('role', 'tabpanel');
  const mediaBox = make('div', 'cg-viewer-media');
  const video = make('video', 'cg-viewer-video');
  video.controls = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  const errorBox = make('div', 'cg-viewer-error');
  errorBox.setAttribute('role', 'status');
  errorBox.setAttribute('aria-live', 'polite');
  const errorText = make('p');
  const videoActions = make('div', 'cg-viewer-video-actions');
  const playButton = button('cg-viewer-pill', () => playVideo());
  const retryButton = button('cg-viewer-pill', () => loadVideo(true));
  const directLink = make('a', 'cg-viewer-pill');
  directLink.target = '_blank';
  directLink.rel = 'noopener';
  videoActions.append(playButton, retryButton, directLink);
  errorBox.append(errorText, videoActions);
  errorBox.hidden = true;
  const qualityBar = make('div', 'cg-viewer-video-actions');
  qualityBar.style.padding = '12px'; qualityBar.hidden = true;
  const originalLink = make('a', 'cg-viewer-pill');
  originalLink.target = '_blank'; originalLink.rel = 'noopener'; originalLink.dataset.originalMedia = '';
  qualityBar.append(originalLink);
  mediaBox.append(video, errorBox, qualityBar);

  const imageBox = make('div', 'cg-viewer-images');
  const imageStage = make('div', 'cg-viewer-image-stage');
  const storyboardImage = make('img', 'cg-viewer-storyboard');
  storyboardImage.decoding = 'async';
  const comparison = make('div', 'cg-compare-frame');
  const afterImage = make('img', 'cg-compare-image cg-compare-after');
  const beforeImage = make('img', 'cg-compare-image cg-compare-before');
  for (const image of [beforeImage, afterImage]) { image.draggable = false; image.decoding = 'async'; }
  const beforeTag = make('span', 'cg-compare-tag cg-compare-tag-before');
  const afterTag = make('span', 'cg-compare-tag cg-compare-tag-after');
  const divider = make('span', 'cg-compare-divider');
  divider.setAttribute('aria-hidden', 'true');
  const handle = make('span', 'cg-compare-handle');
  handle.append(make('span', '', '‹'), make('span', '', '›'));
  divider.append(handle);
  const range = make('input', 'cg-compare-range');
  range.type = 'range'; range.min = '0'; range.max = '100'; range.step = '1'; range.value = '50';
  comparison.append(afterImage, beforeImage, beforeTag, afterTag, divider, range);
  const imageNotice = make('p', 'cg-viewer-image-notice');
  imageNotice.setAttribute('role', 'status'); imageNotice.hidden = true;
  imageStage.append(storyboardImage, comparison, imageNotice);

  const imageToolbar = make('div', 'cg-viewer-image-toolbar');
  const imageMeta = make('div', 'cg-viewer-image-meta');
  const frameTitle = make('p', 'cg-viewer-frame-title');
  const frameHint = make('p', 'cg-viewer-frame-hint');
  imageMeta.append(frameTitle, frameHint);
  const pager = make('div', 'cg-viewer-pager');
  const previous = button('cg-viewer-round', () => stepImage(-1)); previous.textContent = '←';
  const counter = make('span', 'cg-viewer-counter'); counter.setAttribute('aria-live', 'polite');
  const next = button('cg-viewer-round', () => stepImage(1)); next.textContent = '→';
  pager.append(previous, counter, next);
  imageToolbar.append(imageMeta, pager);
  const views = make('div', 'cg-viewer-views');
  const viewButtons = [
    button('cg-viewer-pill', () => setSplit(100)),
    button('cg-viewer-pill', () => setSplit(50)),
    button('cg-viewer-pill', () => setSplit(0))
  ];
  views.append(...viewButtons);
  const thumbs = make('div', 'cg-viewer-thumbs');
  imageBox.append(imageStage, imageToolbar, views, thumbs);
  panel.append(mediaBox, imageBox);
  dialog.append(head, tabs, panel);
  document.body.append(dialog);

  let project = null, activeTab = 'film', imageIndex = 0, split = 50;
  let focusBefore = null, savedScroll = null, locked = false, bodyStyles = null, htmlOverflow = null;
  let disposed = false, pointerId = null, imageLoadToken = 0;
  let videoToken = 0, playbackTimer = null, playbackState = 'idle', playbackRequested = false;
  let tabButtons = [], thumbButtons = [];
  const isArt = () => project?.category === 'art';
  const isGallery = () => project?.type === 'gallery';
  const selectedImages = () => project?.type === 'still' ? project.comparisons || [] : isGallery() ? project.images || [] : project?.storyboards || [];
  const isImageTab = () => project?.type === 'still' || isGallery() || activeTab === 'storyboards';
  const sideLabel = side => isArt()
    ? label(side === 'a' ? '方案 A' : '方案 B', side === 'a' ? 'VERSION A' : 'VERSION B')
    : label(side === 'a' ? '白模' : '成品', side === 'a' ? 'CLAY' : 'RENDER');
  const tabLabel = tab => ({ demo: 'Demo', comparison: label('白模对比', 'Clay comparison'), film: label('成片', 'Film'), storyboards: label('分镜', 'Storyboard') })[tab];

  function clearVideo() {
    ++videoToken;
    clearTimeout(playbackTimer); playbackTimer = null;
    playbackRequested = false; playbackState = 'idle';
    video.pause();
    video.removeAttribute('src');
    video.removeAttribute('poster');
    delete video.dataset.originalSrc;
    video.load();
    errorBox.hidden = true;
    mediaBox.removeAttribute('aria-busy');
    directLink.removeAttribute('href');
    originalLink.removeAttribute('href'); qualityBar.hidden = true;
  }
  function playbackMessage() {
    const messages = {
      ready: ['点击播放，或使用下方播放器控件。', 'Press play or use the player controls below.'],
      loading: ['正在载入视频…', 'Loading video…'],
      blocked: ['请点击播放，或直接打开视频。', 'Press play or open the video directly.'],
      error: ['视频未能播放，可重新加载或直接打开。', 'Playback failed. Reload or open the video directly.'],
      timeout: ['加载用时较长，可重新加载或直接打开视频。', 'Loading is taking longer. Reload or open the video directly.'],
      paused: ['视频已暂停。', 'Video paused.'],
      ended: ['播放结束，可再次播放。', 'Playback ended. Play again.'],
      missing: ['这段视频暂时无法载入。', 'This video is temporarily unavailable.']
    };
    const message = messages[playbackState];
    errorText.textContent = message ? label(...message) : '';
    playButton.textContent = playbackState === 'ended' ? label('再次播放', 'Play again') : label('播放视频', 'Play video');
    retryButton.textContent = label('重新加载', 'Reload');
    directLink.textContent = label('直接打开视频 ↗', 'Open video ↗');
    originalLink.textContent = label('高清原片 ↗', 'Original quality ↗');
    const available = !!video.getAttribute('src');
    playButton.hidden = !available || playbackState === 'loading' || playbackState === 'error';
    retryButton.hidden = !available || ['ready', 'paused', 'ended'].includes(playbackState);
    directLink.hidden = !available;
  }
  function showPlayback(state) {
    playbackState = state;
    errorBox.hidden = state === 'idle' || state === 'playing';
    mediaBox.setAttribute('aria-busy', String(state === 'loading'));
    playbackMessage();
  }
  function waitForPlayback() {
    if (playbackTimer !== null) return;
    const token = videoToken;
    playbackTimer = setTimeout(() => {
      playbackTimer = null;
      if (token === videoToken && dialog.open && playbackRequested) showPlayback('timeout');
    }, 12000);
  }
  function playVideo() {
    if (!dialog.open || !video.getAttribute('src')) return;
    const token = videoToken;
    playbackRequested = true;
    showPlayback('loading');
    waitForPlayback();
    // Keep play() in the click/tab gesture so iOS can authorize audible video.
    let attempt;
    try { attempt = video.play(); }
    catch (failure) { playbackFailed(failure, token); return; }
    Promise.resolve(attempt).catch(failure => playbackFailed(failure, token));
  }
  function playbackFailed(failure, token) {
    if (token !== videoToken || disposed || !dialog.open) return;
    clearTimeout(playbackTimer); playbackTimer = null;
    playbackRequested = false;
    showPlayback(failure?.name === 'NotAllowedError' ? 'blocked' : 'error');
  }
  function loadVideo(autoplay = false) {
    clearVideo();
    const media = project?.media?.[activeTab];
    if (!media?.src) { showPlayback('missing'); return; }
    if (media.poster || project.cover) video.poster = media.poster || project.cover;
    const source = getMediaSources(media.src);
    video.dataset.originalSrc = media.src;
    video.src = source.src;
    directLink.href = source.src;
    originalLink.href = source.originalSrc;
    qualityBar.hidden = !source.isLite;
    video.load();
    showPlayback('ready');
    if (autoplay && dialog.open) playVideo();
  }
  listen(video, 'error', () => {
    if (video.getAttribute('src') && video.error) playbackFailed(video.error, videoToken);
  });
  listen(video, 'play', () => {
    if (!dialog.open || !video.getAttribute('src') || video.paused) return;
    playbackRequested = true; showPlayback('loading'); waitForPlayback();
  });
  listen(video, 'playing', () => {
    if (!dialog.open || !video.getAttribute('src') || video.paused) return;
    clearTimeout(playbackTimer); playbackTimer = null;
    playbackRequested = true; showPlayback('playing');
  });
  for (const event of ['waiting', 'stalled']) listen(video, event, () => {
    if (event === 'stalled' && video.readyState >= 3) return;
    if (dialog.open && video.getAttribute('src') && playbackRequested && !video.paused) {
      showPlayback('loading'); waitForPlayback();
    }
  });
  listen(video, 'pause', () => {
    if (!dialog.open || !video.getAttribute('src') || !video.paused || video.ended || playbackState === 'idle') return;
    clearTimeout(playbackTimer); playbackTimer = null;
    playbackRequested = false;
    if (['playing', 'loading', 'timeout'].includes(playbackState)) showPlayback('paused');
  });
  listen(video, 'ended', () => {
    clearTimeout(playbackTimer); playbackTimer = null;
    playbackRequested = false;
    if (dialog.open && video.getAttribute('src')) showPlayback('ended');
  });

  function setSplit(value) {
    split = Math.max(0, Math.min(100, Number(value) || 0));
    range.value = String(split);
    beforeImage.style.clipPath = `inset(0 ${100 - split}% 0 0)`;
    divider.style.left = `${split}%`;
    divider.hidden = split === 0 || split === 100;
    beforeTag.hidden = split === 0;
    afterTag.hidden = split === 100;
    viewButtons.forEach((node, index) => node.setAttribute('aria-pressed', String(split === [100, 50, 0][index])));
    range.setAttribute('aria-valuetext', isArt()
      ? `${sideLabel('a')} ${Math.round(split)}%, ${sideLabel('b')} ${Math.round(100 - split)}%`
      : label(`白模 ${Math.round(split)}%，成品 ${Math.round(100 - split)}%`, `Clay ${Math.round(split)}%, render ${Math.round(100 - split)}%`));
  }
  function pointerSplit(event) {
    const bounds = comparison.getBoundingClientRect();
    if (bounds.width) setSplit((event.clientX - bounds.left) / bounds.width * 100);
  }
  listen(range, 'input', () => setSplit(range.value));
  listen(range, 'pointerdown', event => {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    event.preventDefault();
    pointerId = event.pointerId;
    range.focus({ preventScroll: true });
    range.setPointerCapture(pointerId);
    pointerSplit(event);
  });
  listen(range, 'pointermove', event => { if (pointerId === event.pointerId) pointerSplit(event); });
  const releasePointer = event => {
    if (pointerId !== event.pointerId) return;
    if (range.hasPointerCapture(pointerId)) range.releasePointerCapture(pointerId);
    pointerId = null;
  };
  listen(range, 'pointerup', releasePointer);
  listen(range, 'pointercancel', releasePointer);
  listen(range, 'lostpointercapture', () => { pointerId = null; });

  function fitComparison() {
    if (!project || project.type !== 'still' || !dialog.open) return;
    const item = selectedImages()[imageIndex];
    const width = Number(item?.width) || afterImage.naturalWidth || 16;
    const height = Number(item?.height) || afterImage.naturalHeight || 9;
    const ratio = width / height;
    comparison.style.width = `${Math.min(imageStage.clientWidth, imageStage.clientHeight * ratio)}px`;
    comparison.style.aspectRatio = String(ratio);
  }
  const resizeObserver = new ResizeObserver(fitComparison);
  resizeObserver.observe(imageStage);
  for (const image of [beforeImage, afterImage, storyboardImage]) listen(image, 'load', fitComparison);

  function showImage(index, focusThumbnail = false) {
    const items = selectedImages();
    imageIndex = items.length ? (index + items.length) % items.length : 0;
    const item = items[imageIndex];
    const still = project?.type === 'still';
    const loadToken = ++imageLoadToken;
    storyboardImage.hidden = still;
    comparison.hidden = !still;
    views.hidden = !still;
    imageNotice.hidden = !!item;
    if (!item) {
      storyboardImage.removeAttribute('src');
      beforeImage.removeAttribute('src'); afterImage.removeAttribute('src');
      imageNotice.textContent = label('暂无可展示的图片。', 'No images available.');
    } else if (still) {
      comparison.style.visibility = 'hidden';
      beforeImage.src = item.before;
      afterImage.src = item.after;
      setSplit(50);
      fitComparison();
    } else { storyboardImage.style.visibility = 'hidden'; storyboardImage.src = item.src; }
    if (item) {
      imageNotice.hidden = false;
      imageNotice.textContent = label('正在载入画面…', 'Loading image…');
      // Reveal a comparison only when both sides are decoded, so a fast switch
      // cannot briefly combine pictures from two different pairs.
      Promise.all((still ? [beforeImage, afterImage] : [storyboardImage]).map(image => image.decode()))
        .then(() => {
          if (loadToken !== imageLoadToken || disposed) return;
          comparison.style.visibility = ''; storyboardImage.style.visibility = '';
          imageNotice.hidden = true; fitComparison();
        })
        .catch(() => {
          if (loadToken !== imageLoadToken || disposed) return;
          imageNotice.hidden = false;
          imageNotice.textContent = label('图片暂未载入，请切换后重试。', 'Image unavailable. Switch views to retry.');
        });
    }
    thumbButtons.forEach((node, itemIndex) => node.setAttribute('aria-pressed', String(itemIndex === imageIndex)));
    previous.disabled = next.disabled = items.length < 2;
    updateLabels();
    if (focusThumbnail) thumbButtons[imageIndex]?.focus({ preventScroll: true });
    thumbButtons[imageIndex]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  function stepImage(delta) { showImage(imageIndex + delta); }
  function buildThumbnails() {
    thumbs.replaceChildren();
    thumbButtons = selectedImages().map((item, index) => {
      const node = button('cg-viewer-thumb', () => showImage(index));
      const image = make('img');
      image.src = item.after || item.src;
      image.alt = ''; image.loading = 'lazy'; image.decoding = 'async';
      node.append(image, make('span', '', String(index + 1).padStart(2, '0')));
      node.dataset.frame = String(index);
      thumbs.append(node);
      return node;
    });
  }
  function chooseTab(tab, focusTab = false) {
    activeTab = MOTION_TABS.includes(tab) ? tab : 'film';
    clearVideo();
    tabButtons.forEach((node, index) => {
      const selected = MOTION_TABS[index] === activeTab;
      node.setAttribute('aria-selected', String(selected));
      node.tabIndex = selected ? 0 : -1;
      if (selected) { panel.setAttribute('aria-labelledby', node.id); if (focusTab) node.focus(); }
    });
    const images = isImageTab();
    mediaBox.hidden = images;
    imageBox.hidden = !images;
    if (images) { buildThumbnails(); showImage(0); }
    else loadVideo(true);
    updateLabels();
  }
  function buildTabs() {
    tabs.replaceChildren(); tabButtons = [];
    const imageOnly = project.type === 'still' || isGallery();
    tabs.hidden = imageOnly;
    if (imageOnly) { panel.removeAttribute('role'); panel.removeAttribute('aria-labelledby'); return; }
    panel.setAttribute('role', 'tabpanel');
    tabButtons = MOTION_TABS.map((tab, index) => {
      const node = button('cg-viewer-tab', () => chooseTab(tab));
      node.id = `cgViewerTab${suffix}-${tab}`;
      node.dataset.tab = tab;
      node.setAttribute('role', 'tab');
      node.setAttribute('aria-controls', panel.id);
      listen(node, 'keydown', event => {
        let target = index;
        if (event.key === 'ArrowRight') target = (index + 1) % MOTION_TABS.length;
        else if (event.key === 'ArrowLeft') target = (index + MOTION_TABS.length - 1) % MOTION_TABS.length;
        else if (event.key === 'Home') target = 0;
        else if (event.key === 'End') target = MOTION_TABS.length - 1;
        else return;
        event.preventDefault(); event.stopPropagation(); chooseTab(MOTION_TABS[target], true);
      });
      tabs.append(node); return node;
    });
  }
  function updateLabels() {
    if (!project) return;
    const item = selectedImages()[imageIndex];
    const still = project.type === 'still';
    const art = isArt(), gallery = isGallery();
    eyebrow.textContent = art ? 'AI ART / MINGZE LI' : 'CG & MOTION / MINGZE LI';
    title.textContent = titleOf(project);
    closeButton.textContent = label('关闭 ×', 'CLOSE ×');
    closeButton.setAttribute('aria-label', art ? label('关闭美术作品', 'Close art study') : label('关闭 CG 作品', 'Close CG project'));
    tabs.setAttribute('aria-label', label('项目制作阶段', 'Project stages'));
    tabButtons.forEach((node, index) => { node.textContent = tabLabel(MOTION_TABS[index]); });
    video.setAttribute('aria-label', art ? titleOf(project) : `${titleOf(project)} / ${tabLabel(activeTab)}`);
    playbackMessage();
    beforeTag.textContent = sideLabel('a'); afterTag.textContent = sideLabel('b');
    range.setAttribute('aria-label', art ? label('拖动比较方案 A 与方案 B', 'Drag to compare version A and version B') : label('拖动比较白模与成品', 'Drag to compare clay and render'));
    previous.setAttribute('aria-label', art ? label(still ? '上一组方案' : '上一张图片', still ? 'Previous comparison' : 'Previous image') : label(still ? '上一个角度' : '上一张分镜', still ? 'Previous angle' : 'Previous storyboard'));
    next.setAttribute('aria-label', art ? label(still ? '下一组方案' : '下一张图片', still ? 'Next comparison' : 'Next image') : label(still ? '下一个角度' : '下一张分镜', still ? 'Next angle' : 'Next storyboard'));
    frameTitle.textContent = titleOf(item) || (art ? label(still ? '方案对照' : '美术图片', still ? 'Version comparison' : 'Art study') : label(still ? '白模与成品对照' : '分镜', still ? 'Clay and render' : 'Storyboard'));
    frameHint.textContent = still ? label('拖动分割线 · ← → 调整对比', 'DRAG TO COMPARE · ← → ADJUST SPLIT') : gallery ? label('← → 浏览图片', '← → BROWSE IMAGES') : label('← → 浏览分镜', '← → BROWSE STORYBOARDS');
    counter.textContent = `${String(selectedImages().length ? imageIndex + 1 : 0).padStart(2, '0')} / ${String(selectedImages().length).padStart(2, '0')}`;
    viewButtons[0].textContent = art ? label('只看 A', 'A only') : label('只看白模', 'Clay only');
    viewButtons[1].textContent = label('对比', 'Compare');
    viewButtons[2].textContent = art ? label('只看 B', 'B only') : label('只看成品', 'Render only');
    thumbs.setAttribute('aria-label', art ? label(still ? '选择方案对照' : '选择图片', still ? 'Choose comparison' : 'Choose image') : label(still ? '选择角度' : '选择分镜', still ? 'Choose angle' : 'Choose storyboard'));
    thumbButtons.forEach((node, index) => node.setAttribute('aria-label', `${index + 1}. ${titleOf(selectedImages()[index]) || titleOf(project)}`));
    beforeImage.alt = `${titleOf(item)} — ${art ? sideLabel('a') : label('白模', 'Clay')}`;
    afterImage.alt = `${titleOf(item)} — ${art ? sideLabel('b') : label('成品', 'Render')}`;
    storyboardImage.alt = titleOf(item) || `${titleOf(project)} — ${gallery ? label('美术图片', 'Art study') : label('分镜', 'Storyboard')}`;
    setSplit(split);
  }

  function lockBackground() {
    if (locked) return;
    locked = true;
    focusBefore = document.activeElement;
    savedScroll = { x: scrollX, y: scrollY };
    const properties = ['position', 'top', 'left', 'width', 'overflow'];
    bodyStyles = properties.map(name => [name, document.body.style.getPropertyValue(name), document.body.style.getPropertyPriority(name)]);
    htmlOverflow = [document.documentElement.style.getPropertyValue('overflow'), document.documentElement.style.getPropertyPriority('overflow')];
    document.body.classList.add('cg-dialog-open');
    document.body.style.position = 'fixed';
    document.body.style.top = `${-savedScroll.y}px`;
    document.body.style.left = `${-savedScroll.x}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.setProperty('overflow', 'hidden');
  }
  function unlockBackground() {
    if (!locked) return;
    locked = false;
    clearVideo();
    document.body.classList.remove('cg-dialog-open');
    bodyStyles.forEach(([name, value, priority]) => value ? document.body.style.setProperty(name, value, priority) : document.body.style.removeProperty(name));
    if (htmlOverflow[0]) document.documentElement.style.setProperty('overflow', ...htmlOverflow);
    else document.documentElement.style.removeProperty('overflow');
    scrollTo({ left: savedScroll.x, top: savedScroll.y, behavior: 'instant' });
    if (focusBefore?.isConnected && typeof focusBefore.focus === 'function') focusBefore.focus({ preventScroll: true });
    pointerId = null;
  }
  function open(id, tab = 'film') {
    if (disposed) return false;
    const entry = entries.find(item => item.id === id);
    if (!entry || [...document.querySelectorAll('dialog[open]')].some(node => node !== dialog)) return false;
    project = entry; imageIndex = 0; split = 50;
    buildTabs();
    lockBackground();
    if (!dialog.open) dialog.showModal();
    chooseTab(tab);
    dialog.scrollTop = 0;
    closeButton.focus({ preventScroll: true });
    fitComparison();
    return true;
  }
  function close() {
    if (dialog.open) dialog.close();
    unlockBackground();
  }
  listen(dialog, 'close', () => { if (!dialog.open) unlockBackground(); });
  listen(dialog, 'cancel', event => { event.preventDefault(); close(); });
  listen(dialog, 'keydown', event => {
    if (!isImageTab() || event.target === range || event.target.closest('[role="tab"]')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); event.stopPropagation(); stepImage(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  listen(window, 'languagechange', updateLabels);
  return {
    open, close,
    dispose() {
      if (disposed) return;
      close(); disposed = true; events.abort(); resizeObserver.disconnect(); dialog.remove(); sheet.remove();
    }
  };
}
