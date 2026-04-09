type AlertItem = {
  message?: string;
  background?: string;
  color?: string;
};

export async function renderAlerts() {
  const mainEl = document.querySelector("main");
  if (!mainEl) return;

  try {
    const response = await fetch("/json/alerts.json");
    if (!response.ok) return;

    const alerts = (await response.json()) as AlertItem[];
    if (!Array.isArray(alerts) || alerts.length === 0) return;

    const section = document.createElement("section");
    section.className = "alert-list";

    alerts.forEach((alert) => {
      if (!alert?.message) return;

      const messageEl = document.createElement("p");
      messageEl.textContent = alert.message;

      if (alert.background) {
        messageEl.style.backgroundColor = alert.background;
      }

      if (alert.color) {
        messageEl.style.color = alert.color;
      }

      section.appendChild(messageEl);
    });

    if (section.children.length > 0) {
      mainEl.prepend(section);
    }
  } catch {
    // Fail quietly if alerts cannot be loaded.
  }
}
