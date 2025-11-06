const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";
let score = 0;
const scoreEl = document.getElementById("score");
const gameArea = document.getElementById("gameArea");
const techIcons = [
  {label:"HTML", color:"#E44D26", symbol:"<>"}, 
  {label:"CSS", color:"#1572B6", symbol:"{}"}, 
  {label:"JS", color:"#F7DF1E", symbol:"JS"}, 
  {label:"React", color:"#61DAFB", symbol:"⚛"}, 
  {label:"Node", color:"#339933", symbol:"⬢"},
  {label:"TS", color:"#3178C6", symbol:"TS"}
];
function rand(min,max){return Math.random()*(max-min)+min}
function placeIcon(icon){
  const el = document.createElement("div");
  el.className = "gameIcon";
  el.setAttribute("data-label", icon.label);
  el.innerHTML = `<span style="pointer-events:none;font-weight:700">${icon.symbol}</span>`;
  el.style.background = icon.color;
  const size = Math.floor(rand(40,64));
  el.style.width = size + "px";
  el.style.height = size + "px";
  el.style.left = rand(20, window.innerWidth - 100) + "px";
  el.style.top = rand(120, window.innerHeight - 160) + "px";
  el.style.opacity = "0";
  gameArea.appendChild(el);
  el.animate([{transform:"scale(0.8)", opacity:0},{transform:"scale(1)", opacity:1}], {duration:200, fill:"forwards"});
  let vx = rand(-1.0,1.0);
  let vy = rand(-0.8,0.8);
  const move = setInterval(()=>{
    if(!el.parentElement){ clearInterval(move); return }
    const rect = el.getBoundingClientRect();
    if(rect.left < 8 || rect.right > window.innerWidth-8) vx = -vx;
    if(rect.top < 80 || rect.bottom > window.innerHeight-80) vy = -vy;
    el.style.left = (rect.left + vx) + "px";
    el.style.top = (rect.top + vy) + "px";
  },20);
  el.addEventListener("mouseenter", ()=> el.style.transform = "scale(1.08)");
  el.addEventListener("mouseleave", ()=> el.style.transform = "scale(1)");
  el.addEventListener("click",(e)=>{
    e.stopPropagation();
    clearInterval(move);
    const rect = el.getBoundingClientRect();
    const popup = document.createElement("div");
    popup.className = "popupPoints";
    popup.style.left = (rect.left + rect.width/2) + "px";
    popup.style.top = rect.top + "px";
    popup.style.fontSize = "16px";
    popup.innerText = "+15";
    document.body.appendChild(popup);
    popup.animate([{transform:"translateY(0)", opacity:1},{transform:"translateY(-60px)", opacity:0}], {duration:700,easing:"cubic-bezier(.2,.8,.2,1)"});
    setTimeout(()=> popup.remove(),760);
    el.animate([{transform:"scale(1.2)", opacity:1},{transform:"scale(0.2)", opacity:0}], {duration:300, fill:"forwards"});
    setTimeout(()=> el.remove(),320);
    score += 15;
    scoreEl.innerText = score;
    localStorage.setItem("rbid_minigame_score", score);
    burstEffect(rect.left + rect.width/2, rect.top + rect.height/2);
  });
  setTimeout(()=>{ try{ if(el.parentElement) el.remove() }catch(e){} }, rand(7000,15000));
}
function burstEffect(x,y){
  for(let i=0;i<10;i++){
    const p = document.createElement("div");
    p.className = "gameIcon";
    p.style.width = "10px";
    p.style.height = "12px";
    p.style.left = x + "px";
    p.style.top = y + "px";
    p.style.borderRadius = "3px";
    p.style.background = `hsl(${Math.floor(rand(0,360))},80%,60%)`;
    p.style.boxShadow = "none";
    p.style.pointerEvents = "none";
    document.body.appendChild(p);
    const angle = rand(0,Math.PI*2);
    const dist = rand(40,120);
    const tx = x + Math.cos(angle)*dist;
    const ty = y + Math.sin(angle)*dist;
    p.animate([{transform:"translate(0,0) rotate(0)", opacity:1},{transform:`translate(${tx-x}px,${ty-y}px) rotate(${rand(180,720)}deg)`, opacity:0}], {duration:900,easing:"cubic-bezier(.2,.8,.2,1)"});
    setTimeout(()=> p.remove(),950);
  }
}
let spawnInterval = null;
let gameTimeout = null;
function startGame(){
  if(spawnInterval) return;
  const rounds = 22;
  let spawned = 0;
  spawnInterval = setInterval(()=>{
    if(spawned >= rounds){ clearInterval(spawnInterval); spawnInterval = null; return }
    const icon = techIcons[Math.floor(Math.random()*techIcons.length)];
    placeIcon(icon);
    spawned++;
  }, 600);
  gameTimeout = setTimeout(()=>{ clearInterval(spawnInterval); spawnInterval = null }, 24000);
}
const playBadge = document.getElementById("playBadge");

function stopGame() {
  if (spawnInterval) {
    clearInterval(spawnInterval);
    spawnInterval = null;
  }
  if (gameTimeout) {
    clearTimeout(gameTimeout);
    gameTimeout = null;
  }
  const icons = document.querySelectorAll(".gameIcon");
  icons.forEach(icon => icon.remove());
  playBadge.style.color = "#0d6efd"; // blue when stopped
}

function startGame() {
  if (spawnInterval) return; // already running
  const rounds = 22;
  let spawned = 0;

  spawnInterval = setInterval(() => {
    if (spawned >= rounds) { 
      clearInterval(spawnInterval); 
      spawnInterval = null; 
      playBadge.style.color = "#0d6efd"; // back to blue
      return;
    }
    const icon = techIcons[Math.floor(Math.random() * techIcons.length)];
    placeIcon(icon);
    spawned++;
  }, 600);

  gameTimeout = setTimeout(() => {
    clearInterval(spawnInterval);
    spawnInterval = null;
    playBadge.style.color = "#0d6efd"; // back to blue
  }, 24000);
  playBadge.style.color = "#dc3545"; // red when running
}

playBadge.addEventListener("click", () => {
  if (spawnInterval) {
    stopGame();
  } else {
    startGame();
  }
});
const aiBody = document.getElementById("aiBody");
function appendMessage(text, who){
  const div = document.createElement("div");
  div.className = "ai-msg " + (who==="user" ? "user" : "bot");
  div.innerText = text;
  aiBody.appendChild(div);
  aiBody.scrollTop = aiBody.scrollHeight;
}

// Chat history to maintain continuity
let chatHistory = [];

// Append message to chat window
function appendMessage(text, who){
  const div = document.createElement("div");
  div.className = "ai-msg " + (who==="user" ? "user" : "bot");
  div.innerText = text;
  aiBody.appendChild(div);
  aiBody.scrollTop = aiBody.scrollHeight;

  // Add to chat history for AI context
  chatHistory.push({role: who === "user" ? "user" : "assistant", content: text});
}

// Get system prompt
async function getPrompt() {
  try {
    const response = await fetch('prompt.txt');
    if (!response.ok) throw new Error('Failed to load prompt.txt');
    const text = await response.text();
    return text.trim();
  } catch (err) {
    console.error(err);
    return "You are a helpful assistant answering based on Rene's portfolio only.";
  }
}

// Call Groq API with continuity
async function callGroq(userMessage){
  if(!GROQ_API_KEY || GROQ_API_KEY.includes("REPLACE")){
    appendMessage("Groq API key not provided. Replace the placeholder in the script to test.", "bot");
    return null;
  }

  const systemPrompt = await getPrompt();

  // Construct messages array with system prompt + chat history + latest user message
  const messages = [{role:"system", content: systemPrompt}, ...chatHistory, {role:"user", content: userMessage}];

  const payload = { model: MODEL, messages, max_tokens: 700, temperature: 0.2 };

  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + GROQ_API_KEY
      },
      body: JSON.stringify(payload)
    });
    if(!res.ok){ appendMessage("Error from AI: " + res.status, "bot"); return null; }
    const json = await res.json();
    const content = (json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) || JSON.stringify(json);

    // Add AI reply to chat history
    chatHistory.push({role:"assistant", content});

    return content;
  } catch(e){
    appendMessage("Network error contacting aiyan bot.", "bot");
    return null;
  }
}

// Send message handler
aiSend.addEventListener("click", async ()=>{
  const q = aiInput.value.trim();
  if(!q) return;
  appendMessage(q, "user");
  aiInput.value = "";
  appendMessage("Thinking...", "bot");
  const ans = await callGroq(q);
  const bots = aiBody.querySelectorAll(".ai-msg.bot");
  if(bots.length) bots[bots.length-1].remove();
  appendMessage(ans ?? "No response.", "bot");
});

aiInput.addEventListener("keydown", e => { if(e.key === "Enter") aiSend.click() });

const aiMin = document.getElementById("aiMin");
aiMin.addEventListener("click", ()=>{
  const body = document.getElementById("aiBody");
  const footer = document.querySelector(".ai-footer");
  if(body.style.display === "none"){ body.style.display = "flex"; footer.style.display = "flex"; aiMin.innerHTML = '<i class="fas fa-chevron-down"></i>'; } else { body.style.display = "none"; footer.style.display = "none"; aiMin.innerHTML = '<i class="fas fa-chevron-up"></i>'; }
});
document.addEventListener("visibilitychange", ()=>{ if(document.hidden) localStorage.setItem("rbid_minigame_score", score) });
