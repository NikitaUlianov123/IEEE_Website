// assets/js/main.js

// Footer year (if you have <span id="year"></span>)
document.getElementById("year")?.append(new Date().getFullYear());

// -------------------------
// Theme toggle (light/dark)
// -------------------------
// The class lives on <html>, not <body>, so the inline <head> bootstrap on each
// page can apply the stored theme before the first paint.
(function initTheme() {
  const root = document.documentElement;
  const button = document.getElementById("classChangeButton");

  const readStored = () => {
    try {
      return localStorage.getItem("theme");
    } catch (e) {
      return null;
    }
  };

  const store = (value) => {
    try {
      localStorage.setItem("theme", value);
    } catch (e) {
      // Private browsing / blocked storage: the theme just will not persist.
    }
  };

  const apply = (isDark) => {
    root.classList.toggle("darkmode", isDark);

    if (!button) {
      return;
    }

    if (isDark) {
      button.textContent = "Light mode";
      button.setAttribute("aria-pressed", "true");
    } else {
      button.textContent = "Dark mode";
      button.setAttribute("aria-pressed", "false");
    }
  };

  apply(readStored() === "dark");

  if (button) {
    button.addEventListener("click", () => {
      const isDark = !root.classList.contains("darkmode");
      apply(isDark);

      if (isDark) {
        store("dark");
      } else {
        store("light");
      }
    });
  }
})();




// -------------------------
// Go to top button
// -------------------------
// -------------------------
// Go to top button (robust init)
// -------------------------
(function initToTop() {
  const setup = () => {
    const btn = document.querySelector(".to-top");
    if (!btn) return;

    const toggle = () => {
      if (window.scrollY > 300) btn.classList.add("to-top--visible");
      else btn.classList.remove("to-top--visible");
    };

    window.addEventListener("scroll", toggle, { passive: true });
    toggle();

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  // Run now (script is at bottom so button should exist)
  setup();

  // Also run after DOMContentLoaded as a fallback
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  }
})();



// -------------------------
// Resources tabs (if on page)
// -------------------------
(() => {
  const tabs = document.querySelectorAll(".res-tab");
  const cards = document.querySelectorAll(".res-card");
  if (!tabs.length || !cards.length) return;

  const activate = (cat) => {
    tabs.forEach((t) => {
      const isActive = t.dataset.cat === cat;
      t.classList.toggle("res-tab--active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    cards.forEach((card) => {
      if (cat === "all") {
        card.style.display = "";
      } else {
        const cats = card.dataset.cats ? card.dataset.cats.split(" ") : [];
        if (cats.includes(cat)) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      }
    });
  };

  tabs.forEach((tab) => tab.addEventListener("click", () => activate(tab.dataset.cat || "all")));

  const allTab = document.querySelector('.res-tab[data-cat="all"]');
  activate(allTab?.dataset.cat || tabs[0].dataset.cat || "all");
})();


// -------------------------
// Upcoming Highlights (SheetDB integration)
// -------------------------
// -------------------------
// Upcoming Highlights
// Spreadsheet columns:
// Month | Day | Time | Location | Event Name | Event Desc
// -------------------------
(async () => {
  const container = document.getElementById("upcoming-highlights");
  if (!container) return;

  try {
    const response = await fetch("https://sheetdb.io/api/v1/jm26rrrk95jpl");

    if (!response.ok) {
      throw new Error("Failed to fetch event highlights");
    }

    const data = await response.json();

    let events = data.map(row => ({
      month: (row["Month"] || "").trim(),
      day: (row["Day"] || "").trim(),
      time: (row["Time"] || "").trim(),
      location: (row["Location"] || "").trim(),
      name: (row["Event Name"] || "").trim(),
      desc: (row["Event Desc"] || "").trim()
    }));

    events = events.filter(evt => evt.name);

    if (events.length === 0) {
      container.innerHTML =
        '<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.6);">No upcoming events.</div>';
      return;
    }

    container.innerHTML = events.map(evt => `
      <div class="up-item">
        <div class="up-date">
          <div class="up-month">${evt.month || "EVENT"}</div>
          <div class="up-day">${evt.day || ""}</div>
        </div>

        <div class="up-info">
          <div class="up-top">
            <h3 class="up-title">${evt.name}</h3>
            <span class="chip">EVENT</span>
          </div>

          <p class="up-desc">${evt.desc}</p>

          <div class="up-meta">
            <span>🕒 ${evt.time || "TBA"}</span>
            <span>📍 ${evt.location || "TBA"}</span>
          </div>
        </div>

        <div class="up-right">
          <a class="up-cta" href="calendar.html">Details →</a>
        </div>
      </div>
    `).join("");

  } catch (err) {
    console.error(err);

    container.innerHTML =
      '<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.6);">Failed to load upcoming events.</div>';
  }
})();
