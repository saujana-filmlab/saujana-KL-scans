// Bali's production contact-sheet viewer layout; KL order API and download-all retained.
(()=>{
 let sheets=[],section,current=0,orientation=matchMedia('(max-width:720px)').matches?'portrait':'landscape';
 const urlFor=s=>orientation==='portrait'?s.storyUrl:s.deliveryUrl;
 const make=(tag,className,text)=>{const e=document.createElement(tag);if(className)e.className=className;if(text)e.textContent=text;return e;};
 const icon=src=>{const e=make('span','contact-action-icon');e.style.setProperty('--contact-icon','url("'+src+'")');e.setAttribute('aria-hidden','true');return e;};
 async function freshSheets(){const token=new URLSearchParams(location.search).get('token');const r=await fetch(window.GB_CONTACT_SHEET_API+'/delivery?token='+encodeURIComponent(token),{cache:'no-store'});if(!r.ok)throw Error('Delivery is unavailable');const fresh=(await r.json()).contactSheets||[];if(!fresh.length||fresh.some(s=>!s.deliveryUrl||!s.storyUrl))throw Error('Both contact-sheet orientations must be available.');return fresh;}
 function render(data){
  sheets=(data.contactSheets||[]).filter(s=>s&&s.deliveryUrl&&s.storyUrl);current=Math.min(current,Math.max(0,sheets.length-1));
  if(!sheets.length){section?.remove();section=null;return;}
  if(!section){section=make('section','contact-sheets');section.id='contact-sheets';section.setAttribute('aria-label','Your contact sheets');document.querySelector('.download-wrap').before(section);}
  section.replaceChildren();const stage=make('div','contact-stage');stage.dataset.format=orientation;section.append(stage);
  const slidesRoot=make('div');slidesRoot.id='contact-slides';stage.append(slidesRoot);
  const previous=make('button','contact-nav contact-prev','‹'),next=make('button','contact-nav contact-next','›');previous.type=next.type='button';previous.setAttribute('aria-label','Previous roll');next.setAttribute('aria-label','Next roll');stage.append(previous,next);
  const dotsRoot=make('div','contact-dots');stage.append(dotsRoot);
  sheets.forEach((s,i)=>{
   const slide=make('article','contact-slide'+(i===current?' active':'')),image=make('img','contact-preview');image.src=urlFor(s);image.alt=s.filmName+' '+orientation+' contact sheet';image.loading=i===current?'eager':'lazy';
   const caption=make('div','contact-caption');caption.append(make('strong','',s.filmName||'Roll '+(i+1)),make('span','',(s.frameCount||0)+' frames'));slide.append(image,caption);slidesRoot.append(slide);
   const dot=make('button','contact-dot'+(i===current?' active':''));dot.type='button';dot.setAttribute('aria-label','Show roll '+(i+1));dot.setAttribute('aria-pressed',String(i===current));dot.onclick=()=>show(i);dotsRoot.append(dot);
  });
  function show(index){current=(index+sheets.length)%sheets.length;Array.from(slidesRoot.children).forEach((e,i)=>e.classList.toggle('active',i===current));Array.from(dotsRoot.children).forEach((e,i)=>{e.classList.toggle('active',i===current);e.setAttribute('aria-pressed',String(i===current));});}
  previous.onclick=()=>show(current-1);next.onclick=()=>show(current+1);previous.hidden=next.hidden=dotsRoot.hidden=sheets.length<2;
  const tools=make('div','contact-tools'),toggle=make('div','contact-format-toggle');toggle.setAttribute('role','group');toggle.setAttribute('aria-label','Contact sheet format');tools.append(toggle);stage.append(tools);
  for(const format of ['landscape','portrait']){const b=make('button','contact-format-button'+(format===orientation?' active':''),format==='landscape'?'Landscape':'Portrait');b.type='button';b.dataset.format=format;b.setAttribute('aria-pressed',String(format===orientation));b.onclick=()=>{orientation=format;render({contactSheets:sheets});};toggle.append(b);}
  const actions=make('div','contact-actions'),download=make('button','contact-button'),share=make('button','contact-button');download.type=share.type='button';download.append(icon('icon-contact-download.png'),make('span','','Download contact sheets'));share.append(icon('icon-contact-share.png'),make('span','','Share contact sheet'));actions.append(download,share);stage.append(actions);
  download.onclick=async()=>{download.disabled=true;try{const selected=orientation,fresh=await freshSheets(),prepared=[];for(const s of fresh){const r=await fetch(selected==='portrait'?s.storyUrl:s.deliveryUrl);if(!r.ok)throw Error('Could not download every sheet. Please retry.');prepared.push({...s,[selected==='portrait'?'storyBlob':'deliveryBlob']:await r.blob()});}await klDownloadSheets(prepared,selected);}catch(e){alert(e.message);}finally{download.disabled=false;}};
  share.onclick=async()=>{share.disabled=true;try{const selected=orientation,roll=sheets[current].rollIndex,fresh=await freshSheets(),s=fresh.find(s=>s.rollIndex===roll);if(!s)throw Error('This roll is unavailable.');const r=await fetch(selected==='portrait'?s.storyUrl:s.deliveryUrl);if(!r.ok)throw Error('Could not retrieve this contact sheet.');const blob=await r.blob(),name='roll-'+String(roll+1).padStart(2,'0')+'-'+s.filmName.replace(/[^a-z0-9-]/gi,'-')+'-'+selected+'.jpg',file=new File([blob],name,{type:'image/jpeg'});
   if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file]});}else{const a=make('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),30000);alert('The contact sheet has been downloaded. You can share it from your Photos or Files app.');}
  }catch(e){if(e.name!=='AbortError')alert(e.message);}finally{share.disabled=false;}};
 }
 addEventListener('gb-delivery-order',e=>render(e.detail));if(window.GB_DELIVERY_DATA)render(window.GB_DELIVERY_DATA);
})();
