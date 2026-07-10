const fs = require("fs");
const path = require("path");

const site = {
  baseUrl: "https://mrs.spb.ru",
  imageUrl: "https://mrs.spb.ru/images/hero.jpg",
  donationRaised: 12000,
  donationGoal: 65000,
  cloudtipsUrl: "https://pay.cloudtips.ru/p/311aaec7",
  boostyUrl: "https://boosty.to/mrsearcher/donate",
  telegramUrl: "https://t.me/MRSearcherS",
  lastUpdate: "03.07.2026"
};

const pages = [
  {
    locale: "ru",
    output: "index.html"
  },
  {
    locale: "en",
    output: "en/index.html"
  },
  {
    locale: "zh",
    output: "zh/index.html"
  }
];

const templatePath = path.join(__dirname, "template.html");
const localesDir = path.join(__dirname, "locales");
const rootDir = path.join(__dirname, "..");

const template = fs.readFileSync(templatePath, "utf8");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderTemplate(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (!(key in data)) {
      throw new Error(`Missing template value: ${key}`);
    }

    return data[key];
  });
}

function formatRub(value, lang) {
  const locale = lang === "ru" ? "ru-RU" : "en-US";
  return `${new Intl.NumberFormat(locale).format(value)} ₽`;
}

function listHtml(items) {
  return items
    .map(([label, value]) => `<li><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></li>`)
    .join("\n");
}

function paragraphsHtml(items, className = "") {
  const classAttr = className ? ` class="${className}"` : "";

  return items
    .map((text) => `<p${classAttr}>${escapeHtml(text)}</p>`)
    .join("\n");
}

function heroStatsHtml(items) {
  return items
    .map(([value, label]) => {
      return `<div class="stat"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`;
    })
    .join("\n");
}

function timelineHtml(items) {
  return items
    .map(([year, text]) => {
      return `<div class="timeline-item"><div class="timeline-year">${escapeHtml(year)}</div><p>${escapeHtml(text)}</p></div>`;
    })
    .join("\n");
}

function modsHtml(items) {
  return items
    .map(([icon, title, text]) => {
      return `<div class="mod-card"><div class="mod-icon">${icon}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></div>`;
    })
    .join("\n");
}

function galleryHtml(items, assetPrefix) {
  return items
    .map((alt, index) => {
      const number = index + 1;
      const largeClass = index === 0 ? " large" : "";
      const size = index === 0 ? ' width="820" height="620"' : ' width="420" height="300"';

      return `<div class="gallery-item${largeClass}"><img src="${assetPrefix}images/gallery-${number}.jpg"${size} loading="lazy" alt="${escapeHtml(alt)}" /></div>`;
    })
    .join("\n");
}

function faqHtml(items) {
  return items
    .map(([question, answer]) => {
      return `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`;
    })
    .join("\n");
}

function activeClass(isActive) {
  return isActive ? ' class="active"' : "";
}

for (const page of pages) {
  const localePath = path.join(localesDir, `${page.locale}.json`);
  const locale = JSON.parse(fs.readFileSync(localePath, "utf8"));

  const progressPercent = Math.round((site.donationRaised / site.donationGoal) * 100);

  const data = {
    ...locale,
    cloudtipsUrl: site.cloudtipsUrl,
    boostyUrl: site.boostyUrl,
    telegramUrl: site.telegramUrl,
    lastUpdate: site.lastUpdate,
    donationRaisedFormatted: formatRub(site.donationRaised, locale.lang),
    donationGoalFormatted: formatRub(site.donationGoal, locale.lang),
    progressPercent,
    heroStatsHtml: heroStatsHtml(locale.heroStats),
    aboutTextHtml: paragraphsHtml(locale.aboutText, "text-lg"),
    specsHtml: listHtml(locale.specs),
    timelineHtml: timelineHtml(locale.timeline),
    modsHtml: modsHtml(locale.mods),
    donateTextHtml: paragraphsHtml(locale.donateText),
    costsHtml: listHtml(locale.costs),
    galleryHtml: galleryHtml(locale.galleryAlts, locale.assetPrefix),
    faqHtml: faqHtml(locale.faq),
    qrText: escapeHtml(locale.qrText),
    langRuActive: activeClass(page.locale === "ru"),
    langEnActive: activeClass(page.locale === "en"),
    langZhActive: activeClass(page.locale === "zh")
  };

  const html = renderTemplate(template, data);
  const outputPath = path.join(rootDir, page.output);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html, "utf8");

  console.log(`Generated ${page.output}`);
}