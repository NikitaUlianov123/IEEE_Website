// assets/js/main.js

// Footer year (if you have <span id="year"></span>)
document.getElementById("year")?.append(new Date().getFullYear());

// -------------------------
// Theme toggle (light/dark)
// -------------------------
// -------------------------
// Theme toggle (light/dark)
// -------------------------
const button = document.getElementById('classChangeButton');
const body = document.getElementById('cuerpo');
button.addEventListener('click', function() {
    body.classList.toggle('darkmode');
    localStorage.setItem('cuerpo','darkmode');
});




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


// -------------------------
// Newsletter (signup + archive)
// -------------------------
// Paste both values from the EmailOctopus dashboard once the club list exists.
// Lists > (your list) > Forms > Embedded shows them in the generated snippet:
// the <form action> URL, and the name of its email <input>.
// While formAction is empty every signup form stays disabled and says so, so the
// live site never shows a form that looks usable but silently fails.
const NEWSLETTER_CONFIG = {
  formAction: "",
  emailFieldName: "field_0",
  honeypotFieldName: "",
  archiveUrl: "assets/data/newsletter.json"
};

const escapeHtml = (value) => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

(function initNewsletterSignup() {
  const forms = document.querySelectorAll("[data-newsletter-form]");
  if (!forms.length) {
    return;
  }

  const configured = NEWSLETTER_CONFIG.formAction.length > 0;

  forms.forEach((form) => {
    const input = form.querySelector("[data-newsletter-email]");
    const submit = form.querySelector('[type="submit"]');
    const note = form.querySelector("[data-newsletter-note]");

    if (!configured) {
      if (note) {
        note.textContent =
          "Signups open shortly. Email ie.ee@csun.edu and we will add you in the meantime.";
        note.hidden = false;
      }
      return;
    }

    form.action = NEWSLETTER_CONFIG.formAction;

    if (input) {
      input.name = NEWSLETTER_CONFIG.emailFieldName;
      input.disabled = false;
    }

    if (submit) {
      submit.disabled = false;
    }

    if (NEWSLETTER_CONFIG.honeypotFieldName.length > 0) {
      const trap = document.createElement("input");
      trap.type = "text";
      trap.name = NEWSLETTER_CONFIG.honeypotFieldName;
      trap.className = "nl-hp";
      trap.tabIndex = -1;
      trap.autocomplete = "off";
      trap.setAttribute("aria-hidden", "true");
      form.appendChild(trap);
    }
  });
})();

(function initNewsletterBanner() {
  const banner = document.getElementById("nl-subscribed-banner");
  if (!banner) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("subscribed") === "1") {
    banner.hidden = false;
  }
})();

(async function initNewsletterArchive() {
  const container = document.getElementById("newsletter-archive");
  if (!container) {
    return;
  }

  const showMessage = (text) => {
    const msg = document.createElement("div");
    msg.className = "nl-archive-msg";
    msg.textContent = text;
    container.replaceChildren(msg);
  };

  // Only http(s) permalinks become links, so a bad feed value cannot become a
  // javascript: href.
  const safeLink = (value) => {
    try {
      const parsed = new URL(value, window.location.href);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.href;
      }
      return "";
    } catch (e) {
      return "";
    }
  };

  const timeOf = (issue) => {
    const parsed = new Date(issue.date);
    if (Number.isNaN(parsed.getTime())) {
      return 0;
    }
    return parsed.getTime();
  };

  const formatDate = (value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "";
    }
    // Pinned to UTC so a date-only string does not show the previous day west
    // of Greenwich.
    return parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC"
    });
  };

  try {
    const response = await fetch(NEWSLETTER_CONFIG.archiveUrl, { cache: "no-cache" });

    if (!response.ok) {
      throw new Error(`Archive request failed with status ${response.status}`);
    }

    const data = await response.json();

    let issues = [];
    if (data && Array.isArray(data.issues)) {
      issues = data.issues.slice();
    }

    if (issues.length === 0) {
      showMessage("No issues yet. Subscribe above and you will get the first one.");
      return;
    }

    issues.sort((a, b) => {
      return timeOf(b) - timeOf(a);
    });

    container.innerHTML = issues.map((issue) => {
      const date = formatDate(issue.date);
      const link = safeLink(issue.url || "");

      let title = "Untitled issue";
      if (issue.title) {
        title = issue.title;
      }

      let dateHtml = "";
      if (date.length > 0) {
        dateHtml = `<div class="nl-issue-date">${escapeHtml(date)}</div>`;
      }

      // Prefer the full plain-text body. Fall back to the summary when the
      // provider gives us no body for that issue.
      let bodyHtml = "";
      if (issue.bodyText) {
        bodyHtml = `<p class="nl-issue-body">${escapeHtml(issue.bodyText)}</p>`;
      } else if (issue.summary) {
        bodyHtml = `<p class="nl-issue-summary">${escapeHtml(issue.summary)}</p>`;
      }

      let linkHtml = "";
      if (link.length > 0) {
        linkHtml =
          `<a class="btn secondary nl-issue-link" href="${escapeHtml(link)}"` +
          ` target="_blank" rel="noopener">Read in browser →</a>`;
      }

      return `
      <article class="nl-issue">
        ${dateHtml}
        <h3 class="nl-issue-title">${escapeHtml(title)}</h3>
        ${bodyHtml}
        ${linkHtml}
      </article>
    `;
    }).join("");

  } catch (err) {
    console.error(err);
    showMessage("Could not load past issues. Please try again later.");
  }
})();
