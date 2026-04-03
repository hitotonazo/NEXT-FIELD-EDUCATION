const STORAGE_KEY = "nextfield_progress";
const DEFAULT_SHARE_URL = "https://x.com/arg_observerx?s=21&t=n9hS9eUFPNMQIQ1S4aDaOw";
const FALLBACK_ASSET_ROOT = "images";
const R2_PUBLIC_BASE = (window.NFE_CONFIG && window.NFE_CONFIG.R2_PUBLIC_BASE || "").replace(/\/$/, "");

function defaultProgress(){return {stage:1,count:0,anomalies:{graduates:false,research:false,subject:false}};}
function getProgress(){try{return Object.assign(defaultProgress(), JSON.parse(localStorage.getItem(STORAGE_KEY)) || {});}catch(e){return defaultProgress();}}
function saveProgress(state){localStorage.setItem(STORAGE_KEY, JSON.stringify(state));}
function getStage(){return Number(getProgress().stage||1);}
function setStage(stage){const p=getProgress();p.stage=Math.max(p.stage||1, stage);p.count=Object.values(p.anomalies||{}).filter(Boolean).length;saveProgress(p);return p;}
function markAnomaly(key){ const p = getProgress(); if(!p.anomalies[key]){ p.anomalies[key]=true; p.count=Object.values(p.anomalies).filter(Boolean).length; saveProgress(p);} return p; }

function normalizeAssetPath(path){ if(!path) return ""; if(/^https?:\/\//.test(path)) return path; return path.replace(/^\.?\//, "").replace(/^images\//, ""); }
function resolveAssetUrl(path){ const normalized = normalizeAssetPath(path); if(!normalized) return path; if(R2_PUBLIC_BASE) return `${R2_PUBLIC_BASE}/${normalized}`; return `${FALLBACK_ASSET_ROOT}/${normalized}`; }
function setAssetSource(el, path, attr='src'){ if(!el || !path) return; el.setAttribute(attr, resolveAssetUrl(path)); }
function applyAssetSources(){ document.querySelectorAll('[src]').forEach(el=>{ const raw = el.getAttribute('src'); if(raw && raw.startsWith('images/')) el.setAttribute('src', resolveAssetUrl(raw)); }); document.querySelectorAll('[data-stage-src]').forEach(el=>{ const raw = el.dataset.stageSrc; if(raw && raw.startsWith('images/')) el.dataset.stageSrc = resolveAssetUrl(raw); }); document.documentElement.style.setProperty('--noise-overlay-image', `url('${resolveAssetUrl('anomaly/img_noise_overlay_1600x900.png')}')`); }
function applyGlobalState(){ const p=getProgress(); if(p.count>=3){document.body.classList.add('anomaly-stage');} if(p.count>=3){document.querySelectorAll('[data-stage-copy]').forEach(el=>{ if(el.dataset.stageCopyChanged) el.innerHTML=el.dataset.stageCopyChanged;}); document.querySelectorAll('[data-stage-src]').forEach(el=>{if(el.dataset.stageSrc) el.src=el.dataset.stageSrc;}); document.title = document.body.dataset.dynamicTitle || document.title; }}
function setupDrawer(){ const btn=document.querySelector('.menu-toggle'); const drawer=document.querySelector('.mobile-drawer'); if(!btn||!drawer) return; btn.addEventListener('click',()=>{drawer.classList.toggle('open');btn.setAttribute('aria-expanded',drawer.classList.contains('open'));}); drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>drawer.classList.remove('open'))); }
function setCurrentNav(){ const path=location.pathname.split('/').pop() || 'index.html'; document.querySelectorAll('.mobile-drawer a').forEach(a=>{ if(a.getAttribute('href')===path) a.classList.add('current');}); }

let noiseNextAction = null;
function ensureNoiseOverlay(){
  if(document.getElementById('noise-overlay')) return;
  const overlay=document.createElement('div');
  overlay.id='noise-overlay'; overlay.className='noise-overlay'; overlay.setAttribute('aria-hidden','true');
  overlay.innerHTML='<div class="noise-layer-static noise-layer-1"></div><div class="noise-layer-static noise-layer-2"></div><div class="noise-layer-static noise-layer-3"></div><div class="noise-flash"></div><div id="noise-message" class="noise-message">サイトが改変されました。</div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', handleNoiseOverlayClick);
}
function runSiteAlteredOverlay(nextAction = null) { const noiseOverlay=document.getElementById('noise-overlay'); if (!noiseOverlay) return; noiseNextAction = nextAction; noiseOverlay.classList.add('is-active'); noiseOverlay.setAttribute('aria-hidden', 'false'); }
function closeSiteAlteredOverlay() { const noiseOverlay=document.getElementById('noise-overlay'); if (!noiseOverlay) return; noiseOverlay.classList.remove('is-active'); noiseOverlay.setAttribute('aria-hidden', 'true'); }
function handleNoiseOverlayClick() { closeSiteAlteredOverlay(); if (typeof noiseNextAction === 'function') { const action = noiseNextAction; noiseNextAction = null; action(); return; } noiseNextAction = null; }

document.addEventListener('DOMContentLoaded', ()=>{applyAssetSources(); ensureNoiseOverlay(); setupDrawer(); setCurrentNav(); applyGlobalState();});


function bindNoiseMessageHover(){
  const overlay=document.getElementById("noise-overlay");
  if(!overlay || overlay.dataset.hoverBound==="1") return;
  overlay.dataset.hoverBound="1";
  const apply=(clientX, clientY)=>{
    const x=((clientX/window.innerWidth)-0.5)*18;
    const y=((clientY/window.innerHeight)-0.5)*14;
    overlay.style.setProperty("--noise-float-x", `${x.toFixed(2)}px`);
    overlay.style.setProperty("--noise-float-y", `${y.toFixed(2)}px`);
  };
  overlay.addEventListener("mousemove", (e)=> apply(e.clientX, e.clientY));
  overlay.addEventListener("touchmove", (e)=>{ const t=e.touches && e.touches[0]; if(t) apply(t.clientX, t.clientY); }, {passive:true});
  window.addEventListener("resize", ()=>{ overlay.style.setProperty("--noise-float-x", "0px"); overlay.style.setProperty("--noise-float-y", "0px"); });
}

document.addEventListener("DOMContentLoaded", bindNoiseMessageHover);


function drawRadarChart(canvas){
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  if(!ctx) return;

  const labels = JSON.parse(canvas.dataset.radarLabels || "[]");
  const values = JSON.parse(canvas.dataset.radarValues || "[]");
  if(!labels.length || !values.length) return;

  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2 + 6;
  const radius = Math.min(w, h) * 0.31;
  const maxValue = 5;
  const steps = 5;

  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 1;

  for(let step=1; step<=steps; step++){
    const r = radius * (step / steps);
    ctx.beginPath();
    labels.forEach((_, i) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i / labels.length);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if(i===0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = "rgba(120, 170, 140, 0.28)";
    ctx.stroke();
  }

  labels.forEach((label, i) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * i / labels.length);
    const axisX = cx + Math.cos(angle) * radius;
    const axisY = cy + Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(axisX, axisY);
    ctx.strokeStyle = "rgba(120, 170, 140, 0.32)";
    ctx.stroke();

    const textX = cx + Math.cos(angle) * (radius + 24);
    const textY = cy + Math.sin(angle) * (radius + 24);
    ctx.fillStyle = document.body.classList.contains("truth-theme") ? "#bde8cb" : "#547e47";
    ctx.font = "12px sans-serif";
    ctx.textAlign = textX < cx - 5 ? "right" : textX > cx + 5 ? "left" : "center";
    ctx.textBaseline = textY < cy - 5 ? "bottom" : textY > cy + 5 ? "top" : "middle";
    ctx.fillText(label, textX, textY);
  });

  ctx.beginPath();
  values.forEach((value, i) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * i / labels.length);
    const r = radius * (Math.max(0, Math.min(maxValue, value)) / maxValue);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if(i===0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(95, 170, 120, 0.22)";
  ctx.strokeStyle = "rgba(95, 170, 120, 0.95)";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  values.forEach((value, i) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * i / labels.length);
    const r = radius * (Math.max(0, Math.min(maxValue, value)) / maxValue);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(95, 170, 120, 1)";
    ctx.fill();
  });
}

function initRadarCharts(){
  document.querySelectorAll(".radar-chart").forEach(drawRadarChart);
}

document.addEventListener('DOMContentLoaded', initRadarCharts);
window.addEventListener('resize', initRadarCharts);

function resetExplorationState(){
  localStorage.removeItem(STORAGE_KEY);
  const shareKey = (window.NFE_CONFIG && window.NFE_CONFIG.SHARE_URL_STORAGE_KEY) || "nextfield_share_url";
  localStorage.removeItem(shareKey);
}
function initResetButton(){
  const btn = document.getElementById('reset-progress-btn');
  if(!btn) return;
  btn.addEventListener('click', ()=>{
    resetExplorationState();
    const results = document.getElementById('search-results');
    const input = document.getElementById('site-search');
    if(input) input.value = '';
    if(results) results.innerHTML = '<div class="search-result">探索状態をリセットしました。</div>';
  });
}
document.addEventListener('DOMContentLoaded', initResetButton);
