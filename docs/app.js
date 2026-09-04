const sections=[...document.querySelectorAll('main>section[data-category]')];
const cards=[...document.querySelectorAll('details')];
const search=document.querySelector('#search');
const result=document.querySelector('#result');
const empty=document.querySelector('#empty');
const filterButtons=[...document.querySelectorAll('[data-filter]')];
const checks=[...document.querySelectorAll('[data-progress]')];
const keys={theme:'go-sheet-theme',progress:'go-sheet-progress'};
let activeFilter='all';
const normalize=value=>value.toLocaleLowerCase('ru').replaceAll('ё','е').trim();

function buildToc(){
  const toc=document.querySelector('#toc');
  sections.forEach((section,index)=>{
    const link=document.createElement('a');
    link.href='#'+section.id;
    link.textContent=section.dataset.title;
    if(index===0)link.classList.add('active');
    toc.append(link);
  });
}
function filterContent(){
  const query=normalize(search.value);
  let count=0;
  sections.forEach(section=>{
    const categoryOK=activeFilter==='all'||section.dataset.category===activeFilter;
    let sectionCount=0;
    section.querySelectorAll('details').forEach(card=>{
      const haystack=normalize((card.dataset.keywords||'')+' '+card.textContent);
      const shown=categoryOK&&(!query||haystack.includes(query));
      card.hidden=!shown;
      if(shown){sectionCount++;count++;if(query)card.open=true}
    });
    section.hidden=sectionCount===0;
  });
  result.textContent=query||activeFilter!=='all'?'Найдено карточек: '+count:'';
  empty.hidden=count!==0;
}
function setTheme(theme){
  document.documentElement.dataset.theme=theme;
  document.querySelector('#theme').textContent=theme==='light'?'🌙':'☀️';
  localStorage.setItem(keys.theme,theme);
}
function renderProgress(){
  const done=checks.filter(box=>box.checked);
  document.querySelector('#progressText').textContent=done.length+' / '+checks.length;
  document.querySelector('#progressBar').style.width=(done.length/checks.length*100)+'%';
  localStorage.setItem(keys.progress,JSON.stringify(done.map(box=>box.dataset.progress)));
}
buildToc();
setTheme(localStorage.getItem(keys.theme)||(matchMedia('(prefers-color-scheme:light)').matches?'light':'dark'));
const saved=JSON.parse(localStorage.getItem(keys.progress)||'[]');
checks.forEach(box=>box.checked=saved.includes(box.dataset.progress));
renderProgress();
filterContent();
search.addEventListener('input',filterContent);
filterButtons.forEach(button=>button.addEventListener('click',()=>{
  filterButtons.forEach(item=>item.classList.remove('active'));
  button.classList.add('active');
  activeFilter=button.dataset.filter;
  filterContent();
}));
document.querySelector('#theme').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='light'?'dark':'light'));
document.querySelector('#expandAll').addEventListener('click',event=>{
  const visible=cards.filter(card=>!card.hidden);
  const open=visible.some(card=>!card.open);
  visible.forEach(card=>card.open=open);
  event.currentTarget.textContent=open?'Свернуть всё':'Развернуть всё';
});
checks.forEach(box=>box.addEventListener('change',renderProgress));
document.querySelector('#reset').addEventListener('click',()=>{checks.forEach(box=>box.checked=false);renderProgress()});
document.addEventListener('keydown',event=>{
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();search.focus()}
  if(event.key==='Escape'&&document.activeElement===search){search.value='';search.blur();filterContent()}
});
const observer=new IntersectionObserver(entries=>{
  const current=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
  if(!current)return;
  document.querySelectorAll('#toc a').forEach(link=>link.classList.toggle('active',link.hash==='#'+current.target.id));
},{rootMargin:'-10% 0px -75%',threshold:[0,.2,.6]});
sections.forEach(section=>observer.observe(section));
if(location.hash){const target=document.querySelector(location.hash);if(target&&target.matches('details'))target.open=true}
