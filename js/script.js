const STORAGE_KEY = "nextfield_progress";
const DEFAULT_SHARE_URL = "https://x.com/arg_observerx?s=21&t=n9hS9eUFPNMQIQ1S4aDaOw";
const FALLBACK_ASSET_ROOT = "images";
const R2_PUBLIC_BASE = (window.NFE_CONFIG && window.NFE_CONFIG.R2_PUBLIC_BASE || "").replace(/\/$/, "");

function getProgress(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {count:0, anomalies:{graduates:false, subject:false, research:false}};}catch(e){return {count:0, anomalies:{graduates:false, subject:false, research:false}};}}
function saveProgress(state){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function markAnomaly(key){ const p = getProgress(); if(!p.anomalies[key]){ p.anomalies[key]=true; p.count=Object.values(p.anomalies).filter(Boolean).length; saveProgress(p);} return p; }

function normalizeAssetPath(path){
  if(!path) return "";
  if(/^https?:\/\//.test(path)) return path;
  return path.replace(/^\.?\//, "").replace(/^images\//, "");
}
function resolveAssetUrl(path){
  const normalized = normalizeAssetPath(path);
  if(!normalized) return path;
  if(R2_PUBLIC_BASE) return `${R2_PUBLIC_BASE}/${normalized}`;
  return `${FALLBACK_ASSET_ROOT}/${normalized}`;
}
function setAssetSource(el, path, attr='src'){
  if(!el || !path) return;
  el.setAttribute(attr, resolveAssetUrl(path));
}
function applyAssetSources(){
  document.querySelectorAll('[src]').forEach(el=>{
    const raw = el.getAttribute('src');
    if(raw && raw.startsWith('images/')) el.setAttribute('src', resolveAssetUrl(raw));
  });
  document.querySelectorAll('[data-stage-src]').forEach(el=>{
    const raw = el.dataset.stageSrc;
    if(raw && raw.startsWith('images/')) el.dataset.stageSrc = resolveAssetUrl(raw);
  });
  document.documentElement.style.setProperty('--noise-overlay-image', `url('${resolveAssetUrl('anomaly/img_noise_overlay_1600x900.png')}')`);
}
function applyGlobalState(){ const p=getProgress(); if(p.count>=3){document.body.classList.add('anomaly-stage');} if(p.count>=3){document.querySelectorAll('[data-stage-copy]').forEach(el=>{ if(el.dataset.stageCopyChanged) el.innerHTML=el.dataset.stageCopyChanged;}); document.querySelectorAll('[data-stage-src]').forEach(el=>{if(el.dataset.stageSrc) el.src=el.dataset.stageSrc;}); document.title = document.body.dataset.dynamicTitle || document.title; }}
function setupDrawer(){ const btn=document.querySelector('.menu-toggle'); const drawer=document.querySelector('.mobile-drawer'); if(!btn||!drawer) return; btn.addEventListener('click',()=>{drawer.classList.toggle('open');btn.setAttribute('aria-expanded',drawer.classList.contains('open'));}); drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>drawer.classList.remove('open'))); }
function setCurrentNav(){ const path=location.pathname.split('/').pop() || 'index.html'; document.querySelectorAll('.mobile-drawer a').forEach(a=>{ if(a.getAttribute('href')===path) a.classList.add('current');}); }
document.addEventListener('DOMContentLoaded', ()=>{applyAssetSources(); setupDrawer(); setCurrentNav(); applyGlobalState();});
