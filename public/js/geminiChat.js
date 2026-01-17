function toggleGemini() {
  const chat = document.getElementById("gemini-chat");
  chat.style.display = chat.style.display === "flex" ? "none" : "flex";
  
  // Focus input when opening
  if (chat.style.display === "flex") {
    setTimeout(() => {
      document.getElementById("msg").focus();
    }, 100);
  }
}

// Allow Enter key to send message
document.addEventListener("DOMContentLoaded", () => {
  const msgInput = document.getElementById("msg");
  if (msgInput) {
    msgInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendGemini();
      }
    });
  }
});

async function sendGemini() {
  const input = document.getElementById("msg");
  const message = input.value.trim();
  if (!message) return;

  input.value = "";
  const chatArea = document.getElementById("chatArea");

  // Render user message on the right in a styled bubble
  chatArea.innerHTML += `<p class="user-message"><span>${message}</span></p>`;

  try {
    const res = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    let replyText = "Sorry, I couldn't get a response.";

    if (res.ok) {
      const data = await res.json();
      replyText = data.reply || data.error || replyText;
    } else {
      // Try to read error body if provided
      try {
        const errData = await res.json();
        replyText = errData.error || errData.message || replyText;
      } catch (_) {
        replyText = `Error ${res.status}`;
      }
    }

    chatArea.innerHTML += `<p class="ai-message"><span>${replyText}</span></p>`;
  } catch (err) {
    console.error("Gemini fetch error", err);
    chatArea.innerHTML += `<p class="ai-message"><span>Sorry, something went wrong. Please try again.</span></p>`;
  }

  chatArea.scrollTop = chatArea.scrollHeight;
}
