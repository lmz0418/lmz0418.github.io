(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover:hover) and (pointer:fine)');
  const home = document.body.classList.contains('home-page');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const all = [...(window.PORTFOLIO?.projects || []).map(p => ({...p,collection:'ai',cover:`assets/${p.id}-cover.webp`})), ...(window.CG_PROJECTS || []).map(p => ({...p,collection:'cg'}))];
  const projectURL = p => `project.html?${p.collection === 'cg' ? 'collection=cg&' : ''}id=${encodeURIComponent(p.id)}`;
  const sectionURL = id => home ? `#${id}` : `index.html#${id}`;
  const menuButton = '<button class="menu-trigger" type="button" data-ui-open="menu" aria-haspopup="dialog" aria-controls="navigation-dialog" aria-expanded="false"><span>菜单</span><i aria-hidden="true"><b></b><b></b><b></b><b></b></i></button>';
  const header = $('.site-header');
  if (header) {
    const brand = $('.wordmark',header).outerHTML;
    const back = $('#back-to-work',header);
    header.innerHTML = `<div class="header-identity">${brand}${back ? `<a class="header-back" id="back-to-work" href="${escape(back.href)}">${escape(back.textContent)}</a>` : '<span class="header-descriptor">INDEPENDENT VISUAL DESIGNER</span>'}</div><div class="header-actions"><button class="header-index" type="button" data-ui-open="index">作品索引 <sup>12</sup></button><button class="contact-trigger" type="button" data-ui-open="contact">聊聊合作 <span aria-hidden="true">↗</span></button>${menuButton}</div>`;
  }
  $('.cover-top')?.insertAdjacentHTML('beforeend', `<div class="cover-menu">${menuButton}</div>`);

  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="navigation-dialog" class="ui-dialog" aria-labelledby="ui-heading">
      <div class="ui-panel" data-mode="menu">
        <div class="ui-panel-top"><button class="ui-back" type="button" aria-label="返回菜单"><span aria-hidden="true">←</span> MENU</button><span class="ui-panel-meta">MINGZE LI / VISUAL PORTFOLIO</span><button class="ui-close" type="button" aria-label="关闭面板">关闭 <span aria-hidden="true">×</span></button></div>
        <section class="ui-view menu-view" data-view="menu">
          <div class="menu-main"><div class="menu-overline"><span id="ui-heading">探索我的视觉世界</span><span>2026</span></div>
          <nav class="menu-links" aria-label="作品集导航">
            <a href="${sectionURL('work')}" data-section="work" data-menu-image="assets/seedance-cover.webp"><span class="menu-num">01</span><span class="menu-link-label">AI 影像<small>AI ADVERTISING</small></span><b aria-hidden="true">↗</b></a>
            <a href="${sectionURL('cg')}" data-section="cg" data-menu-image="assets/cg2-racing-cover.webp"><span class="menu-num">02</span><span class="menu-link-label">CG 与动态<small>CG & MOTION</small></span><b aria-hidden="true">↗</b></a>
            <a href="${sectionURL('practice')}" data-section="practice" data-menu-image="assets/seedance-character.webp"><span class="menu-num">03</span><span class="menu-link-label">美术过程<small>BEHIND THE IMAGE</small></span><b aria-hidden="true">↗</b></a>
            <a href="${sectionURL('about')}" data-section="about" data-menu-image="assets/cg2-device-cover.webp"><span class="menu-num">04</span><span class="menu-link-label">关于我<small>A LITTLE ABOUT ME</small></span><b aria-hidden="true">↗</b></a>
          </nav></div>
          <div class="menu-bottom"><button class="menu-world" type="button" data-reopen-world><img src="assets/playground-poster.webp" alt="互动视觉小世界" loading="lazy"><span>回到小小世界<small>A LITTLE PLAY ↗</small></span></button><button class="menu-contact-card" type="button" data-ui-open="contact"><span>有个新想法？<small>LET’S TALK</small></span><b aria-hidden="true">↗</b></button></div>
          <div class="menu-foot"><a href="resume.html" target="_blank" rel="noopener">查看简历 ↗</a><button type="button" data-ui-open="index">全部作品 <span>12</span> ↗</button></div>
        </section>
        <section class="ui-view contact-view" data-view="contact" hidden>
          <span class="ui-eyebrow">A GOOD CONVERSATION IS A START.</span><h2>下一帧，<br>一起想象。<span aria-hidden="true">✳</span></h2><p>关于 AI 广告美术、CG 与动态设计，<br>或是一个还没有形状的想法。</p>
          <a class="contact-email-link" href="mailto:1158609347@qq.com"><span>1158609347@qq.com</span><b aria-hidden="true">↗</b></a>
          <div class="contact-options"><button type="button" data-clipboard="1158609347@qq.com"><span>EMAIL</span>复制邮箱 <b aria-hidden="true">⧉</b></button><button type="button" data-clipboard="lmz-Apr18"><span>WECHAT</span>lmz-Apr18 <b aria-hidden="true">⧉</b></button></div>
          <a class="contact-resume" href="assets/mingze-li-resume-20261029.pdf" download="李明泽_AI美术与视觉设计_简历.pdf">带走一份简历 <span>PDF ↓</span></a><p class="contact-feedback" role="status" aria-live="polite"></p>
        </section>
        <section class="ui-view index-view" data-view="index" hidden>
          <div class="index-heading"><div><span class="ui-eyebrow">SELECTED WORK / 2026</span><h2>作品索引<span>12</span></h2></div><div class="index-filters" role="group" aria-label="按作品类型筛选"><button type="button" data-filter="all" aria-pressed="true">全部 <sup>12</sup></button><button type="button" data-filter="ai" aria-pressed="false">AI <sup>06</sup></button><button type="button" data-filter="cg" aria-pressed="false">CG <sup>06</sup></button></div></div>
          <div class="index-body"><div class="index-list" aria-label="全部作品"></div><figure class="index-preview"><a href="project.html?id=seedance"><img src="assets/seedance-cover.webp" alt="Seedance 2.5 发布会视觉"><span>EXPLORE PROJECT ↗</span></a><figcaption><span class="index-preview-title">Seedance 2.5 发布会</span><small class="index-preview-category">AI / COMMERCIAL VISUALS</small></figcaption></figure></div>
        </section>
      </div>
    </dialog><div class="project-cursor" aria-hidden="true"><span>查看作品</span><b>↗</b></div>`);

  const dialog = $('#navigation-dialog'), panel = $('.ui-panel', dialog);
  const views = $$('.ui-view', dialog);
  let mode = 'menu', phase = 'closed', generation = 0, filter = 'all', returnFocus = null;
  const delay = duration => new Promise(resolve => setTimeout(resolve, reduced.matches ? 0 : duration));
  function updateButtons() {
    $$('[data-ui-open="menu"]').forEach(button => {const active=phase !== 'closed' && mode === 'menu';button.setAttribute('aria-expanded',String(active));$('span',button).textContent=active?'关闭':'菜单';});
  }
  function announceOverlay(open) {
    document.body.classList.toggle('ui-layer-open', open);
    document.dispatchEvent(new Event(open ? 'portfolio:overlay-open' : 'portfolio:overlay-close'));
  }
  function setView(next) {
    mode = next;
    panel.dataset.mode = next;
    dialog.dataset.mode = next;
    views.forEach(view => {view.hidden = view.dataset.view !== next;});
    $('.ui-back',dialog).hidden = next === 'menu';
    $('.ui-panel-meta',dialog).hidden = next !== 'menu';
    dialog.setAttribute('aria-label', {menu:'作品集菜单',contact:'联系李明泽',index:'全部作品索引'}[next]);
    dialog.removeAttribute('aria-labelledby');
    updateButtons();
  }
  async function open(next, trigger) {
    if (!['menu','contact','index'].includes(next)) return;
    if (phase === 'closing') await delay(270);
    const turn = ++generation;
    const shouldSwitch = dialog.open && mode !== next;
    if (!dialog.open) {
      returnFocus = trigger || document.activeElement;
      const rect = trigger?.getBoundingClientRect();
      panel.style.setProperty('--panel-origin-x', rect ? `${Math.min(95,Math.max(5,rect.left / innerWidth * 100))}%` : '95%');
      panel.style.setProperty('--panel-right', `${rect ? Math.max(14,document.documentElement.clientWidth-rect.right) : 40}px`);
      panel.style.setProperty('--panel-top', `${rect ? Math.min(105,Math.max(74,rect.bottom+12)) : 90}px`);
      setView(next);
      phase = 'opening';
      dialog.classList.remove('is-closing','is-switching');
      const scrollPosition = {left:scrollX, top:scrollY, behavior:'instant'};
      dialog.showModal();
      announceOverlay(true);
      scrollTo(scrollPosition);
      updateButtons();
      await delay(560);
    } else if (shouldSwitch) {
      phase = 'switching';
      dialog.classList.add('is-switching');
      await delay(150);
      if (turn !== generation) return;
      setView(next);
      dialog.classList.remove('is-switching');
      await delay(500);
    }
    if (turn !== generation) return;
    phase = 'open';
    const focus = next === 'index' ? $('[data-filter].is-active',dialog) || $('[data-filter]',dialog) : next === 'contact' ? $('.contact-email-link',dialog) : $('.menu-links a',dialog);
    focus?.focus({preventScroll:true});
  }
  async function close(restoreFocus = true) {
    if (!dialog.open || phase === 'closing') return;
    ++generation;
    phase = 'closing';
    dialog.classList.add('is-closing');
    await delay(270);
    dialog.close();
    dialog.classList.remove('is-closing','is-switching');
    phase = 'closed';
    announceOverlay(false);
    updateButtons();
    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
  }
  function updatePreview(project) {
    $('.index-preview>a',dialog).href=projectURL(project);
    const img = $('.index-preview img',dialog);
    if (img.getAttribute('src') !== project.cover) { img.src = project.cover; img.alt = project.title; }
    $('.index-preview-title',dialog).textContent = project.title;
    $('.index-preview-category',dialog).textContent = project.category;
  }
  function renderIndex(nextFilter = filter) {
    filter = ['all','ai','cg'].includes(nextFilter) ? nextFilter : 'all';
    const shown = all.filter(p => filter === 'all' || p.collection === filter);
    $('.index-list',dialog).innerHTML = shown.map((p,i) => `<a class="index-item" href="${projectURL(p)}" data-project-key="${p.collection}:${p.id}"><span class="index-number">${String(i+1).padStart(2,'0')}</span><img src="${p.cover}" alt="" loading="lazy"><span class="index-item-label">${escape(p.title)}<small>${escape(p.category)}</small></span><b aria-hidden="true">↗</b></a>`).join('');
    $$('[data-filter]',dialog).forEach(button => {const active=button.dataset.filter===filter;button.setAttribute('aria-pressed',String(active));button.classList.toggle('is-active',active);});
    $('.index-list',dialog).scrollTop = 0;
    if(shown[0]) updatePreview(shown[0]);
    $$('.index-item',dialog).forEach(item => {
      const project=all.find(p=>`${p.collection}:${p.id}`===item.dataset.projectKey);
      ['pointerenter','focus'].forEach(event=>item.addEventListener(event,()=>{
        $$('.index-item',dialog).forEach(el=>el.classList.toggle('is-current',el===item));
        updatePreview(project);
      }));
    });
  }
  renderIndex();
  document.addEventListener('click', async event => {
    const trigger = event.target.closest('[data-ui-open]');
    if (trigger) {
      event.preventDefault();
      if (trigger.dataset.uiOpen === 'index') renderIndex(trigger.dataset.indexFilter || 'all');
      if (dialog.open && mode === trigger.dataset.uiOpen && phase !== 'closing' && !dialog.contains(trigger)) close();
      else open(trigger.dataset.uiOpen,trigger);
      return;
    }
    const contact=event.target.closest('.site-footer .contact-title,.header-contact,.project-footer a[href^="mailto"]');
    if(contact){event.preventDefault();open('contact',contact);}
  });
  $('.ui-close',dialog).addEventListener('click',()=>close());
  $('.ui-back',dialog).addEventListener('click',()=>open('menu'));
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  dialog.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;
    const stops=$$('a[href],button:not([disabled]),[tabindex="0"]',dialog).filter(el=>el.getClientRects().length&&!el.closest('[hidden]'));
    const first=stops[0],last=stops.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus({preventScroll:true});}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus({preventScroll:true});}
  });
  dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
  $$('[data-filter]',dialog).forEach(button=>button.addEventListener('click',()=>renderIndex(button.dataset.filter)));
  $$('.menu-links a',dialog).forEach(link=>link.addEventListener('click',async event=>{
    if(!home || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;
    event.preventDefault();
    await close(false);
    if(window.PortfolioEntrance?.isOpen()) await window.PortfolioEntrance.enter();
    const target=document.getElementById(link.dataset.section);
    target?.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
    const heading=$('h2',target);
    heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});
    history.replaceState(history.state,'',link.hash);
  }));
  $('[data-reopen-world]',dialog).addEventListener('click',async()=>{
    await close(false);
    if(home){window.PortfolioEntrance?.replay();}else{try{sessionStorage.removeItem('mingze-entered');}catch{}location.href='index.html';}
  });
  async function copy(value) {
    if(navigator.clipboard && isSecureContext){await navigator.clipboard.writeText(value);return;}
    const input=document.createElement('textarea');input.value=value;input.style.cssText='position:fixed;left:-9999px';dialog.append(input);input.select();const ok=document.execCommand('copy');input.remove();if(!ok)throw Error('copy');
  }
  $$('[data-clipboard]',dialog).forEach(button=>button.addEventListener('click',async()=>{
    try{await copy(button.dataset.clipboard);$('.contact-feedback',dialog).textContent=`已复制 ${button.dataset.clipboard}`;}
    catch{$('.contact-feedback',dialog).textContent=`请手动复制：${button.dataset.clipboard}`;}
  }));

  // Media layers share the same entry/exit rhythm and restore the original page position.
  $$('#image-dialog,#film-dialog').forEach(media=>{
    let closing=false;
    const finish=async()=>{
      if(closing || !media.open)return;closing=true;media.classList.add('is-closing');
      $('video',media)?.pause();await delay(240);media.close();media.classList.remove('is-closing');closing=false;
    };
    media.addEventListener('cancel',event=>{event.preventDefault();finish();});
    media.addEventListener('click',event=>{
      if(event.target.closest('.dialog-close')){event.preventDefault();event.stopImmediatePropagation();finish();}
      else if(event.target===media){const r=media.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom){event.stopImmediatePropagation();finish();}}
    },true);
    new MutationObserver(()=>{
      if(media.open){document.dispatchEvent(new Event('portfolio:overlay-open'));}
      else if(!dialog.open){document.dispatchEvent(new Event('portfolio:overlay-close'));}
    }).observe(media,{attributes:true,attributeFilter:['open']});
  });

  // Shared image transitions work with normal links, history, and open-in-new-tab.
  document.addEventListener('click',event=>{
    const anchor=event.target.closest('a[href*="project.html?"]');
    if(!anchor || event.button!==0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || anchor.target==='_blank')return;
    const image=$('img',anchor);
    $$('[data-transition-image]').forEach(el=>{el.style.viewTransitionName='';delete el.dataset.transitionImage;});
    if(image){image.style.viewTransitionName='project-image';image.dataset.transitionImage='true';}
    try{sessionStorage.setItem('mingze-navigation-source',location.href);}catch{}
  });
  if($('.project-hero>img')) $('.project-hero>img').style.viewTransitionName='project-image';
  addEventListener('pageshow',()=>{$$('.project-card [data-transition-image],.cg-card [data-transition-image]').forEach(el=>{el.style.viewTransitionName='';delete el.dataset.transitionImage;});});

  const cursor=$('.project-cursor');
  if(pointer.matches && !reduced.matches){
    $$('.project-card,.cg-card').forEach(card=>{
      card.addEventListener('pointerenter',()=>cursor.classList.add('visible'));
      card.addEventListener('pointermove',event=>{cursor.style.left=`${event.clientX}px`;cursor.style.top=`${event.clientY}px`;});
      card.addEventListener('pointerleave',()=>cursor.classList.remove('visible'));
      card.addEventListener('click',()=>cursor.classList.remove('visible'));
    });
    document.addEventListener('portfolio:overlay-open',()=>cursor.classList.remove('visible'));
    addEventListener('scroll',()=>cursor.classList.remove('visible'),{passive:true});
  }
  window.PortfolioUI={open:mode=>open(mode),close,get state(){return {mode,phase,filter};}};
})();
