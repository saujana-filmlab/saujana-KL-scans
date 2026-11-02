// ZIP download helper reused from the local station. No order storage adapter here.
window.klDownloadSheets=async(sheets,orientation)=>{
 const files={};for(const s of sheets){const name=`roll-${String(s.rollIndex+1).padStart(2,'0')}-${s.filmName.replace(/[^a-z0-9-]/gi,'-')}-${orientation}.jpg`;files[name]=new Uint8Array(await (orientation==='portrait'?s.storyBlob:s.deliveryBlob).arrayBuffer())}
 const data=await new Promise((resolve,reject)=>fflate.zip(files,{level:0},(e,b)=>e?reject(e):resolve(b)));const url=URL.createObjectURL(new Blob([data],{type:'application/zip'})),a=document.createElement('a');a.href=url;a.download=`contact-sheets-${orientation}.zip`;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
};
