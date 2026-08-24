
const STORAGE_KEY = 'dsr_v2';
const state = loadState();
let currentView = 'home';
let deferredPrompt = null;

const prompts = [
  "What do I work hardest to prove about myself? What am I afraid would be true if I stopped proving it?",
  "Which trait in another person activates me most? Where might I fear, reject, or suppress some version of it in myself?",
  "What emotion do I judge myself most harshly for feeling? What might it be trying to communicate?",
  "Where am I saying yes while internally feeling no? What makes the no difficult to express?",
  "When I feel misunderstood, what story do I immediately tell myself about the other person—and about me?",
  "What part of me appears when I feel criticized, excluded, controlled, or powerless? What is it protecting?",
  "What quality did I learn was unacceptable to show? What would its healthy form look like now?",
  "What am I ready to see with curiosity rather than shame?",
  "Where do I confuse keeping the peace with abandoning my own perspective?",
  "What do I secretly envy? What unmet desire or unlived quality might the envy reveal?",
  "What do I fear people would reject if they knew about me? Is that belief current, inherited, or protective?",
  "When I over-explain, what am I trying to secure: safety, approval, innocence, control, or understanding?",
  "What role do I fall into under stress—rescuer, fixer, appeaser, withdrawer, performer, critic, controller, or something else?",
  "What do I expect from myself that I would never demand from someone I love?",
  "What boundary feels 'mean' to me even though it may actually be clear and respectful?"
];

const emotions = [
  "uneasy","guarded","resentful","dismissed","exposed","powerless","ashamed","conflicted",
  "overlooked","lonely","disappointed","grieving","irritated","pressured","skeptical","tender",
  "relieved","hopeful","curious","steady","energized","connected","proud","content"
];

const journey = [
  ["Notice the shadow","What do I most quickly judge in other people? What might that judgment protect or reveal?"],
  ["Track activation","Recall a recent strong reaction. What happened in your body before the story formed?"],
  ["Name the story","What meaning did you give the event? What else could also be true?"],
  ["Meet the protector","If the reaction were protecting something vulnerable, what would it be protecting?"],
  ["Unmask perfection","What do you believe would happen if you were merely adequate instead of exceptional?"],
  ["Explore shame","What part of yourself do you hide because you fear it would change how others see you?"],
  ["Projection check","What trait in someone else feels intolerable? Where does that trait exist in you—healthy, unhealthy, feared, or suppressed?"],
  ["Reclaim anger","What boundary, value, grief, or injustice might your anger be pointing toward?"],
  ["Listen to envy","What does envy reveal about a desire you have not fully admitted?"],
  ["Question people-pleasing","Where are you managing another person’s emotions at the expense of your own truth?"],
  ["Find the hidden no","Where does your body say no before your mouth says yes?"],
  ["Notice over-explaining","What are you hoping to prevent or prove when you explain beyond what is necessary?"],
  ["Track control","What uncertainty are you trying to eliminate? What can be influenced, and what cannot?"],
  ["Meet the inner critic","Whose standards, tone, or fears does your inner critic resemble?"],
  ["Reclaim softness","Where have you equated tenderness with weakness? What is the mature form of softness?"],
  ["Reclaim power","Where have you equated power with domination? What is the healthy form of agency?"],
  ["Explore identity roles","Who are you when you are not being useful, impressive, agreeable, needed, or right?"],
  ["Find inherited beliefs","Which family or cultural rule about emotion, success, loyalty, or conflict no longer fits?"],
  ["Separate guilt from responsibility","What are you actually responsible for—and what belongs to someone else?"],
  ["Observe conflict patterns","Under stress, do you pursue, withdraw, appease, attack, freeze, or over-function? What need sits underneath?"],
  ["Practice complexity","Can two things be true at once? Name two truths you usually force into an either/or choice."],
  ["Make room for grief","What loss have you minimized because you thought you 'should be over it'?"],
  ["Reclaim desire","What do you want that you keep editing into something more acceptable?"],
  ["Explore belonging","Where do you perform a version of yourself to remain included?"],
  ["Meet fear of rejection","What would rejection seem to prove about you? Is that conclusion actually inevitable?"],
  ["Clarify values","Which three qualities do you most want your choices—not just your intentions—to reflect?"],
  ["Practice boundaries","What clear, respectful limit would protect your energy or integrity this week?"],
  ["Choose self-trust","What do you already know but keep asking others to decide for you?"],
  ["Integrate the opposite","What quality have you disowned that could become useful in a balanced form?"],
  ["Close the journey","What have you learned about your patterns, protectors, needs, values, and choices? What will you practice next?"]
];

function defaultState(){
  return {entries:[], completedDays:[], favorites:[], emotions:[], lastPrompt:0};
}
function loadState(){
  try { return {...defaultState(), ...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}; }
  catch { return defaultState(); }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function esc(s=''){ return s.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
function fmtDate(ts){ return new Date(ts).toLocaleString([], {dateStyle:'medium',timeStyle:'short'}); }
function pickPrompt(){
  let i = Math.floor(Math.random()*prompts.length);
  if(i===state.lastPrompt) i=(i+1)%prompts.length;
  state.lastPrompt=i; saveState(); return prompts[i];
}

const view = document.getElementById('view');
function render(name='home'){
  currentView=name;
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.view===name));
  const tpl=document.getElementById(name+'Template');
  view.innerHTML=''; view.appendChild(tpl.content.cloneNode(true));
  window.scrollTo({top:0,behavior:'smooth'});
  if(name==='home') initHome();
  if(name==='journey') initJourney();
  if(name==='journal') initJournal();
  if(name==='tools') initTools();
  if(name==='profile') initProfile();
}
document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click',()=>render(b.dataset.view)));

function initHome(){
  const done=state.completedDays.length;
  document.getElementById('homeJourneyProgress').textContent=`${done} of 30 days complete`;
  document.getElementById('homeJourneyBar').style.width=`${done/30*100}%`;
  document.getElementById('homePrompt').textContent=prompts[state.lastPrompt]||pickPrompt();
  const quick=document.getElementById('emotionQuick');
  emotions.slice(0,10).forEach(e=>{
    const b=document.createElement('button'); b.className='chip'; b.textContent=e;
    b.onclick=()=>{ state.emotions.unshift({word:e,ts:Date.now()}); state.emotions=state.emotions.slice(0,30); saveState(); b.classList.add('selected'); };
    quick.appendChild(b);
  });
  document.getElementById('shufflePrompt').onclick=()=>{document.getElementById('homePrompt').textContent=pickPrompt();document.getElementById('homePromptText').value='';};
  document.getElementById('dailyPromptBtn').onclick=()=>document.getElementById('homePromptText').focus();
  document.getElementById('saveHomePrompt').onclick=()=>{
    const text=document.getElementById('homePromptText').value.trim();
    if(!text) return status('homeSaveStatus','Write something first.');
    state.entries.unshift({id:crypto.randomUUID(),title:'Daily reflection',text,prompt:document.getElementById('homePrompt').textContent,ts:Date.now(),favorite:false});
    saveState(); document.getElementById('homePromptText').value=''; status('homeSaveStatus','Reflection saved.');
  };
  bindJumps();
  document.querySelector('[data-view-jump="journey"]').onclick=()=>render('journey');
}

function initJourney(){
  const done=state.completedDays.length;
  document.getElementById('journeyCount').textContent=`${done} of 30 complete`;
  document.getElementById('journeyBar').style.width=`${done/30*100}%`;
  const list=document.getElementById('journeyList');
  journey.forEach((d,i)=>{
    const wrap=document.createElement('article'); wrap.className='journey-day'+(state.completedDays.includes(i)?' done':'');
    wrap.innerHTML=`<div class="day-num">${i+1}</div><div><div class="card-label">${esc(d[0])}</div><h3>${esc(d[1])}</h3></div><button class="ghost small">${state.completedDays.includes(i)?'Done':'Open'}</button>`;
    wrap.querySelector('button').onclick=()=>openJourneyDay(i);
    list.appendChild(wrap);
  });
  document.getElementById('resetJourney').onclick=()=>{
    if(confirm('Reset all 30-day journey progress?')){state.completedDays=[];saveState();initJourneyRerender();}
  };
}
function initJourneyRerender(){render('journey');}
function openJourneyDay(i){
  const [title,prompt]=journey[i];
  openModal(`
    <div class="eyebrow">Day ${i+1}</div><h1 style="font-size:2.2rem">${esc(title)}</h1>
    <div class="prompt-box">${esc(prompt)}</div>
    <textarea id="journeyText" placeholder="Write what comes up."></textarea>
    <div class="row wrap">
      <button class="primary" id="saveJourneyEntry">Save & mark complete</button>
      <button class="ghost" id="markOnly">Mark complete</button>
    </div>
  `,()=>{
    document.getElementById('saveJourneyEntry').onclick=()=>{
      const text=document.getElementById('journeyText').value.trim();
      if(text) state.entries.unshift({id:crypto.randomUUID(),title:`Journey Day ${i+1}: ${title}`,text,prompt,ts:Date.now(),favorite:false});
      if(!state.completedDays.includes(i)) state.completedDays.push(i);
      saveState(); closeModal(); render('journey');
    };
    document.getElementById('markOnly').onclick=()=>{
      if(!state.completedDays.includes(i)) state.completedDays.push(i);
      saveState(); closeModal(); render('journey');
    };
  });
}

function initJournal(){
  document.getElementById('saveJournal').onclick=()=>{
    const text=document.getElementById('journalText').value.trim();
    if(!text) return status('journalStatus','Write something first.');
    const title=document.getElementById('journalTitle').value.trim()||'Untitled reflection';
    state.entries.unshift({id:crypto.randomUUID(),title,text,prompt:'',ts:Date.now(),favorite:false});
    saveState(); document.getElementById('journalTitle').value=''; document.getElementById('journalText').value='';
    status('journalStatus','Entry saved.'); renderJournalList();
  };
  document.getElementById('clearDraft').onclick=()=>{document.getElementById('journalTitle').value='';document.getElementById('journalText').value='';};
  document.getElementById('exportJournal').onclick=()=>downloadJSON('depths-shadow-journal.json',{entries:state.entries});
  renderJournalList();
}
function renderJournalList(){
  const list=document.getElementById('journalList');
  const count=document.getElementById('entryCount');
  if(!list||!count) return;
  count.textContent=`${state.entries.length} total`;
  list.innerHTML='';
  if(!state.entries.length){list.innerHTML='<div class="card muted">No entries yet. Your saved reflections will appear here.</div>';return;}
  state.entries.forEach(entry=>{
    const el=document.createElement('article'); el.className='journal-entry';
    el.innerHTML=`<div class="meta">${fmtDate(entry.ts)}</div><h3>${esc(entry.title)}</h3>${entry.prompt?`<div class="card-label">Prompt</div><p>${esc(entry.prompt)}</p>`:''}<p>${esc(entry.text)}</p>
    <div class="entry-actions">
      <button class="ghost small fav">${entry.favorite?'★ Favorite':'☆ Favorite'}</button>
      <button class="ghost small del">Delete</button>
    </div>`;
    el.querySelector('.fav').onclick=()=>{entry.favorite=!entry.favorite;saveState();renderJournalList();};
    el.querySelector('.del').onclick=()=>{if(confirm('Delete this entry?')){state.entries=state.entries.filter(x=>x.id!==entry.id);saveState();renderJournalList();}};
    list.appendChild(el);
  });
}

function initTools(){ bindJumps(); }

function initProfile(){
  document.getElementById('statEntries').textContent=state.entries.length;
  document.getElementById('statDays').textContent=state.completedDays.length;
  document.getElementById('statFavorites').textContent=state.entries.filter(e=>e.favorite).length;
  const recent=document.getElementById('recentEmotions');
  const words=[...new Set(state.emotions.map(x=>x.word))].slice(0,12);
  recent.innerHTML=words.length?words.map(w=>`<span class="chip">${esc(w)}</span>`).join(''):'<span class="muted">No check-ins yet.</span>';
  document.getElementById('exportAll').onclick=()=>downloadJSON('depths-shadow-reflections-backup.json',state);
  document.getElementById('clearAll').onclick=()=>{
    if(confirm('Erase all local journal entries, progress, favorites, and check-ins? This cannot be undone unless you exported a backup.')){
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  };
}

function bindJumps(){ document.querySelectorAll('[data-goto]').forEach(b=>b.onclick=()=>openTool(b.dataset.goto)); }
function status(id,msg){ const el=document.getElementById(id); if(el){el.textContent=msg;setTimeout(()=>el.textContent='',2500);} }

const toolContent = {
  grounding:{
    title:'60-Second Grounding',
    body:`<div class="tool-list">
      <div class="tool-step"><strong>1. Orient.</strong><div class="muted">Look around and name 5 neutral things you can see.</div></div>
      <div class="tool-step"><strong>2. Feel support.</strong><div class="muted">Notice the chair, floor, bed, or ground holding your weight.</div></div>
      <div class="tool-step"><strong>3. Track sound.</strong><div class="muted">Name 3 sounds without deciding whether they are good or bad.</div></div>
      <div class="tool-step"><strong>4. Lengthen the exhale.</strong><div class="muted">Let your exhale be slightly longer than your inhale. Do not force the breath.</div></div>
      <div class="tool-step"><strong>5. Ask.</strong><div class="muted">“What would make this reflection feel 5% safer or more manageable?”</div></div>
    </div>`
  },
  feelings:{
    title:'Feelings Vocabulary',
    body:`<p class="muted">Tap words that fit. You can choose more than one.</p><div id="feelingsFull" class="chip-wrap"></div>`
  },
  triggers:{
    title:'Triggers & Projections',
    body:`<div class="tool-list">
      <div class="tool-step"><strong>What happened?</strong><div class="muted">Describe observable facts before interpretation.</div></div>
      <div class="tool-step"><strong>What activated?</strong><div class="muted">Name sensations, emotions, urges, and the first story your mind produced.</div></div>
      <div class="tool-step"><strong>What feels familiar?</strong><div class="muted">Does this reaction connect to an older pattern, fear, role, or expectation?</div></div>
      <div class="tool-step"><strong>Projection check.</strong><div class="muted">What quality am I assigning to the other person? Do I fear, reject, envy, or suppress any version of that quality in myself?</div></div>
      <div class="tool-step"><strong>Reality check.</strong><div class="muted">What evidence supports my interpretation? What evidence complicates it?</div></div>
    </div>`
  },
  parts:{
    title:'Parts Reflection',
    body:`<div class="prompt-box">A “part” can be understood as a recurring protective stance or inner voice—not a diagnosis.</div>
      <div class="tool-list">
      <div class="tool-step"><strong>Name the part.</strong><div class="muted">Examples: the pleaser, critic, fixer, avoider, achiever, protector, performer.</div></div>
      <div class="tool-step"><strong>Ask what it fears.</strong><div class="muted">“What are you afraid would happen if you stopped doing this job?”</div></div>
      <div class="tool-step"><strong>Ask what it protects.</strong><div class="muted">“What vulnerable feeling, need, memory, or belief are you trying to keep away?”</div></div>
      <div class="tool-step"><strong>Offer an update.</strong><div class="muted">“What do you need from my present-day self so you do not have to work quite so hard?”</div></div>
      </div>`
  },
  boundaries:{
    title:'Boundary Clarity',
    body:`<div class="tool-list">
      <div class="tool-step"><strong>My preference:</strong><div class="muted">What would I choose if no one were disappointed?</div></div>
      <div class="tool-step"><strong>My limit:</strong><div class="muted">What am I unwilling or unable to continue?</div></div>
      <div class="tool-step"><strong>My responsibility:</strong><div class="muted">What is mine to communicate or act on?</div></div>
      <div class="tool-step"><strong>Not my responsibility:</strong><div class="muted">What belongs to another person’s feelings, interpretation, choices, or consequences?</div></div>
      <div class="tool-step"><strong>Simple language:</strong><div class="muted">“I’m not available for that.” “I need time to decide.” “That doesn’t work for me.” “I can do X, but not Y.”</div></div>
    </div>`
  },
  integration:{
    title:'Integration',
    body:`<div class="tool-list">
      <div class="tool-step"><strong>What did I learn?</strong><div class="muted">Name the pattern without turning it into an identity.</div></div>
      <div class="tool-step"><strong>What is the protective intention?</strong><div class="muted">Even unhelpful strategies often began as attempts to create safety, belonging, control, or worth.</div></div>
      <div class="tool-step"><strong>What is the balanced form?</strong><div class="muted">Turn suppression into choice: anger → assertiveness, control → discernment, pleasing → generosity with limits, withdrawal → intentional space.</div></div>
      <div class="tool-step"><strong>One next step.</strong><div class="muted">Choose an action small enough to do in the next 24 hours.</div></div>
    </div>`
  }
};

function openTool(name){
  const t=toolContent[name]; if(!t) return;
  openModal(`<div class="eyebrow">Reflection tool</div><h1 style="font-size:2.2rem">${t.title}</h1>${t.body}`,()=>{
    if(name==='feelings'){
      const wrap=document.getElementById('feelingsFull');
      emotions.forEach(e=>{
        const b=document.createElement('button'); b.className='chip'; b.textContent=e;
        b.onclick=()=>{ b.classList.toggle('selected'); state.emotions.unshift({word:e,ts:Date.now()}); state.emotions=state.emotions.slice(0,30); saveState(); };
        wrap.appendChild(b);
      });
    }
  });
}

function openModal(html,after){
  const tpl=document.getElementById('modalTemplate');
  const node=tpl.content.cloneNode(true);
  document.body.appendChild(node);
  const modal=document.querySelector('.modal-backdrop:last-of-type');
  modal.querySelector('#modalContent').innerHTML=html;
  modal.querySelector('.modal-close').onclick=closeModal;
  modal.addEventListener('click',e=>{if(e.target===modal) closeModal();});
  if(after) after();
}
function closeModal(){ document.querySelector('.modal-backdrop:last-of-type')?.remove(); }

function downloadJSON(filename,data){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault(); deferredPrompt=e;
  const btn=document.getElementById('installBtn'); btn.hidden=false;
  btn.onclick=async()=>{deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;btn.hidden=true;};
});

if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{})); }
render('home');
