// Chinese / English switching for the homepage. Static markup carries data-i18n keys
// (and data-i18n-attr for aria labels); anything the scripts build reads t() and
// re-renders on `languagechange`. Project names are not translated word for word —
// they come from works.js, which keeps the brand spelling and carries its own
// English title, so a switch never changes which client a card belongs to.
const dictionaries={
  zh:{
    'meta.title':'MAKE BELIEVE — 李明泽作品集',
    'meta.description':'李明泽 · AI 美术、视觉设计与 CG 动态作品集。',
    'main.label':'MINGZE LI AI 影院',
    'prep.label':'正在准备放映','prep.text':'正在准备放映','prep.progress':'正在准备放映 · {n}%',
    'prep.retry':'正在重试加载影片…','prep.failed':'影片加载失败，正在重试',
    'skip':'跳过','home.label':'返回影像入口',
    'nav.work':'作品','nav.client':'联系','nav.replay':'重播','lang.label':'切换语言',
    'labels.label':'影片信息','ending.restart':'重新进入 ↗','ending.client':'联系李明泽 ↗',
    'sound.blocked':'声音 · 点击开启','sound.unlock':'点击开启影院声音',
    'sound.on':'声音 开','sound.off':'声音 关','sound.title':'切换声音',
    'status.opening':'正在播放开场','status.entering':'正在自动进入 AI 影院',
    'status.entered':'已进入第一座 AI 影院，滚动切换影片，点击银幕观看完整影片',
    'status.end':'影院穿行结束，继续向下浏览全部作品，向上滚动返回',
    'canvas.scroll':'滚动向前进入影像，向上滚动返回',
    'canvas.enter':'滚动穿过 MAKE BELIEVE，进入 AI 影院',
    'canvas.in':'AI 影院空间：{title}，点击银幕观看完整影片',
    'noscript':'请启用 JavaScript 以观看动态影像首页。',
    'portfolio.label':'所有作品','numbers.label':'项目数据','numbers.eyebrow':'数字一览',
    'numbers.title':'用作品，呈现美术的不同维度。','marquee.label':'参与项目涉及品牌','footer.client':'联系李明泽 ↗',
    'dialog.close':'关闭 ×','dialog.closeLabel':'关闭影片',
    'card.film':'影片 / MINGZE LI','card.project':'项目 / MINGZE LI','watch':'观看 {title}',
    'agent.label':'美术过程','agent.eyebrow':'AI ART STUDY',
    'agent.title':'从设定，到具体的视觉。',
    'agent.lead':'角色、场景、光影与质感，组成我的美术实践。',
    'agent.banner':'将导演创意转化为广告的视觉风格。',
    'agent.bannerSub':'以具体画面呈现美术方向与质感。'
    ,'kb.label':'知识库','team.label':'美术实践','about.label':'关于李明泽','idtalk.label':'CG 与动态设计'
    ,'tools.label':'制作方法与工具','clients.label':'参与项目涉及品牌','contact.label':'联系我们'
  },
  en:{
    'meta.title':'MAKE BELIEVE — Mingze Li',
    'meta.description':'Mingze Li — AI art, visual design and CG motion.',
    'main.label':'MINGZE LI AI cinema',
    'prep.label':'Preparing the screening','prep.text':'Preparing the screening','prep.progress':'Preparing the screening · {n}%',
    'prep.retry':'Retrying the film…','prep.failed':'Film failed to load — retrying',
    'skip':'SKIP','home.label':'Back to the film entrance',
    'nav.work':'WORK','nav.client':'CONTACT','nav.replay':'REPLAY','lang.label':'Switch language',
    'labels.label':'Film details','ending.restart':'ENTER AGAIN ↗','ending.client':'CONTACT MINGZE ↗',
    'sound.blocked':'SOUND · CLICK TO ENABLE','sound.unlock':'Click to enable cinema sound',
    'sound.on':'SOUND ON','sound.off':'SOUND OFF','sound.title':'Toggle sound',
    'status.opening':'Playing the opening','status.entering':'Taking you into the AI cinema',
    'status.entered':'Inside the first AI cinema — scroll to change films, click a screen to watch one in full',
    'status.end':'End of the cinema walkthrough — keep scrolling for all work, scroll up to go back',
    'canvas.scroll':'Scroll forward to enter the film, scroll up to go back',
    'canvas.enter':'Scroll through MAKE BELIEVE into the AI cinema',
    'canvas.in':'AI cinema: {title} — click the screen to watch the full film',
    'noscript':'Please enable JavaScript to watch the film homepage.',
    'portfolio.label':'All work','numbers.label':'Project numbers','numbers.eyebrow':'BY THE NUMBERS',
    'numbers.title':'Different disciplines. One visual practice.','marquee.label':'Brands featured in my work','footer.client':'CONTACT MINGZE ↗',
    'dialog.close':'CLOSE ×','dialog.closeLabel':'Close film',
    'card.film':'FILM / MINGZE LI','card.project':'PROJECT / MINGZE LI','watch':'Watch {title}',
    'agent.label':'Art process','agent.eyebrow':'AI ART STUDY',
    'agent.title':'From studies to visual worlds.',
    'agent.lead':'Character, environment, light and material shape my visual practice.',
    'agent.banner':'Translating creative ideas into visual language.',
    'agent.bannerSub':'Expressing visual direction through key art.'
    ,'kb.label':'Knowledge base','team.label':'My practice','about.label':'About Mingze','idtalk.label':'CG & motion'
    ,'tools.label':'Process & tools','clients.label':'Clients','contact.label':'Contact'
  }
};
const STORAGE_KEY='mingze:lang',LANGS=['zh','en'];
let current=null;
export const isZh=()=>current!=='en';
export const getLang=()=>current||'zh';
export function t(key,vars){
  const raw=(dictionaries[getLang()]||{})[key]??dictionaries.zh[key]??key;
  return vars?raw.replace(/\{(\w+)\}/g,(whole,name)=>vars[name]===undefined?whole:String(vars[name])):raw;
}
function applyStatic(){
  for(const element of document.querySelectorAll('[data-i18n]'))element.textContent=t(element.dataset.i18n);
  for(const element of document.querySelectorAll('[data-i18n-attr]'))for(const pair of element.dataset.i18nAttr.split(';')){
    const [attr,key]=pair.split(':');if(attr&&key)element.setAttribute(attr.trim(),t(key.trim()));
  }
}
function markToggle(){
  for(const part of document.querySelectorAll('#lang [data-lang]'))part.classList.toggle('is-active',part.dataset.lang===getLang());
}
export function setLang(lang,{announce=true}={}){
  if(!LANGS.includes(lang))return;
  const changed=lang!==current;current=lang;
  document.documentElement.lang=lang==='zh'?'zh-CN':'en';
  document.title=t('meta.title');
  const description=document.querySelector('meta[name="description"]');
  if(description)description.setAttribute('content',t('meta.description'));
  applyStatic();markToggle();
  try{localStorage.setItem(STORAGE_KEY,lang)}catch{}
  if(changed&&announce)dispatchEvent(new CustomEvent('languagechange',{detail:{lang}}));
}
export function toggleLang(){setLang(isZh()?'en':'zh')}
export function initLang(){
  const fromUrl=new URLSearchParams(location.search).get('lang');
  let stored=null;try{stored=localStorage.getItem(STORAGE_KEY)}catch{}
  const guess='zh';
  const pick=fromUrl==='en'||fromUrl==='zh'?fromUrl:(stored==='en'||stored==='zh'?stored:guess);
  setLang(pick,{announce:false});
}
