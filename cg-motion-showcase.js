import { cgStudies } from './cg-studies-data.js?v=20261030-smooth1';
import { getMediaSources } from './media-sources.js?v=20261030-smooth1';

// The media stays inline. Only an explicit play action starts playback.
export function createCGMotionShowcase(getLang) {
  const styleId = 'cg-motion-showcase-style';
  if (!document.getElementById(styleId)) {
    const css = document.createElement('link');
    css.id = styleId;
    css.rel = 'stylesheet';
    css.href = new URL('./cg-motion-showcase.css?v=20261030-smooth1', import.meta.url).href;
    document.head.append(css);
  }
  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };
  const localized = (study, field, en, fallback = '') => {
    const value = en ? study?.[`${field}En`] || study?.[field] : study?.[field];
    return typeof value === 'object' && value ? value[en ? 'en' : 'zh'] || value.zh || value.en || fallback : value || fallback;
  };
  let host = null;
  let video = null;
  let observer = null;
  let events = null;
  let selected = 'film';
  let disposed = false;
  let videoToken = 0;
  let playbackTimer = null;

  function releaseVideo() {
    ++videoToken;
    clearTimeout(playbackTimer);
    playbackTimer = null;
    if (!video) return;
    video.pause();
    video.removeAttribute('src');
    delete video.dataset.originalSrc;
    video.load();
  }

  function clearMount() {
    observer?.disconnect();
    observer = null;
    events?.abort();
    events = null;
    releaseVideo();
    video = null;
  }

  function sync() {
    if (disposed) return;
    clearMount();
    host = document.getElementById('idtalkBody');
    if (!host) return;
    const section = host.closest('#idtalk');
    section?.classList.remove('idtalk-showcase');
    section?.classList.add('cg-motion-section');
    section?.setAttribute('aria-label', 'CG / MOTION');
    host.classList.add('cg-motion-showcase');
    host.replaceChildren();
    events = new AbortController();
    const listen = (target, type, listener) => target.addEventListener(type, listener, { signal: events.signal });
    const en = getLang() === 'en';
    const study = cgStudies.find(item => item.id === 'acer');
    const head = make('div', 'cg-motion-head');
    const identity = make('div', 'cg-motion-identity');
    identity.append(make('p', 'sec-eyebrow', '02 / CG & MOTION'), make('h2', 'cg-motion-title', 'CG / MOTION'));
    const intro = make('div', 'cg-motion-intro');
    intro.append(
      make('h3', '', localized(study, 'title', en, en ? 'Acer · Digital Product Film' : 'Acer · 3C 数码广告')),
      make('p', '', localized(study, 'summary', en, en ? 'Explore the demo, the blocking comparison and the finished film — from camera movement to light and materials.' : '从 Demo、白模对比到最终成片，观察镜头运动、产品结构与灯光材质的变化。'))
    );
    head.append(identity, intro);
    const showcase = make('div', 'cg-motion-player');
    const tabs = make('div', 'cg-motion-tabs');
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', en ? 'Acer production stages' : 'Acer 制作阶段');
    const panel = make('div', 'cg-motion-panel');
    panel.id = 'cgMotionPanel';
    panel.setAttribute('role', 'tabpanel');
    panel.tabIndex = 0;
    video = make('video', 'cg-motion-video');
    video.controls = true;
    video.playsInline = true;
    video.preload = 'none';
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    const play = make('button', 'cg-motion-play');
    play.type = 'button';
    const playIcon = make('span', 'cg-motion-play-icon', '▶');
    playIcon.setAttribute('aria-hidden', 'true');
    const playLabel = make('span', 'cg-motion-play-label');
    play.append(playIcon, playLabel);
    const error = make('div', 'cg-motion-error');
    error.hidden = true;
    error.setAttribute('role', 'status');
    error.setAttribute('aria-live', 'polite');
    // Leave native play, seek and fullscreen controls reachable during a retry.
    error.style.bottom = '48px';
    error.style.padding = '12px';
    const message = make('p', '');
    const retry = make('button', '', en ? 'Retry playback' : '重新播放');
    retry.type = 'button';
    const direct = make('a', '', en ? 'Open video ↗' : '直接打开视频 ↗');
    direct.target = '_blank';
    direct.rel = 'noopener';
    error.append(message, retry, direct);
    panel.append(video, play, error);
    const caption = make('p', 'cg-motion-caption');
    caption.setAttribute('aria-live', 'polite');
    const original = make('a', '', en ? 'Original quality ↗' : '高清原片 ↗');
    original.target = '_blank'; original.rel = 'noopener'; original.dataset.originalMedia = '';
    original.style.cssText = 'color:#d8e8ad;margin-left:16px;white-space:nowrap';
    showcase.append(tabs, panel, caption);
    host.append(head, showcase);

    const choices = [
      { id: 'demo', zh: 'Demo', en: 'Demo', description: en ? 'Demo / Camera movement and visual rhythm' : 'Demo / 镜头运动与视觉节奏' },
      { id: 'comparison', zh: '白模对比', en: 'Blocking comparison', description: en ? 'Blocking comparison / Camera structure and finished look' : '白模对比 / 镜头结构与最终效果' },
      { id: 'film', zh: '成片', en: 'Final film', description: en ? 'Final film / Light, materials and product detail' : '成片 / 灯光、材质与产品细节' }
    ];
    let playbackState = 'ready';
    let playbackRequested = false;
    const buttons = choices.map((choice, index) => {
      const button = make('button', 'cg-motion-tab', en ? choice.en : choice.zh);
      button.type = 'button';
      button.id = `cgMotionTab-${choice.id}`;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', panel.id);
      listen(button, 'click', () => select(choice.id));
      listen(button, 'keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % choices.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + choices.length) % choices.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = choices.length - 1;
        else return;
        event.preventDefault();
        select(choices[next].id);
        buttons[next].focus();
      });
      tabs.append(button);
      return button;
    });

    function select(id) {
      releaseVideo();
      playbackRequested = false;
      playbackState = 'ready';
      panel.removeAttribute('aria-busy');
      selected = id;
      const choice = choices.find(item => item.id === id) || choices[2];
      const media = study?.media?.[id];
      buttons.forEach((button, index) => {
        const active = choices[index].id === id;
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', `cgMotionTab-${id}`);
      panel.dataset.stage = id;
      video.poster = media?.poster || study?.cover || '';
      video.setAttribute('aria-label', `${localized(study, 'title', en, 'Acer')} · ${en ? choice.en : choice.zh}`);
      caption.textContent = choice.description;
      error.hidden = true;
      retry.hidden = false;
      play.hidden = !media?.src;
      playLabel.textContent = en ? `Play ${choice.en}` : `播放${choice.zh === 'Demo' ? ' Demo' : choice.zh}`;
      play.setAttribute('aria-label', video.getAttribute('aria-label'));
      if (media?.src) {
        const source = getMediaSources(media.src);
        video.dataset.originalSrc = media.src;
        video.src = source.src;
        direct.href = source.src;
        original.href = source.originalSrc;
        if (source.isLite) caption.append(original);
        direct.hidden = false;
      } else {
        message.textContent = en ? 'This video is temporarily unavailable.' : '这段视频暂时无法载入。';
        retry.hidden = true;
        direct.hidden = true;
        error.hidden = false;
      }
    }

    function showPlayback(state) {
      playbackState = state;
      panel.setAttribute('aria-busy', String(state === 'loading'));
      play.hidden = !['ready', 'paused', 'ended'].includes(state);
      error.hidden = ['ready', 'paused', 'ended', 'playing'].includes(state);
      retry.hidden = false;
      retry.textContent = state === 'blocked' ? (en ? 'Play video' : '点击播放') : (en ? 'Reload video' : '重新加载');
      const messages = {
        loading: en ? 'Loading video…' : '正在载入视频…',
        blocked: en ? 'Press play or open the video directly.' : '请点击播放，或直接打开视频。',
        error: en ? 'Playback failed. Reload or open the video directly.' : '视频未能播放，可重新加载或直接打开。',
        timeout: en ? 'Loading is taking longer. Reload or open the video directly.' : '加载用时较长，可重新加载或直接打开视频。'
      };
      message.textContent = messages[state] || '';
    }
    function waitForPlayback() {
      if (playbackTimer !== null) return;
      const token = videoToken;
      playbackTimer = setTimeout(() => {
        playbackTimer = null;
        if (token === videoToken && !disposed && playbackRequested) showPlayback('timeout');
      }, 12000);
    }
    function playbackFailed(failure, token) {
      if (token !== videoToken || disposed || events?.signal.aborted) return;
      clearTimeout(playbackTimer); playbackTimer = null;
      playbackRequested = false;
      showPlayback(failure?.name === 'NotAllowedError' ? 'blocked' : 'error');
    }
    function playCurrent() {
      if (!video?.getAttribute('src')) return;
      const token = videoToken;
      playbackRequested = true;
      showPlayback('loading'); waitForPlayback();
      // Do not await a metadata event before play(): iOS needs the tap gesture.
      let attempt;
      try { attempt = video.play(); }
      catch (failure) { playbackFailed(failure, token); return; }
      Promise.resolve(attempt).catch(failure => playbackFailed(failure, token));
    }
    listen(play, 'click', playCurrent);
    listen(retry, 'click', () => {
      if (playbackState !== 'blocked') {
        ++videoToken;
        clearTimeout(playbackTimer); playbackTimer = null;
        video.load();
      }
      playCurrent();
    });
    listen(video, 'play', () => {
      if (!video.getAttribute('src') || video.paused) return;
      playbackRequested = true; showPlayback('loading'); waitForPlayback();
    });
    listen(video, 'playing', () => {
      if (!video.getAttribute('src') || video.paused) return;
      clearTimeout(playbackTimer); playbackTimer = null;
      playbackRequested = true; showPlayback('playing');
    });
    for (const event of ['waiting', 'stalled']) listen(video, event, () => {
      if (event === 'stalled' && video.readyState >= 3) return;
      if (video.getAttribute('src') && playbackRequested && !video.paused) {
        showPlayback('loading'); waitForPlayback();
      }
    });
    listen(video, 'pause', () => {
      if (!video.getAttribute('src') || !video.paused || video.ended || playbackState === 'ready') return;
      clearTimeout(playbackTimer); playbackTimer = null;
      playbackRequested = false;
      if (['playing', 'loading', 'timeout'].includes(playbackState)) showPlayback('paused');
    });
    listen(video, 'ended', () => {
      clearTimeout(playbackTimer); playbackTimer = null;
      playbackRequested = false; showPlayback('ended');
    });
    listen(video, 'error', () => {
      if (video.getAttribute('src') && video.error) playbackFailed(video.error, videoToken);
    });
    listen(document, 'visibilitychange', () => { if (document.hidden) video?.pause(); });
    listen(window, 'pagehide', () => video?.pause());
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => !entry.isIntersecting)) video?.pause();
    }, { threshold: 0 });
    observer.observe(panel);
    select(selected);
  }

  function dispose() {
    disposed = true;
    clearMount();
    host?.replaceChildren();
    host?.classList.remove('cg-motion-showcase');
    host = null;
  }

  return { sync, dispose };
}
