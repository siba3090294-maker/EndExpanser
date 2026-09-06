const API="https://api.modrinth.com/v2";
const USER="EndExpanser";
let projectsCache=[];
let currentLang=localStorage.getItem("endexpanser-lang")||((navigator.language||"").toLowerCase().startsWith("uk")?"uk":(navigator.language||"").toLowerCase().startsWith("ru")?"ru":"en");

const I18N={
 en:{"nav.projects":"Projects","nav.about":"About","hero.eyebrow":"MINECRAFT, EXPANDED","hero.beyond":"BEYOND","hero.vanilla":"VANILLA.","hero.lead":"Mods, shaders and resource packs built to make Minecraft feel larger, deeper and stranger — without losing what makes it Minecraft","hero.explore":"Explore projects","hero.modrinth":"View on Modrinth","stats.projects":"projects","stats.downloads":"downloads","stats.followers":"followers","scroll":"SCROLL","philosophy.kicker":"01 / PHILOSOPHY","philosophy.title":"THE VOID<br>SHOULDN'T FEEL<br><i>EMPTY.</i>","philosophy.p1":"EndExpanser is a collection of Minecraft projects focused on atmosphere, exploration and visual identity","philosophy.p2":"no bloated launchers, no giant frameworks here — just projects made to drop into your game and make familiar places feel new again","projects.kicker":"02 / PROJECTS","projects.title":"SELECTED<br>WORK","api.syncing":"syncing with modrinth…","api.live":"live data from modrinth","api.fail":"modrinth data unavailable","featured.kicker":"03 / FEATURED","featured.label":"END EXPANSE","featured.title":"THE END,<br>LEFT <i>UNFINISHED</i><br>ON PURPOSE","featured.p":"Crystal wastes, ashen isles, an ancient citadel and creatures that belong in the silence between islands","featured.link":"enter the void","follow.kicker":"04 / FOLLOW","follow.title":"SEE WHAT<br>COMES <i>NEXT</i>","follow.p":"new releases, updates and experiments live on modrinth","follow.button":"Follow EndExpanser","footer.text":"Independent Minecraft projects","card.downloads":"downloads","card.followers":"followers"},
 ru:{"nav.projects":"Проекты","nav.about":"О проекте","hero.eyebrow":"MINECRAFT, РАСШИРЕННЫЙ","hero.beyond":"ЗА ГРАНЯМИ","hero.vanilla":"ВАНИЛЫ.","hero.lead":"Моды, шейдеры и ресурспаки, которые делают Minecraft масштабнее, глубже и необычнее — не ломая то, за что мы любим Minecraft","hero.explore":"Смотреть проекты","hero.modrinth":"Открыть Modrinth","stats.projects":"проектов","stats.downloads":"скачиваний","stats.followers":"подписчиков","scroll":"ЛИСТАЙ","philosophy.kicker":"01 / ИДЕЯ","philosophy.title":"ПУСТОТА<br>НЕ ДОЛЖНА БЫТЬ<br><i>ПУСТОЙ.</i>","philosophy.p1":"EndExpanser — коллекция проектов для Minecraft с упором на атмосферу, исследование и собственный визуальный стиль","philosophy.p2":"без раздутых лаунчеров и огромных фреймворков — просто проекты, которые добавляются в игру и заставляют знакомые места ощущаться по-новому","projects.kicker":"02 / ПРОЕКТЫ","projects.title":"ИЗБРАННЫЕ<br>РАБОТЫ","api.syncing":"синхронизация с modrinth…","api.live":"живые данные с modrinth","api.fail":"данные modrinth недоступны","featured.kicker":"03 / В ЦЕНТРЕ","featured.label":"END EXPANSE","featured.title":"ЭНД,<br>НАМЕРЕННО <i>НЕ<br>ЗАКОНЧЕННЫЙ</i>","featured.p":"Кристальные пустоши, пепельные острова, древняя цитадель и существа, которым самое место в тишине между островами","featured.link":"войти в пустоту","follow.kicker":"04 / СЛЕДИТЬ","follow.title":"СМОТРИ,<br>ЧТО БУДЕТ <i>ДАЛЬШЕ</i>","follow.p":"новые релизы, обновления и эксперименты появляются на Modrinth","follow.button":"Подписаться на EndExpanser","footer.text":"Независимые проекты для Minecraft","card.downloads":"скачиваний","card.followers":"подписчиков"},
 uk:{"nav.projects":"Проєкти","nav.about":"Про проєкт","hero.eyebrow":"MINECRAFT, РОЗШИРЕНИЙ","hero.beyond":"ЗА МЕЖАМИ","hero.vanilla":"ВАНІЛИ.","hero.lead":"Моди, шейдери та ресурспаки, які роблять Minecraft масштабнішим, глибшим і незвичнішим — не втрачаючи того, за що ми любимо Minecraft","hero.explore":"Дивитися проєкти","hero.modrinth":"Відкрити Modrinth","stats.projects":"проєктів","stats.downloads":"завантажень","stats.followers":"підписників","scroll":"ГОРТАЙ","philosophy.kicker":"01 / ІДЕЯ","philosophy.title":"ПОРОЖНЕЧА<br>НЕ МАЄ БУТИ<br><i>ПОРОЖНЬОЮ.</i>","philosophy.p1":"EndExpanser — колекція проєктів для Minecraft із фокусом на атмосфері, дослідженні та власному візуальному стилі","philosophy.p2":"без перевантажених лаунчерів і величезних фреймворків — просто проєкти, які додаються у гру та змушують знайомі місця відчуватися по-новому","projects.kicker":"02 / ПРОЄКТИ","projects.title":"ВИБРАНІ<br>РОБОТИ","api.syncing":"синхронізація з modrinth…","api.live":"живі дані з modrinth","api.fail":"дані modrinth недоступні","featured.kicker":"03 / У ФОКУСІ","featured.label":"END EXPANSE","featured.title":"ЕНД,<br>НАВМИСНО <i>НЕ<br>ЗАВЕРШЕНИЙ</i>","featured.p":"Кришталеві пустки, попелясті острови, стародавня цитадель і створіння, яким саме місце в тиші між островами","featured.link":"увійти в порожнечу","follow.kicker":"04 / СТЕЖИТИ","follow.title":"ДИВИСЬ,<br>ЩО БУДЕ <i>ДАЛІ</i>","follow.p":"нові релізи, оновлення та експерименти з'являються на Modrinth","follow.button":"Стежити за EndExpanser","footer.text":"Незалежні проєкти для Minecraft","card.downloads":"завантажень","card.followers":"підписників"}
};
const t=k=>(I18N[currentLang]&&I18N[currentLang][k])||I18N.en[k]||k;
const fmt=n=>new Intl.NumberFormat(currentLang==="uk"?"uk-UA":currentLang==="ru"?"ru-RU":"en",{notation:n>=10000?"compact":"standard",maximumFractionDigits:1}).format(n||0);
const escapeHtml=(str="")=>String(str).replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[s]));



const TRANSLATE_API="https://api.mymemory.translated.net/get";
const translationMemory=new Map();
function langPair(lang){return lang==="ru"?"en|ru":lang==="uk"?"en|uk":null}
function translationCacheKey(lang,text){return `endexpanser-tr:${lang}:${text}`}
function readTranslationCache(lang,text){
  const k=translationCacheKey(lang,text);if(translationMemory.has(k))return translationMemory.get(k);
  try{const v=localStorage.getItem(k);if(v){translationMemory.set(k,v);return v}}catch(_){}
  return null
}
function writeTranslationCache(lang,text,value){
  const k=translationCacheKey(lang,text);translationMemory.set(k,value);
  try{if(text.length<900)localStorage.setItem(k,value)}catch(_){}
}
function splitForTranslation(text,max=430){
  text=String(text||"").trim();if(text.length<=max)return text?[text]:[];
  const parts=[];let rest=text;
  while(rest.length>max){let cut=Math.max(rest.lastIndexOf(". ",max),rest.lastIndexOf("! ",max),rest.lastIndexOf("? ",max),rest.lastIndexOf(", ",max),rest.lastIndexOf(" ",max));if(cut<max*.45)cut=max;parts.push(rest.slice(0,cut+1).trim());rest=rest.slice(cut+1).trim()}
  if(rest)parts.push(rest);return parts
}
async function translateChunk(text,lang){
  if(!text||lang==="en")return text;const cached=readTranslationCache(lang,text);if(cached)return cached;
  const pair=langPair(lang);if(!pair)return text;
  try{const u=`${TRANSLATE_API}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(pair)}`;const r=await fetch(u);if(!r.ok)throw new Error(`translate ${r.status}`);const j=await r.json();const out=j?.responseData?.translatedText||text;writeTranslationCache(lang,text,out);return out}catch(e){console.warn("translation unavailable",e);return text}
}
async function translateText(text,lang=currentLang){
  if(!text||lang==="en")return text;const chunks=splitForTranslation(text);const out=[];for(const c of chunks)out.push(await translateChunk(c,lang));return out.join(" ")
}
function localizedProjectType(type){
  const key=String(type||"project").replace("_"," ").toLowerCase();
  const map={ru:{mod:"мод",shader:"шейдер",resourcepack:"ресурспак","resource pack":"ресурспак",modpack:"модпак",project:"проект"},uk:{mod:"мод",shader:"шейдер",resourcepack:"ресурспак","resource pack":"ресурспак",modpack:"модпак",project:"проєкт"}};
  return map[currentLang]?.[key]||key
}

document.getElementById("year").textContent=new Date().getFullYear();

function applyLanguage(lang){
 currentLang=["en","ru","uk"].includes(lang)?lang:"en";localStorage.setItem("endexpanser-lang",currentLang);document.documentElement.lang=currentLang;
 document.querySelectorAll("[data-i18n]").forEach(el=>{const key=el.dataset.i18n;el.innerHTML=t(key)});
 document.querySelectorAll("[data-lang-switcher]").forEach(sw=>{sw.querySelector(".lang-current").childNodes[0].nodeValue=currentLang.toUpperCase()+" ";sw.querySelectorAll("[data-lang]").forEach(b=>b.classList.toggle("active",b.dataset.lang===currentLang))});
 if(projectsCache.length) renderProjects(projectsCache);
}
function initLanguageSwitcher(){
 document.querySelectorAll("[data-lang-switcher]").forEach(sw=>{const btn=sw.querySelector(".lang-current");btn.addEventListener("click",e=>{e.stopPropagation();const open=sw.classList.toggle("open");btn.setAttribute("aria-expanded",open)});sw.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>{applyLanguage(b.dataset.lang);sw.classList.remove("open");btn.setAttribute("aria-expanded","false")}))});
 addEventListener("click",()=>document.querySelectorAll(".language-switcher.open").forEach(sw=>{sw.classList.remove("open");sw.querySelector(".lang-current").setAttribute("aria-expanded","false")}));
 applyLanguage(currentLang);
}

async function renderProjects(projects){
 const grid=document.getElementById("projectGrid");
 const langAtStart=currentLang;
 const cards=await Promise.all(projects.map(async p=>{
   const image=p.gallery?.[0]?.url||p.icon_url||"";
   const type=localizedProjectType(p.project_type||"project");
   const loaders=Array.isArray(p.loaders)?p.loaders.slice(0,2):[];
   const hrefType=p.project_type==="resourcepack"?"resourcepack":p.project_type==="shader"?"shader":p.project_type==="modpack"?"modpack":"mod";
   const localPages={"end expanse":"/EndExpanser/end-expanse.html","aeonrealism":"/EndExpanser/aeonrealism.html","expanse shaders":"/EndExpanser/expanse-shaders.html","bluedition":"/EndExpanser/bluedition.html"};
   const href=localPages[(p.title||"").toLowerCase()]||`https://modrinth.com/${hrefType}/${p.slug||p.id}`;
   const desc=await translateText(p.description||"A project by EndExpanser",langAtStart);
   return `<a class="project-card tilt reveal" href="${href}" ${href.startsWith("http")?'target="_blank" rel="noreferrer"':''}><div class="project-bg" style="${image?`background-image:url('${image}')`:`background:radial-gradient(circle at 65% 30%,rgba(151,91,255,.32),transparent 32%),linear-gradient(135deg,#151020,#09080d)`}"></div><div class="project-content"><div class="project-meta"><span class="pill">${escapeHtml(type)}</span>${loaders.map(l=>`<span class="pill">${escapeHtml(l)}</span>`).join("")}</div><h3 class="project-title">${escapeHtml(p.title)}</h3><p class="project-desc">${escapeHtml(desc)}</p><div class="project-bottom"><div class="stats-mini"><span>↓ ${fmt(p.downloads)} ${t("card.downloads")}</span><span>♡ ${fmt(p.followers)} ${t("card.followers")}</span></div><span class="arrow">↗</span></div></div></a>`
 }));
 if(langAtStart!==currentLang)return renderProjects(projects);
 grid.innerHTML=cards.join("");initReveal();initTilt();
}
async function getProjects(){const status=document.getElementById("apiStatus");try{const res=await fetch(`${API}/user/${USER}/projects`);if(!res.ok)throw new Error(`Modrinth API: ${res.status}`);let projects=await res.json();projects=projects.filter(p=>["approved","archived","unlisted"].includes(p.status)).sort((a,b)=>(b.downloads||0)-(a.downloads||0));projectsCache=projects;animateNumber("projectCount",projects.length,false);animateNumber("downloadCount",projects.reduce((s,p)=>s+(p.downloads||0),0),true);animateNumber("followerCount",projects.reduce((s,p)=>s+(p.followers||0),0),true);if(!projects.length)throw new Error("No public projects returned");await renderProjects(projects);status.textContent=t("api.live")}catch(err){console.error(err);status.textContent=t("api.fail");document.getElementById("projectCount").textContent="4";document.getElementById("downloadCount").textContent="—";document.getElementById("followerCount").textContent="—"}}
function animateNumber(id,target,compact){const el=document.getElementById(id),start=performance.now(),duration=900;const tick=now=>{const tt=Math.min(1,(now-start)/duration),eased=1-Math.pow(1-tt,3),value=Math.round(target*eased);el.textContent=compact?fmt(value):value;if(tt<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)}
function initReveal(){if(!("IntersectionObserver" in window)){document.querySelectorAll(".reveal").forEach(e=>e.classList.add("visible"));return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target)}}),{threshold:.1});document.querySelectorAll(".reveal:not(.visible)").forEach(el=>io.observe(el))}
function initTilt(){if(matchMedia("(pointer: coarse)").matches)return;document.querySelectorAll(".tilt").forEach(card=>{card.onmousemove=e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(900px) rotateX(${y*-3.5}deg) rotateY(${x*4.5}deg)`};card.onmouseleave=()=>card.style.transform=""})}
initReveal();initLanguageSwitcher();
const topbar=document.querySelector(".topbar");addEventListener("scroll",()=>topbar.classList.toggle("scrolled",scrollY>30),{passive:true});
const glow=document.querySelector(".cursor-glow");if(glow)addEventListener("pointermove",e=>{glow.style.left=e.clientX+"px";glow.style.top=e.clientY+"px"},{passive:true});
document.querySelectorAll(".magnetic").forEach(el=>{el.addEventListener("pointermove",e=>{if(matchMedia("(pointer: coarse)").matches)return;const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.11}px)`});el.addEventListener("pointerleave",()=>el.style.transform="")});
const canvas=document.getElementById("stars"),ctx=canvas.getContext("2d");let stars=[];function resize(){const dpr=Math.min(devicePixelRatio,2);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;canvas.style.width=innerWidth+"px";canvas.style.height=innerHeight+"px";ctx.setTransform(dpr,0,0,dpr,0,0);const count=Math.min(170,Math.floor(innerWidth*innerHeight/8500));stars=Array.from({length:count},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.2+.15,a:Math.random()*.55+.12,s:Math.random()*.12+.02}))}function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);for(const s of stars){s.y+=s.s;if(s.y>innerHeight+3)s.y=-3;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(225,215,255,${s.a})`;ctx.fill()}requestAnimationFrame(draw)}addEventListener("resize",resize);resize();draw();getProjects();
