const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const copyButtons = document.querySelectorAll("[data-copy]");
const revealItems = document.querySelectorAll(".reveal");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeLabel = document.querySelector("[data-theme-label]");
const themeColorMetas = document.querySelectorAll('meta[name="theme-color"]');
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
const themeStorageKey = "white-rose-theme";

const getStoredTheme = () => {
  try {
    const theme = localStorage.getItem(themeStorageKey);
    return theme === "light" || theme === "dark" ? theme : "system";
  } catch {
    return "system";
  }
};

const getResolvedTheme = (theme) => {
  if (theme === "system") return systemTheme.matches ? "dark" : "light";
  return theme;
};

const getNextTheme = (theme) => {
  const cycle = systemTheme.matches ? ["system", "light", "dark"] : ["system", "dark", "light"];
  return cycle[(cycle.indexOf(theme) + 1) % cycle.length];
};

const updateThemeColor = (theme, resolvedTheme) => {
  const colors = { light: "#fbfaf7", dark: "#000000" };

  themeColorMetas.forEach((meta, index) => {
    if (theme === "system") {
      meta.setAttribute("content", index === 0 ? colors.light : colors.dark);
      meta.setAttribute("media", index === 0 ? "(prefers-color-scheme: light)" : "(prefers-color-scheme: dark)");
      return;
    }

    meta.setAttribute("content", colors[resolvedTheme]);
    if (index === 0) {
      meta.removeAttribute("media");
    } else {
      meta.setAttribute("media", "not all");
    }
  });
};

const applyTheme = (theme) => {
  const resolvedTheme = getResolvedTheme(theme);
  const label = theme === "system" ? "System" : theme[0].toUpperCase() + theme.slice(1);
  document.documentElement.dataset.themeState = theme;

  if (theme === "system") {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = theme;
  }

  updateThemeColor(theme, resolvedTheme);

  if (!themeToggle || !themeLabel) return;

  const nextTheme = getNextTheme(theme);
  themeLabel.textContent = label;
  themeToggle.setAttribute(
    "aria-label",
    `Theme: ${theme}, currently ${resolvedTheme}. Click to use ${nextTheme}.`
  );
};

let selectedTheme = getStoredTheme();
applyTheme(selectedTheme);

themeToggle?.addEventListener("click", () => {
  selectedTheme = getNextTheme(selectedTheme);

  try {
    if (selectedTheme === "system") {
      localStorage.removeItem(themeStorageKey);
    } else {
      localStorage.setItem(themeStorageKey, selectedTheme);
    }
  } catch {}

  applyTheme(selectedTheme);
});

systemTheme.addEventListener("change", () => {
  applyTheme(selectedTheme);
});

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const closeMenu = () => {
  header?.classList.remove("is-menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
};

menuToggle?.addEventListener("click", () => {
  const isOpen = header?.classList.toggle("is-menu-open") ?? false;
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

nav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) closeMenu();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.append(textArea);
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
};

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const text = button.getAttribute("data-copy");
    if (!text) return;

    try {
      await copyText(text);
      button.classList.add("is-copied");
      button.setAttribute("aria-label", "Email address copied");
      window.setTimeout(() => {
        button.classList.remove("is-copied");
        button.setAttribute("aria-label", "Copy email address");
      }, 1600);
    } catch {
      button.setAttribute("aria-label", "Could not copy email address");
      window.setTimeout(() => {
        button.setAttribute("aria-label", "Copy email address");
      }, 1600);
    }
  });
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
