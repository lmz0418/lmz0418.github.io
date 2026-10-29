const pair = (zh, en) => [zh, en];
const workflows = {
  repair: {
    title: pair('局部精修', 'Local retouch'),
    input: pair('原图、标记区域与修改要求；参考图可选。', 'Source image, marked area and edit brief. A reference is optional.'),
    process: pair('定位范围 → 处理局部 → 图层合成 → 复核', 'Locate → Refine → Composite → Review'),
    output: pair('局部 PNG、完整 PNG、分层 PSD 与核验记录。', 'Detail PNG, full PNG, layered PSD and review records.'),
    boundary: pair('范围外是否保持不变，需要像素核验后确认；同时检查内容、边缘与 PSD 重开结果。', 'Unchanged pixels outside the agreed area must be verified. Content, edges and the reopened PSD also need review.'),
    steps: [
      { title: pair('圈定目标', 'Define the area'), short: pair('原图、范围与保留要求', 'Source, area and constraints'), text: pair('使用未标记原图，结合标记图定位修改区域；明确要改什么、哪些内容需要保留。参考图可选。', 'Use the unmarked source to locate the marked area. Define the requested change and what should be preserved; add a reference when needed.'), result: pair('明确的修改范围', 'A defined edit area'), diagram: 'area' },
      { title: pair('处理局部', 'Refine the detail'), short: pair('参考合成或局部修补', 'Reference composite or local repair'), text: pair('图文需要准确一致时，优先使用参考素材合成；需要补全局部时，再选择 AI 修补。候选结果仍需检查。', 'Use reference compositing when graphics or text must match precisely. Use AI repair when local reconstruction is appropriate, then inspect the candidate result.'), result: pair('待检查的局部方案', 'A candidate detail to review'), diagram: 'repair' },
      { title: pair('原位合成', 'Composite in place'), short: pair('独立图层与柔边蒙版', 'Separate layers and a soft mask'), text: pair('在 Photoshop 中按原图位置放回局部，以独立修复图层和柔边蒙版衔接边缘，保留原图底层。', 'Place the detail at its original coordinates in Photoshop. Keep the source layer and blend the repair on a separate layer with a soft mask.'), result: pair('可编辑的图层与蒙版', 'Editable layers and masks'), diagram: 'layers' },
      { title: pair('检查交付', 'Review and deliver'), short: pair('内容、边缘、画幅与核验', 'Content, edges, dimensions and checks'), text: pair('检查内容、边缘和画幅，核对约定范围外的像素，并重新打开 PSD 检查合成。数值检查不代替美术判断。', 'Review the content, edges and dimensions, compare pixels outside the agreed area, and reopen the PSD to inspect the composite. Numeric checks do not replace visual judgement.'), result: pair('PSD + PNG + 核验记录', 'PSD + PNG + review records'), diagram: 'delivery' }
    ]
  },
  grade: {
    title: pair('参考调色', 'Reference grading'),
    input: pair('原图、参考图与希望保留的画面特征。', 'Source image, reference and the visual features to preserve.'),
    process: pair('比较目标 → 分区规划 → 调整层 → 复核', 'Compare → Plan regions → Adjust → Review'),
    output: pair('完整 PNG、可编辑 PSD 与核验记录。', 'Full PNG, editable PSD and review records.'),
    boundary: pair('颜色与明暗会按目标调整；画面结构、纹理及底层保留情况，需要预览与核验后确认。', 'Colour and brightness change with the target. Preserved structure, texture and source layers must be checked in previews and verification.'),
    steps: [
      { title: pair('比较目标', 'Compare the target'), short: pair('区分曝光、色偏与明暗', 'Separate exposure, cast and tone'), text: pair('对照原图与参考，分别观察阴影、中灰、高光，以及对应的肤色和材质，区分曝光差与色偏。', 'Compare source and reference across shadows, midtones, highlights and corresponding skin or material areas. Separate exposure differences from colour casts.'), result: pair('清楚的色彩与影调目标', 'A clear colour and tone target'), diagram: 'reference' },
      { title: pair('分区规划', 'Plan the regions'), short: pair('整体关系与局部保护', 'Overall balance and local protection'), text: pair('先确定整体方向，再规划肤色、材质和灯光等局部区域，明确哪些层次与细节需要保留。', 'Set the overall direction, then plan local regions for skin, materials and lights. Identify the tonal separation and details that need protection.'), result: pair('全局与局部调整方案', 'A global and local adjustment plan'), diagram: 'regions' },
      { title: pair('调整层调色', 'Grade with layers'), short: pair('曲线、色相饱和度与蒙版', 'Curves, hue/saturation and masks'), text: pair('在 Photoshop 中使用曲线、色相／饱和度和柔边蒙版，分别调整明暗与色彩；保留原图底层和可开关的调色组。', 'Use Photoshop curves, hue/saturation and soft masks to adjust tone and colour. Retain the source layer and an editable grading group that can be toggled.'), result: pair('可编辑的调色图层组', 'An editable grading layer group'), diagram: 'curves' },
      { title: pair('预览复核', 'Review the preview'), short: pair('色彩、纹理与高光暗部', 'Colour, texture, highlights and shadows'), text: pair('查看颜色是否协调、过渡是否自然，以及纹理和高光暗部的表现。根据预览修订，再另存 PNG、PSD 并记录核验结果。', 'Inspect colour harmony, transitions, texture and highlight/shadow detail. Refine the preview before saving separate PNG and PSD files and recording the checks.'), result: pair('PSD + PNG + 核验记录', 'PSD + PNG + review records'), diagram: 'grade-delivery' }
    ]
  }
};

let stylesheet = null, instanceCount = 0;
const cardRenderers = new Map();
const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
};
function ensureStyles() {
  if (stylesheet?.isConnected) return;
  stylesheet = element('link'); stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('./ps-workflow.css', import.meta.url).href;
  document.head.append(stylesheet);
}
addEventListener('languagechange', () => {
  for (const [card, render] of cardRenderers) {
    if (card.isConnected) render(); else cardRenderers.delete(card);
  }
});

export function createPSWorkflowCard(getLang) {
  ensureStyles();
  const card = element('button', 'tool-shot ps-workflow-card');
  card.type = 'button'; card.dataset.psWorkflow = '';
  const render = () => {
    const pick = value => value[getLang() === 'en' ? 1 : 0];
    card.replaceChildren();
    card.setAttribute('aria-label', pick(pair('浏览 Photoshop × Codex 工作流程', 'Explore the Photoshop × Codex workflow')));
    const top = element('span', 'pswf-card-top');
    top.append(element('span', 'pswf-card-overline', 'PHOTOSHOP × CODEX'), element('span', 'pswf-card-badge', pick(pair('流程示意', 'WORKFLOW'))));
    const flow = element('span', 'pswf-card-flow');
    const brief = element('span', 'pswf-card-brief');
    brief.append(element('span', 'pswf-codex-symbol', '⌘'), element('strong', '', 'Codex'), element('span', 'pswf-card-small', pick(pair('视觉要求', 'Visual brief'))));
    const bridge = element('span', 'pswf-card-bridge');
    bridge.setAttribute('aria-hidden', 'true'); bridge.append(element('span', '', '→'));
    const layers = element('span', 'pswf-card-layers');
    for (let index = 0; index < 3; index++) {
      const layer = element('span', 'pswf-card-layer');
      if (index === 2) layer.append(element('b', 'pswf-ps-mark', 'Ps'), element('span', '', pick(pair('可编辑图层', 'Editable layers'))));
      layers.append(layer);
    }
    flow.append(brief, bridge, layers);
    const bottom = element('span', 'pswf-card-bottom');
    bottom.append(element('span', '', pick(pair('局部精修 / 参考调色', 'RETOUCH / COLOUR'))), element('span', 'pswf-card-open', pick(pair('浏览流程 ↗', 'EXPLORE ↗'))));
    card.append(top, flow, bottom);
  };
  render(); cardRenderers.set(card, render);
  return card;
}

// All illustrations below are schematic. They do not contain a client image,
// run Photoshop, simulate an active job, or claim a verification result.
function diagramMarkup(kind, id, english) {
  const stroke = '#d7dfd2', accent = '#d5e6b3', muted = '#565f57';
  const line = (d, extra = '') => `<path d="${d}" fill="none" ${/\bstroke=/.test(extra) ? '' : `stroke="${stroke}"`} ${/\bstroke-width=/.test(extra) ? '' : 'stroke-width="2"'} ${extra}/>`;
  const box = (x, y, w, h, fill = '#161b18', extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${fill}" stroke="#ffffff25" ${extra}/>`;
  const text = (x, y, value, fill = '#9da69e', size = 11) => `<text x="${x}" y="${y}" fill="${fill}" font-family="Arial,sans-serif" font-size="${size}" letter-spacing="1">${value}</text>`;
  const arrow = (x, y) => line(`M${x} ${y}h45m-9 -7 9 7-9 7`, `stroke="${accent}"`);
  const abstract = (x, y, scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale})"><circle cx="66" cy="53" r="33" fill="#b6c3b135" stroke="#b6c3b165"/><path d="M12 146V102L99 81l80 25v40z" fill="#9ba89722" stroke="#9ba89775"/><path d="M99 81v65M12 102l87 22 80-18" fill="none" stroke="#acb7a275"/><path d="M148 52l32 19-32 19-32-19z" fill="#d7e6b322" stroke="#d7e6b378"/></g>`;
  const documentCard = (x, y, label, fill) => `<g>${box(x, y, 130, 157, '#151a17')}${line(`M${x + 25} ${y + 22}h52l25 25v61H${x + 25}z`)}${line(`M${x + 77} ${y + 22}v25h25`)}${text(x + 33, y + 91, label, fill, 23)}${line(`M${x + 25} ${y + 128}h78`, 'opacity=".25"')}</g>`;
  let content = '';
  if (kind === 'area') {
    content = `${box(55, 55, 405, 242)}${text(75, 82, 'SOURCE IMAGE')}${abstract(91, 101)}<rect x="190" y="104" width="165" height="151" rx="4" fill="#d5e6b30c" stroke="${accent}" stroke-dasharray="7 6" stroke-width="2"/>${[190, 355].map(x => [104, 255].map(y => `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" fill="${accent}"/>`).join('')).join('')}${line('M356 145h145M356 203h145', 'opacity=".35"')}${text(485, 128, 'AREA', accent)}${text(485, 188, 'BRIEF')}${box(484, 220, 96, 52)}${text(500, 250, '1 : 1', accent, 18)}`;
  } else if (kind === 'repair') {
    content = `${box(48, 96, 163, 164)}${text(65, 122, 'WORK AREA')}${abstract(73, 137, .65)}${arrow(227, 176)}${box(294, 62, 136, 105)}${box(294, 192, 136, 105)}${text(313, 88, 'REFERENCE')}${text(313, 218, 'LOCAL REPAIR')}<path d="M326 140l25-25 25 25 25-25" stroke="${accent}" fill="none" stroke-width="3"/><rect x="321" y="239" width="48" height="30" rx="4" fill="#d5e6b328" stroke="${accent}" stroke-dasharray="4 4"/>${line('M444 113h29v130h-29M473 176h38', 'opacity=".6"')}${box(520, 130, 70, 92)}<rect x="538" y="148" width="34" height="56" fill="url(#${id}-mask)"/>`;
  } else if (kind === 'layers') {
    content = `${box(48, 61, 340, 238)}${text(67, 88, 'CANVAS')}${abstract(94, 116)}<rect x="193" y="126" width="96" height="102" fill="#d5e6b316" stroke="${accent}"/>${line('M185 178h112M241 118v118', 'opacity=".4"')}${line('M389 177h31', 'stroke-dasharray="4 4"')}${text(441, 94, 'EDITABLE LAYERS')}${box(428, 115, 163, 49, '#263023')}${box(428, 175, 163, 49)}${box(428, 235, 163, 42)}<rect x="440" y="127" width="25" height="25" fill="url(#${id}-mask)"/>${text(476, 145, 'PATCH + MASK', accent, 10)}${text(441, 205, 'SOURCE IMAGE')}${text(441, 261, 'ORIGINAL', muted)}`;
  } else if (kind === 'reference') {
    content = `${box(60, 60, 232, 216)}${box(348, 60, 232, 216)}${text(79, 86, 'SOURCE')}${text(368, 86, 'REFERENCE')}${abstract(88, 104, .85)}${abstract(376, 104, .85)}${line('M293 168h54', 'stroke-dasharray="4 5" opacity=".45"')}${[0, 1, 2, 3, 4].map(i => `<rect x="${103 + i * 27}" y="297" width="22" height="9" rx="2" fill="${['#242a27','#4b5850','#879182','#c5caba','#eeeee2'][i]}"/><rect x="${391 + i * 27}" y="297" width="22" height="9" rx="2" fill="${['#272725','#53534a','#8a8b76','#c5c9a7','#edf0d7'][i]}"/>`).join('')}`;
  } else if (kind === 'regions') {
    content = `${box(61, 60, 377, 242)}${text(80, 86, 'GLOBAL + LOCAL')}${abstract(132, 112)}<circle cx="198" cy="165" r="46" fill="#e3d3b30f" stroke="#e3d3b3" stroke-dasharray="5 5"/><rect x="127" y="208" width="188" height="57" rx="12" fill="#b9c8d40e" stroke="#b9c8d4" stroke-dasharray="5 5"/><rect x="270" y="110" width="99" height="91" rx="12" fill="#d5e6b30d" stroke="${accent}" stroke-dasharray="5 5"/>${line('M369 155h112M315 239h166', 'opacity=".3"')}${text(480, 132, 'COLOUR', '#e3d3b3')}${text(480, 194, 'LIGHT', accent)}${text(480, 256, 'TEXTURE', '#b9c8d4')}`;
  } else if (kind === 'curves') {
    content = `${box(51, 51, 294, 258)}${text(72, 79, 'CURVES')}${[0, 1, 2, 3, 4].map(i => line(`M80 ${103 + i * 43}h230M${80 + i * 57.5} 103v172`, 'opacity=".12" stroke-width="1"')).join('')}${line('M80 275l230-172', 'opacity=".35" stroke-dasharray="5 5"')}<path d="M80 275C157 270 147 219 195 183S269 117 310 103" stroke="${accent}" fill="none" stroke-width="3"/>${[[80,275],[172,210],[255,135],[310,103]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${accent}"/>`).join('')}${text(397, 77, 'ADJUSTMENT GROUP')}${[['HUE / SATURATION',106],['CURVES',165],['SOURCE IMAGE',224]].map(([name,y]) => `${box(381,y,205,46,name==='CURVES'?'#273024':'#151a17')}<rect x="394" y="${y+12}" width="22" height="22" fill="url(#${id}-mask)"/>${text(430,y+28,name,name==='CURVES'?accent:'#a0a9a1',10)}`).join('')}`;
  } else {
    content = `${documentCard(72, 90, 'PSD', accent)}${documentCard(254, 90, 'PNG', '#e4e4dc')}${box(438, 90, 130, 157)}${text(458, 119, 'REVIEW', accent)}${[0,1,2].map(i=>`<circle cx="461" cy="${143+i*27}" r="4" fill="none" stroke="#a8b29b"/>${line(`M476 ${143+i*27}h65`, 'opacity=".4"')}`).join('')}${text(151, 294, english ? 'CHECK BEFORE DELIVERY' : '交付前复核', '#aab49e', 12)}`;
  }
  return `<svg viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs><pattern id="${id}-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#ffffff12"/></pattern><linearGradient id="${id}-mask"><stop stop-color="#f0f0e8"/><stop offset="1" stop-color="#313831"/></linearGradient></defs><rect width="640" height="360" fill="url(#${id}-grid)"/>${content}</svg>`;
}

export function createPSWorkflowViewer(getLang) {
  ensureStyles();
  const count = ++instanceCount, prefix = `pswf-${count}`;
  const events = new AbortController();
  const listen = (node, name, callback) => node.addEventListener(name, callback, { signal: events.signal });
  const pick = value => value[getLang() === 'en' ? 1 : 0];
  const makeButton = (className, callback) => {
    const button = element('button', className); button.type = 'button'; listen(button, 'click', callback); return button;
  };
  const dialog = element('dialog', 'pswf-dialog'); dialog.id = count === 1 ? 'psWorkflowDialog' : `${prefix}-dialog`;
  dialog.setAttribute('aria-labelledby', `${prefix}-title`);
  const heading = element('div', 'pswf-heading');
  const identity = element('div', 'pswf-identity');
  const kicker = element('p', 'pswf-kicker', 'POST / EDITABLE WORKFLOW');
  const title = element('h2', 'pswf-title', 'Photoshop × Codex'); title.id = `${prefix}-title`;
  identity.append(kicker, title);
  const closeButton = makeButton('pswf-close', close); heading.append(identity, closeButton);
  const intro = element('div', 'pswf-intro');
  const badge = element('span', 'pswf-demo-badge');
  const description = element('p', 'pswf-description');
  intro.append(badge, description);
  const modeTabs = element('div', 'pswf-tabs'); modeTabs.setAttribute('role', 'tablist');
  const workspace = element('div', 'pswf-workspace'); workspace.id = `${prefix}-workspace`; workspace.setAttribute('role', 'tabpanel');
  const stepNav = element('div', 'pswf-steps');
  const stepButtons = Array.from({ length: 4 }, (_, index) => {
    const button = makeButton('pswf-step', () => selectStep(index));
    const number = element('span', 'pswf-step-number', String(index + 1).padStart(2, '0'));
    const copy = element('span', 'pswf-step-copy'); copy.append(element('strong'), element('span'));
    button.append(number, copy, element('span', 'pswf-step-arrow', '↗'));
    listen(button, 'keydown', event => {
      let next = index;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % 4;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + 3) % 4;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = 3;
      else return;
      event.preventDefault(); event.stopPropagation(); selectStep(next); stepButtons[next].focus({ preventScroll: true });
    });
    stepNav.append(button); return button;
  });
  const content = element('div', 'pswf-content');
  const figure = element('div', 'pswf-diagram'); figure.setAttribute('role', 'img');
  const figureMeta = element('div', 'pswf-diagram-meta');
  const figureIndex = element('span'); const illustration = element('span'); figureMeta.append(figureIndex, illustration);
  const drawing = element('div', 'pswf-drawing'); figure.append(figureMeta, drawing);
  const detail = element('div', 'pswf-detail'); detail.setAttribute('aria-live', 'polite');
  const detailTitle = element('h3'); const detailText = element('p');
  const result = element('div', 'pswf-step-result'); result.append(element('span'), element('strong'));
  detail.append(detailTitle, detailText, result); content.append(figure, detail); workspace.append(stepNav, content);
  const overview = element('div', 'pswf-overview');
  const fields = ['input', 'process', 'output'].map(name => {
    const field = element('div', 'pswf-field'); field.append(element('p', 'pswf-field-label'), element('p', 'pswf-field-value')); overview.append(field); return { name, field };
  });
  const notice = element('div', 'pswf-notice'); notice.append(element('p', 'pswf-notice-title'), element('p', 'pswf-notice-text'));
  const footer = element('p', 'pswf-footnote');
  dialog.append(heading, intro, modeTabs, workspace, overview, notice, footer); document.body.append(dialog);
  let mode = 'repair', step = 0, disposed = false, locked = false, previousFocus = null, savedScroll = null, bodyStyles = [], htmlOverflow = [];
  const modes = ['repair', 'grade'];
  const tabs = modes.map((key, index) => {
    const tab = makeButton('pswf-tab', () => selectMode(key));
    tab.id = `${prefix}-${key}`; tab.dataset.workflow = key; tab.setAttribute('role', 'tab'); tab.setAttribute('aria-controls', workspace.id);
    listen(tab, 'keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = 1 - index;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = 1;
      else return;
      event.preventDefault(); event.stopPropagation(); selectMode(modes[next]); tabs[next].focus({ preventScroll: true });
    });
    modeTabs.append(tab); return tab;
  });
  function selectMode(next) { mode = next; step = 0; render(); }
  function selectStep(next) { step = next; render(); }
  function render() {
    const workflow = workflows[mode], current = workflow.steps[step];
    closeButton.textContent = pick(pair('关闭 ×', 'CLOSE ×'));
    closeButton.setAttribute('aria-label', pick(pair('关闭工作流程', 'Close workflow')));
    badge.textContent = pick(pair('工作流程示意', 'WORKFLOW ILLUSTRATION'));
    description.textContent = pick(pair('Codex 通过 Skill 组织操作步骤，由 Photoshop 完成合成与调整，保留可编辑图层和核验记录。', 'Codex uses Skills to organise the steps; Photoshop handles compositing and adjustments, retaining editable layers and review records.'));
    modeTabs.setAttribute('aria-label', pick(pair('选择工作流程', 'Choose a workflow')));
    stepNav.setAttribute('aria-label', pick(pair('流程步骤', 'Workflow steps')));
    tabs.forEach((tab, index) => {
      const selected = modes[index] === mode;
      tab.textContent = pick(workflows[modes[index]].title); tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
      if (selected) workspace.setAttribute('aria-labelledby', tab.id);
    });
    stepButtons.forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === step));
      button.querySelector('strong').textContent = pick(workflow.steps[index].title);
      button.querySelector('.pswf-step-copy>span').textContent = pick(workflow.steps[index].short);
    });
    figure.dataset.step = `${mode}-${step + 1}`;
    figure.setAttribute('aria-label', `${pick(pair('工作流程示意', 'Workflow illustration'))} · ${pick(current.title)}`);
    figureIndex.textContent = `STEP ${String(step + 1).padStart(2, '0')} / 04`;
    illustration.textContent = pick(pair('示意图', 'SCHEMATIC'));
    drawing.innerHTML = diagramMarkup(current.diagram, `${prefix}-${mode}-${step}`, getLang() === 'en');
    detailTitle.textContent = pick(current.title); detailText.textContent = pick(current.text);
    result.firstElementChild.textContent = pick(pair('本步形成', 'THIS STEP DEFINES')); result.lastElementChild.textContent = pick(current.result);
    fields.forEach(({ name, field }, index) => {
      field.firstElementChild.textContent = pick([pair('输入', 'INPUT'), pair('处理', 'PROCESS'), pair('交付内容', 'DELIVERABLES')][index]);
      field.lastElementChild.textContent = pick(workflow[name]);
    });
    notice.firstElementChild.textContent = pick(pair('交付前复核', 'REVIEW BEFORE DELIVERY')); notice.lastElementChild.textContent = pick(workflow.boundary);
    footer.textContent = pick(pair('流程示意 · 点击步骤，了解每一步的操作与交付。', 'Workflow illustration · Select a step to explore its actions and deliverables.'));
  }
  function lock() {
    if (locked) return;
    locked = true; previousFocus = document.activeElement; savedScroll = { x: scrollX, y: scrollY };
    bodyStyles = ['position', 'top', 'left', 'width', 'overflow'].map(name => [name, document.body.style.getPropertyValue(name), document.body.style.getPropertyPriority(name)]);
    htmlOverflow = [document.documentElement.style.getPropertyValue('overflow'), document.documentElement.style.getPropertyPriority('overflow')];
    document.body.classList.add('ps-workflow-open');
    Object.assign(document.body.style, { position: 'fixed', top: `${-savedScroll.y}px`, left: `${-savedScroll.x}px`, width: '100%', overflow: 'hidden' });
    document.documentElement.style.overflow = 'hidden';
  }
  function unlock() {
    if (!locked) return;
    locked = false; document.body.classList.remove('ps-workflow-open');
    bodyStyles.forEach(([name, value, priority]) => value ? document.body.style.setProperty(name, value, priority) : document.body.style.removeProperty(name));
    if (htmlOverflow[0]) document.documentElement.style.setProperty('overflow', ...htmlOverflow); else document.documentElement.style.removeProperty('overflow');
    scrollTo({ left: savedScroll.x, top: savedScroll.y, behavior: 'instant' });
    const focusTarget = previousFocus?.isConnected ? previousFocus : document.querySelector('[data-ps-workflow]');
    focusTarget?.focus({ preventScroll: true });
  }
  function open() {
    if (disposed || [...document.querySelectorAll('dialog[open]')].some(node => node !== dialog)) return false;
    mode = 'repair'; step = 0; render(); lock();
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0; closeButton.focus({ preventScroll: true }); return true;
  }
  function close() { if (dialog.open) dialog.close(); unlock(); }
  listen(dialog, 'cancel', event => { event.preventDefault(); close(); });
  listen(dialog, 'close', () => { if (!dialog.open) unlock(); });
  listen(window, 'languagechange', render);
  render();
  return { open, close, dispose() { if (disposed) return; close(); disposed = true; events.abort(); dialog.remove(); } };
}
