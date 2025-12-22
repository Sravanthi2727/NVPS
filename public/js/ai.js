function openAIDiscovery() {
  const moods = [
    "You need a Bold Dark Robusta ☕",
    "Try a smooth balanced brew today 🤎",
    "Strong caffeine energy detected ⚡"
  ];

  const pick = moods[Math.floor(Math.random() * moods.length)];
  alert(pick);
}
