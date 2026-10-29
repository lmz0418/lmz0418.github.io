const clamp=n=>Math.min(1,Math.max(0,n));

// Continuous cinema travel. Wheel, touch and keys move the camera freely, with a
// gentle slowdown around each composed pose so a film can be held without a detent.
export function cinemaScrollSpeed(position,focus){
  if(position<.24||position>.9)return 1;
  const resistance=focus.reduce((sum,stop)=>sum+2.2*Math.exp(-Math.pow((position-stop)/.03,2)),1);
  return 1.45/resistance;
}
export function advanceCinemaScroll(position,travel,focus){
  const steps=Math.max(1,Math.ceil(Math.abs(travel)/.0015));
  for(let i=0;i<steps;i++)position=clamp(position+travel/steps*cinemaScrollSpeed(position,focus));
  return position;
}
