// Personal art studies in the cinema site's interactive showcase.
export function createProductShowcase(getLang){
  const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./product-showcase.css',import.meta.url).href;document.head.append(css);
  const el=(tag,cls,text)=>{const node=document.createElement(tag);node.className=cls;if(text)node.textContent=text;return node;};
  let video=null,observer=null,knowledgeDocument=null;
  function loadKnowledge(){
    if(!knowledgeDocument)knowledgeDocument=fetch(new URL('./kb-demo.html',import.meta.url),{signal:AbortSignal.timeout(10000)})
      .then(r=>{if(!r.ok)throw new Error('Knowledge demo unavailable');return r.text();})
      .then(html=>{if(!html.includes('id="playBtn"'))throw new Error('Invalid knowledge demo');return html.replace('<html','<html data-embed');})
      .catch(error=>{knowledgeDocument=null;throw error;});
    return knowledgeDocument;
  }
  function sync(){
    observer?.disconnect();video?.pause();
    const en=getLang()==='en',host=document.getElementById('agent');if(!host)return;
    host.replaceChildren();host.classList.add('vgent-product');host.setAttribute('aria-label','AI ART STUDY');
    const head=el('div','product-section-head');head.dataset.reveal='';
    const identity=el('div','showcase-identity');identity.append(el('h2','showcase-name','AI ART STUDY'));
    head.append(el('p','sec-eyebrow','01 / AI ART STUDY'));
    const intro=el('div','showcase-intro');intro.append(el('h3','',en?'A visual idea. A coherent world.':'让一个想法，拥有完整的视觉。'),el('p','',en?'Explore spaces, characters, light, materials, styles and visual variations across selected commercial projects.':'从空间与角色，到光影、材质与风格，浏览不同项目的美术资产与方案对照。'));
    const register=el('a','showcase-link',en?'ALL PROJECTS ↗':'查看全部项目 ↗');register.href='#portfolio';head.append(identity,intro,register);
    const demo=el('div','vgent-live'),tabs=el('div','vgent-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label',en?'Art studies':'美术过程');
    const panel=el('div','vgent-panel');panel.id='vgentDemoPanel';panel.setAttribute('role','tabpanel');
    const iframe=el('iframe','vgent-knowledge');iframe.title=en?'Mingze art studies':'李明泽美术作品浏览';iframe.style.visibility='hidden';
    const status=el('div','vgent-load-status'),message=el('p',''),retry=el('button','showcase-link',en?'Retry':'重新加载');retry.type='button';status.setAttribute('role','status');status.append(message,retry);panel.append(status);
    async function mountKnowledge(){
      message.textContent=en?'Loading art studies…':'正在载入美术设定…';retry.hidden=true;status.hidden=false;
      try{const html=await loadKnowledge();if(!host.contains(panel))return;iframe.srcdoc=html.replace(/<html[^>]*>/,'<html data-embed lang="'+(en?'en':'zh-CN')+'">');}
      catch{message.textContent=en?'The demo could not load. Please retry.':'演示暂时未能载入，请重新加载。';retry.hidden=false;}
    }
    iframe.addEventListener('load',()=>{if(!iframe.srcdoc)return;iframe.style.visibility='visible';status.hidden=true;});retry.addEventListener('click',mountKnowledge);
    video=el('video','vgent-demo-film');video.controls=true;video.playsInline=true;video.preload='metadata';video.hidden=true;video.setAttribute('aria-label',en?'Selected film':'项目成片');panel.append(iframe,video);
    const choices=[{zh:'美术资产 · 交互浏览',en:'Art assets',src:null},{zh:'Seedance · 完整成片',en:'Seedance film',src:'assets/seedance-film.mp4'}];
    const buttons=choices.map((choice,i)=>{const b=el('button','',en?choice.en:choice.zh);b.type='button';b.id=`vgentDemoTab${i}`;b.setAttribute('role','tab');b.setAttribute('aria-controls',panel.id);b.addEventListener('click',()=>select(i));b.addEventListener('keydown',e=>{const d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(d){e.preventDefault();const next=(i+d+choices.length)%choices.length;select(next);buttons[next].focus();}});tabs.append(b);return b;});
    function select(i){video.pause();if(i)iframe.contentWindow?.postMessage({type:'art-study:pause'},'*');buttons.forEach((b,j)=>{b.setAttribute('aria-selected',String(i===j));b.tabIndex=i===j?0:-1;});panel.setAttribute('aria-labelledby',buttons[i].id);iframe.hidden=i!==0;video.hidden=i===0;status.hidden=i!==0||!!iframe.srcdoc;if(i&&video.getAttribute('src')!==choices[i].src)video.src=choices[i].src;}
    select(0);demo.append(tabs,panel);host.append(head,demo);mountKnowledge();
    observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting){video.pause();iframe.contentWindow?.postMessage({type:'art-study:pause'},'*');}});observer.observe(demo);
    const idtalk=document.getElementById('idtalk');if(idtalk){idtalk.classList.add('idtalk-showcase');const badge=idtalk.querySelector('.product-badge');if(badge)badge.textContent='02 / CG & MOTION';}
  }
  return {sync,dispose(){observer?.disconnect();video?.pause();css.remove();}};
}
