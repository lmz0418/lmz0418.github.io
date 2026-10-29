// Open guide field. Each line has its own pointer repulsion, matching the
// reference interaction: verticals travel on x, horizontals on y, and the
// center pair responds more strongly than the outside pair.
const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
const LINE_X=[19.1,37.8,70.8,85.1];
export function createGuideLines(){
  const portfolio=document.getElementById('portfolio'),agent=document.getElementById('agent');
  if(!portfolio||!agent)return null;
  const ns='http://www.w3.org/2000/svg';
  const layer=document.createElement('div');layer.className='guide-layer';layer.setAttribute('aria-hidden','true');
  const verticals=document.createElement('div');verticals.className='guide-lines';
  const vLines=LINE_X.map(x=>{const el=document.createElement('span');el.className='guide-col';el.style.left=`${x}%`;verticals.append(el);return el});
  const horizontals=document.createElement('div');horizontals.className='guide-horizontals';
  const hLines=[24,74].map(y=>{const el=document.createElement('span');el.className='guide-hline';el.style.top=`${y}%`;horizontals.append(el);return el});
  const rings=document.createElement('div');rings.className='guide-rings';const svg=document.createElementNS(ns,'svg');svg.setAttribute('preserveAspectRatio','none');rings.append(svg);
  const logos=document.createElement('div');logos.className='guide-logos';
  for(const [top,left] of [[32,-3],[76,4]]){const img=document.createElement('img');img.className='guide-wordmark';img.src='logo/make-believe.svg';img.alt='';img.decoding='async';img.style.top=`${top}%`;img.style.left=`calc(50% - 35vw + ${left}vw)`;logos.append(img)}
  layer.append(logos,rings,verticals,horizontals);portfolio.prepend(layer);
  const pointer={x:0,y:0};addEventListener('pointermove',e=>{pointer.x=e.clientX/innerWidth*2-1;pointer.y=1-e.clientY/innerHeight*2},{passive:true});
  const items=[
    ...vLines.map((el,i)=>({el,axis:'x',factor:[.34,1.0,1.0,.34][i],base:0})),
    ...hLines.map((el,i)=>({el,axis:'y',factor:i?0.72:0.58,base:0})),
    {el:rings,axis:'xy',factor:.16,base:0},{el:logos,axis:'xy',factor:.06,base:0}
  ];
  let lastReveal=-1;
  function buildRings(width,height){
    svg.setAttribute('viewBox',`0 0 ${Math.max(1,Math.round(width))} ${Math.max(1,Math.round(height))}`);svg.replaceChildren();
    const centers=[{x:.45,y:.05,step:96},{x:.58,y:.26,step:86},{x:.40,y:.48,step:78},{x:.60,y:.70,step:70},{x:.47,y:.91,step:64}];
    centers.forEach((c,ci)=>{for(let i=1;i<=11;i++){const circle=document.createElementNS(ns,'circle');circle.setAttribute('cx',(c.x*width).toFixed(1));circle.setAttribute('cy',(c.y*height).toFixed(1));circle.setAttribute('r',(c.step*i).toFixed(1));circle.setAttribute('fill','none');circle.setAttribute('stroke-width','1');circle.setAttribute('stroke-dasharray',ci>2?'16 12':'20 14');circle.setAttribute('stroke',`rgba(255,255,255,${(.16-ci*.02-i*.005).toFixed(3)})`);svg.append(circle)}});
  }
  function refit(){layer.style.top=`${agent.offsetTop}px`;buildRings(Math.max(1,portfolio.clientWidth),Math.max(1,layer.offsetHeight))}
  function update(reduced){
    if(!document.body.classList.contains('collection')){layer.style.visibility='hidden';return}
    layer.style.visibility='visible';
    // #portfolio is transformed during the handoff, so CSS fixed descendants
    // are relative to it. Compensate in document coordinates each frame.
    horizontals.style.setProperty('top',`${-layer.getBoundingClientRect().top}px`,'important');horizontals.style.height=`${innerHeight}px`;
    const reveal=clamp((innerHeight*.88-agent.getBoundingClientRect().top)/(innerHeight*.26));
    if(Math.abs(reveal-lastReveal)>.01){layer.style.opacity=reveal.toFixed(3);lastReveal=reveal}
    const lerp=.12;
    items.forEach(item=>{
      const targetX=reduced?0:(item.axis==='x'||item.axis==='xy'?pointer.x*innerWidth*.075*item.factor:0);
      const targetY=reduced?0:(item.axis==='y'||item.axis==='xy'?pointer.y*innerHeight*.045*item.factor:0);
      item.x=(item.x||0)+(targetX-(item.x||0))*lerp;item.y=(item.y||0)+(targetY-(item.y||0))*lerp;
      item.el.style.transform=`translate3d(${item.x.toFixed(2)}px,${item.y.toFixed(2)}px,0)`;
    });
  }
  return {layer,refit,update};
}
