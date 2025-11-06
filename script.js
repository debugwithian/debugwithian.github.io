// XP Scroll Progress
window.addEventListener('scroll', () => {
  const scrollTop = document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  document.getElementById('xpBar').style.width = (scrollTop / height) * 100 + "%";
});

// Section animation + skill bars
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      const bars = entry.target.querySelectorAll('.skill-progress');
      bars.forEach(bar => bar.style.width = bar.getAttribute('data-width'));
    }
  });
});
document.querySelectorAll("section").forEach(sec => observer.observe(sec));

// Toast Achievements
const achievements = { about: "🎯 Origin Story!", tech: "⚙️ Tech Guru!", experience: "💼 Veteran Dev!", ai-section: "🤖 AI Ally Online!", contact: "📨 Connected!" };
const shown = {};
const toast = document.getElementById("achievementToast");
const toastObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !shown[entry.target.id]) {
      shown[entry.target.id] = true;
      toast.textContent = achievements[entry.target.id];
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 3000);
    }
  });
});
Object.keys(achievements).forEach(id => {
  const el = document.getElementById(id);
  if (el) toastObserver.observe(el);
});

// AI Chat using Groq streaming
const chatBox = document.getElementById("chatBox");
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  appendMessage(text, "user-msg");
  userInput.value = "";

  const aiMessage = document.createElement("div");
  aiMessage.className = "message ai-msg";
  chatBox.appendChild(aiMessage);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      stream: true,
      messages: [
        { role: "system", content: "You are AI Ian, a friendly and professional AI version of Rene Diamante. Keep answers short, warm, and skill-oriented." },
        { role: "user", content: text }
      ]
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value);
    const parts = buffer.split("\n\n");
    for (let part of parts) {
      if (part.startsWith("data: ")) {
        const data = part.replace("data: ", "").trim();
        if (data === "[DONE]") break;
        try {
          const json = JSON.parse(data);
          const token = json.choices?.[0]?.delta?.content;
          if (token) aiMessage.textContent += token;
        } catch { /* skip invalid chunks */ }
      }
    }
  }
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMessage(text, cls) {
  const msg = document.createElement("div");
  msg.className = `message ${cls}`;
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(); });
