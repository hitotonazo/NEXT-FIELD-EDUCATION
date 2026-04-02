async function loadJSON(url){ const res=await fetch(url); return await res.json(); }
function createResultHTML(item){ return `<a class="search-result" href="${item.url}"><strong>${item.title}</strong><br><span class="note">${item.snippet}</span></a>`; }
async function initSearch(){
  const input=document.querySelector('#site-search');
  const results=document.querySelector('#search-results');
  const btn=document.querySelector('#site-search-btn');
  if(!input||!results||!btn) return;
  const index=await loadJSON('data/search_index.json');
  const run=()=>{
    const q=(input.value||'').trim();
    const qLower=q.toLowerCase();
    results.innerHTML='';
    if(!q) return;

    if(q==='白砂第七実務棟'){
      runSiteAlteredOverlay(()=>{
        markAnomaly('graduates');
        setStage(2);
        window.location.href='facility.html';
      });
      return;
    }

    if(q==='被験者' || qLower==='subject' || /^subject\d*$/i.test(q)){
      if(getStage()>=3){
        runSiteAlteredOverlay(()=>{
          markAnomaly('subject');
          setStage(4);
          window.location.href='database.html';
        });
      } else {
        results.innerHTML='<div class="search-result">該当する結果は見つかりませんでした。</div>';
      }
      return;
    }

    const hits=index.filter(item=>(item.keywords+" "+item.title+" "+item.snippet).toLowerCase().includes(qLower));
    if(hits.length===0){
      results.innerHTML='<div class="search-result">該当する結果が見つかりませんでした。</div>';
      return;
    }
    results.innerHTML=hits.map(createResultHTML).join('');
  };
  btn.addEventListener('click', run);
  input.addEventListener('keydown', e=>{ if(e.key==='Enter') run();});
}
document.addEventListener('DOMContentLoaded', initSearch);
