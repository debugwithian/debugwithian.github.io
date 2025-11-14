// ------------------ Game Variables ------------------
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

// ------------------ Game Functions ------------------
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

// Hide score counter on page load
const scoreCounter = document.getElementById('scoreCounter');
if (scoreCounter) scoreCounter.style.display = 'none';

function startGame() {
  if (spawnInterval) return;

  const rounds = 22;
  let spawned = 0;

  spawnInterval = setInterval(() => {
    if (spawned >= rounds) {
      clearInterval(spawnInterval);
      spawnInterval = null;
      return;
    }

    const icon = techIcons[Math.floor(Math.random() * techIcons.length)];
    placeIcon(icon); // your existing function
    spawned++;
  }, 600);

  gameTimeout = setTimeout(() => {
    clearInterval(spawnInterval);
    spawnInterval = null;
  }, 24000);

  if (scoreCounter) scoreCounter.style.display = 'block';

  // Indicate game is running
  document.querySelectorAll('.playBadge').forEach(btn => btn.style.color = 'red');
}

function stopGame() {
  if (spawnInterval) clearInterval(spawnInterval);
  if (gameTimeout) clearTimeout(gameTimeout);
  spawnInterval = null;
  gameTimeout = null;

  // Remove all game icons
  document.querySelectorAll('.gameIcon').forEach(icon => icon.remove());

  // Reset play button color
  document.querySelectorAll('.playBadge').forEach(btn => btn.style.color = '#0d6efd'); // blue

  if (scoreCounter) scoreCounter.style.display = 'none';
}

// Attach click events to all play buttons
document.querySelectorAll('.playBadge').forEach(btn => {
  btn.addEventListener('click', () => {
    if (spawnInterval) stopGame();
    else startGame();
  });
});


// ------------------ AI Chat ------------------
const aiBody = document.getElementById("aiBody");
const aiInput = document.getElementById("aiInput");
const aiSend = document.getElementById("aiSend");
const aiMin = document.getElementById("aiMin");

// Append message
function appendMessage(text, who, typing=false){
  const div = document.createElement("div");
  div.className = "ai-msg " + (who==="user" ? "user" : "bot");
  aiBody.appendChild(div);
  aiBody.scrollTop = aiBody.scrollHeight;

  if(typing && who==="bot"){
    // Typing animation
    let i = 0;
    const interval = setInterval(()=>{
      div.innerText = text.slice(0,i++);
      aiBody.scrollTop = aiBody.scrollHeight;
      if(i > text.length) clearInterval(interval);
    }, 20);
  } else {
    div.innerText = text;
  }

  // Add to chat history
  chatHistory.push({role: who==="user" ? "user" : "assistant", content: text});
}

// Chat history
let chatHistory = [];

// Get system prompt
async function getPrompt() {
  try {
    const response = await fetch('prompt.txt');
    if(!response.ok) throw new Error('Failed to load prompt.txt');
    return (await response.text()).trim();
  } catch {
    return "You are a helpful assistant answering based on Rene's portfolio only.";
  }
}

// Call Node backend
async function callGroq(userMessage){
  const systemPrompt = await getPrompt();
  try {
    const res = await fetch("/api/groq", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ userMessage, chatHistory, systemPrompt })
    });
    if(!res.ok){
      const err = await res.json();
      appendMessage("Error: " + (err.error||res.status), "bot");
      return null;
    }
    const data = await res.json();
    return data.reply;
  } catch(e){
    appendMessage("Network error contacting AI.", "bot");
    return null;
  }
}

// Send message
aiSend.addEventListener("click", async ()=>{
  const q = aiInput.value.trim();
  if(!q) return;
  appendMessage(q,"user");
  aiInput.value = "";
  appendMessage("Typing...","bot",true); // temporary typing
  const ans = await callGroq(q);
  const bots = aiBody.querySelectorAll(".ai-msg.bot");
  if(bots.length) bots[bots.length-1].remove(); // remove "Typing..."
  appendMessage(ans ?? "No response.","bot",true);
});

aiInput.addEventListener("keydown", e => { if(e.key==="Enter") aiSend.click(); });

// AI Minimize
aiMin.addEventListener("click", ()=>{
  const body = document.getElementById("aiBody");
  const footer = document.querySelector(".ai-footer");
  if(body.style.display==="none"){
    body.style.display="flex"; footer.style.display="flex"; aiMin.innerHTML='<i class="fas fa-chevron-down"></i>';
  } else {
    body.style.display="none"; footer.style.display="none"; aiMin.innerHTML='<i class="fas fa-chevron-up"></i>';
  }
});

document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav-links a");
    const sections = Array.from(navLinks).map(link => document.querySelector(link.getAttribute("href")));

    // Assuming the last link is the Contact link
    const lastNavLinkIndex = navLinks.length - 1;
    const headerOffset = 100; // Your offset for the fixed header

    // Click event - add active class
    navLinks.forEach(li

        // 1. Check if the user is at the very bottom of the page
        // Check if the scroll position + viewport height is close to the total scrollable height
        // The '+ 1' ensures we catch the exact bottom reliably.
        const isAtBottom = (currentScroll + viewportHeight) >= (totalScrollHeight - 1);

        if (isAtBottom) {
            // 2. If at the bottom, force the last link (Contact) to be active
            navLinks.forEach(link => link.classList.remove("active"));
            navLinks[lastNavLinkIndex].classList.add("active");
            return; // Exit the function to prevent the loop from overriding
        } 
        
        // 3. Proceed with the standard section-in-viewport logic
        // Only run this if we are NOT at the bottom
        let scrollPos = currentScroll + headerOffset;
        let foundActive = false;
        
        // Loop backwards for better section detection, especially for small sections
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            
            if (section.offsetTop <= scrollPos) {
                // If the section's top is visible (or above the scrollPos line)
                navLinks.forEach(link => link.classList.remove("active"));
                navLinks[i].classList.add("active");
                foundActive = true;
                break; // Stop loop once the highest section is found
            }
        }
        
        // Optional: If the user is scrolling above the first section (top of the page)
        if (!foundActive && currentScroll < headerOffset) {
            navLinks.forEach(link => link.classList.remove("active"));
            navLinks[0].classList.add("active");
        }
    });
});

document.addEventListener("visibilitychange", ()=>{ if(document.hidden) localStorage.setItem("rbid_minigame_score", score); });
