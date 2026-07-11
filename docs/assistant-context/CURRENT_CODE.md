# CURRENT_CODE.md

# Актуальный код проекта MRS

Дата обновления: 2026-07-11 23:37:09

## Назначение файла

Этот файл хранит актуальные ключевые файлы проекта, чтобы ассистент мог понимать, какой код используется сейчас.

Важно:

- сюда должен попадать только текущий рабочий код;
- старые варианты из переписки сюда не переносить;
- если код изменился, файл нужно обновить;
- если есть расхождение между этим файлом и памятью ассистента, верить этому файлу.

---

## Команда сборки

    node src/build.js

---

## Ожидаемая структура проекта

    /
    ├─ index.html
    ├─ en/
    │  └─ index.html
    ├─ zh/
    │  └─ index.html
    ├─ src/
    │  ├─ template.html
    │  ├─ build.js
    │  └─ locales/
    │     ├─ ru.json
    │     ├─ en.json
    │     └─ zh.json
    └─ CNAME

---


## Файл: src\build.js

~~~javascript
const fs = require("fs");
const path = require("path");

const site = {
  baseUrl: "https://mrs.spb.ru",
  imageUrl: "https://mrs.spb.ru/images/hero.jpg",
  donationRaised: 1000,
  donationGoal: 120000,
  cloudtipsUrl: "https://pay.cloudtips.ru/p/311aaec7",
  boostyUrl: "https://boosty.to/mrsearcher/donate",
  telegramUrl: "https://t.me/MRSearcherS",
  lastUpdate: "10.07.2026"
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
  return `${new Intl.NumberFormat(locale).format(value)} â‚½`;
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
~~~


## Файл: src\template.html

~~~html
<!DOCTYPE html>
<html lang="{{lang}}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>{{title}}</title>
  <meta name="description" content="{{description}}" />
  <meta name="robots" content="index, follow" />
  <meta name="theme-color" content="#ffd400" />

  <link rel="canonical" href="{{canonical}}" />
  <link rel="alternate" hreflang="ru" href="https://mrs.spb.ru/" />
  <link rel="alternate" hreflang="en" href="https://mrs.spb.ru/en/" />
  <link rel="alternate" hreflang="zh-CN" href="https://mrs.spb.ru/zh/" />
  <link rel="alternate" hreflang="x-default" href="https://mrs.spb.ru/" />

  <meta property="og:locale" content="{{locale}}" />
  <meta property="og:site_name" content="{{title}}" />
  <meta property="og:title" content="{{title}}" />
  <meta property="og:description" content="{{ogDescription}}" />
  <meta property="og:image" content="https://mrs.spb.ru/images/hero.jpg" />
  <meta property="og:image:alt" content="{{imageAlt}}" />
  <meta property="og:url" content="{{canonical}}" />
  <meta property="og:type" content="website" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{{title}}" />
  <meta name="twitter:description" content="{{twitterDescription}}" />
  <meta name="twitter:image" content="https://mrs.spb.ru/images/hero.jpg" />

  <link rel="icon" href="{{assetPrefix}}images/favicon.png" />
  <link rel="stylesheet" href="{{assetPrefix}}style.css" />
</head>

<body>
  <header class="topbar">
    <div class="topbar-inner">
      <a href="#" class="brand" aria-label="{{brandLabel}}">
        <span class="brand-dot" aria-hidden="true"></span>
        {{brand}}
      </a>

      <nav class="nav" aria-label="{{navLabel}}">
        <a href="#about">{{navAbout}}</a>
        <a href="#story">{{navStory}}</a>
        <a href="#mods">{{navMods}}</a>
        <a href="#gallery">{{navPhotos}}</a>
        <a href="#faq">{{navFaq}}</a>
        <a href="#contacts" class="nav-contact">{{navContact}}</a>
        <a href="#donate" class="nav-donate">{{navSupport}}</a>
      </nav>

      <div class="lang-switcher" aria-label="{{langLabel}}">
        <a href="{{langRuUrl}}"{{langRuActive}}>RU</a>
        <a href="{{langEnUrl}}"{{langEnActive}}>EN</a>
        <a href="{{langZhUrl}}"{{langZhActive}}>ä¸­æ–‡</a>
      </div>
    </div>
  </header>

  <section class="hero">
    <div class="container">
      <div class="hero-content">
        <h1>
          <span class="hero-title-main">{{heroTitle}}</span>
          <span class="hero-title-sub">Toyota MR-S 2000</span>
        </h1>

        <p class="hero-text">{{heroText}}</p>

        <div class="hero-actions">
          <a href="#donate" class="btn btn-primary hero-donate">{{heroDonateButton}}</a>
          <a href="#story" class="btn btn-light heroStoryButton">{{heroStoryButton}}</a>
          <a href="#gallery" class="btn btn-outline hero-gallery">{{heroGalleryButton}}</a>
        </div>

        <div class="hero-stats">
          {{heroStatsHtml}}
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="about">
    <div class="container">
      <div class="grid-2">
        <div>
          <div class="pill">{{aboutPill}}</div>
          <h2 class="section-title">{{aboutTitle}}</h2>
          {{aboutTextHtml}}
        </div>

        <div class="card">
          <h3 class="card-title">{{specsTitle}}</h3>
          <ul class="spec-list">
            {{specsHtml}}
          </ul>
          <p class="card-note">{{specsNote}}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="story">
    <div class="container">
      <div class="card story-card">
        <div class="pill pill-dark">{{storyPill}}</div>
        <h2 class="section-title">{{storyTitle}}</h2>
        <p class="section-subtitle">{{storyText}}</p>

        <div class="timeline">
          {{timelineHtml}}
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="mods">
    <div class="container">
      <div class="pill">{{modsPill}}</div>
      <h2 class="section-title">{{modsTitle}}</h2>
      <p class="section-subtitle">{{modsText}}</p>

      <div class="mods-grid">
        {{modsHtml}}
      </div>
    </div>
  </section>

  <section class="section donate-section" id="donate">
    <div class="container">
      <div class="donate-wrap">
        <div class="donate-card">
          <div class="pill pill-dark">{{donatePill}}</div>
          <h2 class="section-title">{{donateTitle}}</h2>
          {{donateTextHtml}}

          <div class="progress-box">
            <div class="progress-info">
              <span>{{raisedLabel}}: {{donationRaisedFormatted}}</span>
              <span>{{goalLabel}}: {{donationGoalFormatted}}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: {{progressPercent}}%"></div>
            </div>
          </div>

          <div class="donate-actions">
            <a href="{{cloudtipsUrl}}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" aria-label="{{donateCloudtipsLabel}}">{{donateCloudtipsText}}</a>
            <a href="{{boostyUrl}}" target="_blank" rel="noopener noreferrer" class="btn btn-light" aria-label="{{donateBoostyLabel}}">{{donateBoostyText}}</a>
          </div>

          <p class="note">{{donateNote}}</p>
        </div>

        <div class="donate-card">
          <h3 class="donate-card-title">{{costsTitle}}</h3>
          <ul class="cost-list">
            {{costsHtml}}
          </ul>
          <p class="donate-card-text">{{costsText}}</p>
          <div class="last-update">
            <strong>{{lastUpdateLabel}}</strong><br />
            {{lastUpdate}}
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="gallery">
    <div class="container">
      <div class="pill">{{galleryPill}}</div>
      <h2 class="section-title">{{galleryTitle}}</h2>
      <p class="section-subtitle">{{galleryText}}</p>

      <div class="gallery-grid">
        {{galleryHtml}}
      </div>
    </div>
  </section>

  <section class="section" id="faq">
    <div class="container">
      <div class="pill">FAQ</div>
      <h2 class="section-title">{{faqTitle}}</h2>

      <div class="faq">
        {{faqHtml}}
      </div>
    </div>
  </section>

  <section class="section" id="contacts">
    <div class="container">
      <div class="contact-card">
        <div>
          <h2>{{contactTitle}}</h2>
          <p>{{contactText}}</p>
        </div>

        <div class="contact-actions">
          <a href="{{telegramUrl}}" target="_blank" rel="noopener noreferrer" class="btn btn-dark" aria-label="{{telegramLabel}}">Telegram</a>
        </div>
      </div>
    </div>
  </section>

  <footer>
    <div class="container">
      <div>
        <strong>{{title}}</strong><br />
        {{footerText}}
      </div>

      <div>{{footerNote}}</div>
    </div>
  </footer>
</body>
</html>

~~~


## Файл: src\locales\ru.json

~~~json
{
  "lang": "ru",
  "locale": "ru_RU",
  "canonical": "https://mrs.spb.ru/",
  "assetPrefix": "",
  "title": "Ð–ÐµÐ»Ñ‚Ð¸Ðº â€” Toyota MR-S 2000",
  "description": "Ð˜ÑÑ‚Ð¾Ñ€Ð¸Ñ Ð¶Ñ‘Ð»Ñ‚Ð¾Ð¹ Toyota MR-S 2000 Ð³Ð¾Ð´Ð°: ÑÑ€ÐµÐ´Ð½ÐµÐ¼Ð¾Ñ‚Ð¾Ñ€Ð½Ñ‹Ð¹ Ñ€Ð¾Ð´ÑÑ‚ÐµÑ€, ÑÐ²Ð°Ð¿ Ñ ÑÐµÐºÐ²ÐµÐ½Ñ‚Ð°Ð»ÑŒÐ½Ð¾Ð¹ ÐºÐ¾Ñ€Ð¾Ð±ÐºÐ¸ Ð½Ð° Ð¼ÐµÑ…Ð°Ð½Ð¸ÐºÑƒ Ð¸ ÑÐ±Ð¾Ñ€ Ð½Ð° Ð½Ð¾Ð²ÑƒÑŽ Ð¼ÑÐ³ÐºÑƒÑŽ ÐºÑ€Ñ‹ÑˆÑƒ.",
  "ogDescription": "Ð–Ñ‘Ð»Ñ‚Ñ‹Ð¹ ÑÑ€ÐµÐ´Ð½ÐµÐ¼Ð¾Ñ‚Ð¾Ñ€Ð½Ñ‹Ð¹ Ñ€Ð¾Ð´ÑÑ‚ÐµÑ€ Toyota MR-S 2000. Ð˜ÑÑ‚Ð¾Ñ€Ð¸Ñ Ð¿Ñ€Ð¾ÐµÐºÑ‚Ð° Ð¸ ÑÐ±Ð¾Ñ€ Ð½Ð° Ð½Ð¾Ð²ÑƒÑŽ Ð¼ÑÐ³ÐºÑƒÑŽ ÐºÑ€Ñ‹ÑˆÑƒ.",
  "twitterDescription": "Ð˜ÑÑ‚Ð¾Ñ€Ð¸Ñ Ð¶Ñ‘Ð»Ñ‚Ð¾Ð¹ Toyota MR-S 2000 Ð³Ð¾Ð´Ð° Ð¸ ÑÐ±Ð¾Ñ€ Ð½Ð° Ð½Ð¾Ð²ÑƒÑŽ Ð¼ÑÐ³ÐºÑƒÑŽ ÐºÑ€Ñ‹ÑˆÑƒ.",
  "imageAlt": "Ð–Ñ‘Ð»Ñ‚Ð°Ñ Toyota MR-S 2000",
  "brand": "Ð–ÐµÐ»Ñ‚Ð¸Ðº",
  "brandLabel": "Ð–ÐµÐ»Ñ‚Ð¸Ðº â€” Ð²ÐµÑ€Ð½ÑƒÑ‚ÑŒÑÑ Ðº Ð½Ð°Ñ‡Ð°Ð»Ñƒ ÑÑ‚Ñ€Ð°Ð½Ð¸Ñ†Ñ‹",
  "navLabel": "ÐžÑÐ½Ð¾Ð²Ð½Ð¾Ðµ Ð¼ÐµÐ½ÑŽ",
  "langLabel": "Ð’Ñ‹Ð±Ð¾Ñ€ ÑÐ·Ñ‹ÐºÐ°",
  "langRuUrl": "index.html",
  "langEnUrl": "en/",
  "langZhUrl": "zh/",
  "navAbout": "Ðž Ð¼Ð°ÑˆÐ¸Ð½Ðµ",
  "navStory": "Ð˜ÑÑ‚Ð¾Ñ€Ð¸Ñ",
  "navMods": "Ð”Ð¾Ñ€Ð°Ð±Ð¾Ñ‚ÐºÐ¸",
  "navPhotos": "Ð¤Ð¾Ñ‚Ð¾",
  "navFaq": "FAQ",
  "navContact": "ÐšÐ¾Ð½Ñ‚Ð°ÐºÑ‚",
  "navSupport": "ÐŸÐ¾Ð´Ð´ÐµÑ€Ð¶Ð°Ñ‚ÑŒ",
  "heroTitle": "Ð–ÐµÐ»Ñ‚Ð¸Ðº",
  "heroText": "ÐŸÑ€Ð¸Ð²ÐµÑ‚! Ð•ÑÐ»Ð¸ Ñ‚Ñ‹ ÑƒÐ²Ð¸Ð´ÐµÐ» ÑÑ‚Ñƒ Ð¼Ð°ÑˆÐ¸Ð½Ñƒ Ð½Ð° ÑƒÐ»Ð¸Ñ†Ðµ Ð¸ Ð¾Ñ‚ÑÐºÐ°Ð½Ð¸Ñ€Ð¾Ð²Ð°Ð» QR-ÐºÐ¾Ð´ â€” Ð´Ð¾Ð±Ñ€Ð¾ Ð¿Ð¾Ð¶Ð°Ð»Ð¾Ð²Ð°Ñ‚ÑŒ Ð½Ð° ÑÑ‚Ñ€Ð°Ð½Ð¸Ñ†Ñƒ Ð¶Ñ‘Ð»Ñ‚Ð¾Ð¹ Toyota MR-S. Ð­Ñ‚Ð¾ Ð»Ñ‘Ð³ÐºÐ¸Ð¹ ÑÑ€ÐµÐ´Ð½ÐµÐ¼Ð¾Ñ‚Ð¾Ñ€Ð½Ñ‹Ð¹ Ñ€Ð¾Ð´ÑÑ‚ÐµÑ€, ÑÐ²Ð°Ð¿Ð½ÑƒÑ‚Ñ‹Ð¹ Ñ ÑÐµÐºÐ²ÐµÐ½Ñ‚Ð°Ð»ÑŒÐ½Ð¾Ð¹ ÐºÐ¾Ñ€Ð¾Ð±ÐºÐ¸ Ð¿ÐµÑ€ÐµÐ´Ð°Ñ‡ Ð½Ð° ÐºÐ»Ð°ÑÑÐ¸Ñ‡ÐµÑÐºÑƒÑŽ Ð¼ÐµÑ…Ð°Ð½Ð¸ÐºÑƒ.",
  "heroDonateButton": "ÐŸÐ¾Ð´Ð´ÐµÑ€Ð¶Ð°Ñ‚ÑŒ Ð·Ð°Ð¼ÐµÐ½Ñƒ ÐºÑ€Ñ‹ÑˆÐ¸",
  "heroStoryButton": "Ð˜ÑÑ‚Ð¾Ñ€Ð¸Ñ Ð¼Ð°ÑˆÐ¸Ð½Ñ‹",
  "heroGalleryButton": "Ð¡Ð¼Ð¾Ñ‚Ñ€ÐµÑ‚ÑŒ Ñ„Ð¾Ñ‚Ð¾",
  "heroStats": [
    ["2000", "Ð³Ð¾Ð´ Ð²Ñ‹Ð¿ÑƒÑÐºÐ°"],
    ["MR-S", "JDM-Ð²ÐµÑ€ÑÐ¸Ñ MR2 Spyder"],
    ["Midship", "Ð´Ð²Ð¸Ð³Ð°Ñ‚ÐµÐ»ÑŒ Ð·Ð° ÑÐ¸Ð´ÐµÐ½ÑŒÑÐ¼Ð¸"],
    ["Manual", "ÑÐ²Ð°Ð¿ Ð½Ð° Ð¼ÐµÑ…Ð°Ð½Ð¸ÐºÑƒ"]
  ],
  "aboutPill": "Ðž Ð¼Ð°ÑˆÐ¸Ð½Ðµ",
  "aboutTitle": "ÐœÐ°Ð»ÐµÐ½ÑŒÐºÐ°Ñ, Ð¶Ñ‘Ð»Ñ‚Ð°Ñ Ð¸ Ð¾Ñ‡ÐµÐ½ÑŒ Ð½Ð°ÑÑ‚Ð¾ÑÑ‰Ð°Ñ",
  "aboutText": [
    "Ð­Ñ‚Ð¾ Toyota MR-S 2000 Ð³Ð¾Ð´Ð° Ð²Ñ‹Ð¿ÑƒÑÐºÐ° â€” ÐºÐ¾Ð¼Ð¿Ð°ÐºÑ‚Ð½Ñ‹Ð¹ ÑÐ¿Ð¾Ð½ÑÐºÐ¸Ð¹ Ñ€Ð¾Ð´ÑÑ‚ÐµÑ€ Ñ Ð´Ð²Ð¸Ð³Ð°Ñ‚ÐµÐ»ÐµÐ¼, Ñ€Ð°ÑÐ¿Ð¾Ð»Ð¾Ð¶ÐµÐ½Ð½Ñ‹Ð¼ Ð·Ð° ÑÐ¸Ð´ÐµÐ½ÑŒÑÐ¼Ð¸. Ð’ Ð´Ñ€ÑƒÐ³Ð¸Ñ… ÑÑ‚Ñ€Ð°Ð½Ð°Ñ… ÑÑ‚Ñƒ Ð¼Ð¾Ð´ÐµÐ»ÑŒ Ð·Ð½Ð°ÑŽÑ‚ ÐºÐ°Ðº Toyota MR2 Spyder, Ð° MR-S â€” ÑÑ‚Ð¾ ÑÐ¿Ð¾Ð½ÑÐºÐ°Ñ Ð²ÐµÑ€ÑÐ¸Ñ Ñ‚Ñ€ÐµÑ‚ÑŒÐµÐ³Ð¾ Ð¿Ð¾ÐºÐ¾Ð»ÐµÐ½Ð¸Ñ MR2.",
    "Ð“Ð»Ð°Ð²Ð½Ð°Ñ Ð¼Ð°Ð³Ð¸Ñ ÑÑ‚Ð¾Ð¹ Ð¼Ð°ÑˆÐ¸Ð½Ñ‹ â€” Ð² Ð±Ð°Ð»Ð°Ð½ÑÐµ. ÐžÐ½Ð° Ð»Ñ‘Ð³ÐºÐ°Ñ, Ð½Ð¸Ð·ÐºÐ°Ñ, Ð·Ð°Ð´Ð½ÐµÐ¿Ñ€Ð¸Ð²Ð¾Ð´Ð½Ð°Ñ Ð¸ ÑÑ€ÐµÐ´Ð½ÐµÐ¼Ð¾Ñ‚Ð¾Ñ€Ð½Ð°Ñ. Ð—Ð´ÐµÑÑŒ Ð½ÐµÑ‚ Ð»Ð¸ÑˆÐ½ÐµÐ³Ð¾: Ð´Ð²Ð° Ð¼ÐµÑÑ‚Ð°, Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ñ‹Ð¹ Ð²ÐµÑ€Ñ…, Ð¼ÐµÑ…Ð°Ð½Ð¸ÐºÐ° Ð¸ Ð¾Ñ‰ÑƒÑ‰ÐµÐ½Ð¸Ðµ, Ñ‡Ñ‚Ð¾ Ð°Ð²Ñ‚Ð¾Ð¼Ð¾Ð±Ð¸Ð»ÑŒ ÑÐ¾Ð·Ð´Ð°Ð½ Ð½Ðµ Ð´Ð»Ñ Ñ†Ð¸Ñ„Ñ€, Ð° Ð´Ð»Ñ ÑÐ¼Ð¾Ñ†Ð¸Ð¹ Ð·Ð° Ñ€ÑƒÐ»Ñ‘Ð¼.",
    "Ð˜Ð·Ð½Ð°Ñ‡Ð°Ð»ÑŒÐ½Ð¾ Ð¼Ð°ÑˆÐ¸Ð½Ð° Ð±Ñ‹Ð»Ð° Ñ ÑÐµÐºÐ²ÐµÐ½Ñ‚Ð°Ð»ÑŒÐ½Ð¾Ð¹ ÐºÐ¾Ñ€Ð¾Ð±ÐºÐ¾Ð¹ Ð¿ÐµÑ€ÐµÐ´Ð°Ñ‡, Ð½Ð¾ Ð¿Ð¾Ð·Ð¶Ðµ Ð±Ñ‹Ð»Ð° Ð¿ÐµÑ€ÐµÐ´ÐµÐ»Ð°Ð½Ð° Ð½Ð° ÐºÐ»Ð°ÑÑÐ¸Ñ‡ÐµÑÐºÑƒÑŽ Ð¼ÐµÑ…Ð°Ð½Ð¸Ñ‡ÐµÑÐºÑƒÑŽ ÐšÐŸÐŸ. Ð¢Ð°Ðº Ð¾Ð½Ð° ÑÑ‚Ð°Ð»Ð° Ð¿Ñ€Ð¾Ñ‰Ðµ, Ð½Ð°Ð´Ñ‘Ð¶Ð½ÐµÐµ Ð¸ Ð½Ð°Ð¼Ð½Ð¾Ð³Ð¾ Ñ‡ÐµÑÑ‚Ð½ÐµÐµ Ð² ÑƒÐ¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¸Ð¸."
  ],
  "specsTitle": "Ð¥Ð°Ñ€Ð°ÐºÑ‚ÐµÑ€Ð¸ÑÑ‚Ð¸ÐºÐ¸",
  "specsNote": "",
  "specs": [
    ["ÐœÐ°Ñ€ÐºÐ°", "Toyota"],
    ["ÐœÐ¾Ð´ÐµÐ»ÑŒ", "MR-S / MR2 Spyder"],
    ["Ð“Ð¾Ð´", "2000"],
    ["Ð¦Ð²ÐµÑ‚", "Ð–Ñ‘Ð»Ñ‚Ñ‹Ð¹"],
    ["ÐšÑƒÐ·Ð¾Ð²", "Ð Ð¾Ð´ÑÑ‚ÐµÑ€"],
    ["ÐšÐ¾Ð¼Ð¿Ð¾Ð½Ð¾Ð²ÐºÐ°", "Ð¡Ñ€ÐµÐ´Ð½ÐµÐ¼Ð¾Ñ‚Ð¾Ñ€Ð½Ð°Ñ"],
    ["ÐŸÑ€Ð¸Ð²Ð¾Ð´", "Ð—Ð°Ð´Ð½Ð¸Ð¹"],
    ["ÐšÐ¾Ñ€Ð¾Ð±ÐºÐ°", "ÐœÐšÐŸÐŸ, ÑÐ²Ð°Ð¿ Ñ ÑÐµÐºÐ²ÐµÐ½Ñ‚Ð°Ð»Ð°"],
    ["Ð”Ð²Ð¸Ð³Ð°Ñ‚ÐµÐ»ÑŒ", "1ZZ-FE, 1.8 Ð»"],
    ["ÐœÐ¾Ñ‰Ð½Ð¾ÑÑ‚ÑŒ", "Ð¾ÐºÐ¾Ð»Ð¾ 140 Ð».Ñ."],
    ["Ð’ÐµÑ", "Ð¿Ñ€Ð¸Ð¼ÐµÑ€Ð½Ð¾ 970 ÐºÐ³"]
  ],
  "storyPill": "Ð˜ÑÑ‚Ð¾Ñ€Ð¸Ñ Ð¿Ñ€Ð¾ÐµÐºÑ‚Ð°",
  "storyTitle": "ÐŸÐ¾Ñ‡ÐµÐ¼Ñƒ Ð¸Ð¼ÐµÐ½Ð½Ð¾ MR-S?",
  "storyText": "Ð£ ÑÑ‚Ð¾Ð¹ Ð¼Ð°ÑˆÐ¸Ð½Ñ‹ ÐµÑÑ‚ÑŒ Ñ…Ð°Ñ€Ð°ÐºÑ‚ÐµÑ€. ÐžÐ½Ð° Ð½Ðµ ÑÐ°Ð¼Ð°Ñ Ð±Ñ‹ÑÑ‚Ñ€Ð°Ñ, Ð½Ðµ ÑÐ°Ð¼Ð°Ñ Ð¿Ñ€Ð°ÐºÑ‚Ð¸Ñ‡Ð½Ð°Ñ Ð¸ Ñ‚Ð¾Ñ‡Ð½Ð¾ Ð½Ðµ ÑÐ°Ð¼Ð°Ñ Ð½Ð¾Ð²Ð°Ñ. ÐÐ¾ Ð² Ð½ÐµÐ¹ ÐµÑÑ‚ÑŒ Ñ‚Ð¾, Ð·Ð° Ñ‡Ñ‚Ð¾ Ð»ÑŽÐ±ÑÑ‚ ÑÑ‚Ð°Ñ€Ñ‹Ðµ ÑÐ¿Ð¾Ð½ÑÐºÐ¸Ðµ Ð°Ð²Ñ‚Ð¾Ð¼Ð¾Ð±Ð¸Ð»Ð¸: Ð»Ñ‘Ð³ÐºÐ¾ÑÑ‚ÑŒ, Ð¿Ñ€Ð¾ÑÑ‚Ð¾Ñ‚Ð°, Ñ‡ÐµÑÑ‚Ð½Ð°Ñ Ð¼ÐµÑ…Ð°Ð½Ð¸ÐºÐ° Ð¸ Ð¾Ñ‰ÑƒÑ‰ÐµÐ½Ð¸Ðµ Ð¶Ð¸Ð²Ð¾Ð¹ Ð¼Ð°ÑˆÐ¸Ð½Ñ‹.",
  "timeline": [
    ["2000", "ÐœÐ°ÑˆÐ¸Ð½Ð° Ð²Ñ‹Ð¿ÑƒÑ‰ÐµÐ½Ð° Ð² Ð¯Ð¿Ð¾Ð½Ð¸Ð¸ ÐºÐ°Ðº Toyota MR-S â€” Ñ‚Ñ€ÐµÑ‚ÑŒÐµ Ð¿Ð¾ÐºÐ¾Ð»ÐµÐ½Ð¸Ðµ MR2. Ð’ÑÐµÐ³Ð¾ Ð±Ñ‹Ð»Ð¾ Ð²Ñ‹Ð¿ÑƒÑ‰ÐµÐ½Ð¾ Ð¾ÐºÐ¾Ð»Ð¾ 77 840 Ð°Ð²Ñ‚Ð¾Ð¼Ð¾Ð±Ð¸Ð»ÐµÐ¹ Ð¿Ð¾ÐºÐ¾Ð»ÐµÐ½Ð¸Ñ W30."],
    ["Ð”Ð¾ Ð¼ÐµÐ½Ñ", "ÐÐ²Ñ‚Ð¾Ð¼Ð¾Ð±Ð¸Ð»ÑŒ ÑƒÑÐ¿ÐµÐ» Ð¿Ñ€Ð¾Ð¹Ñ‚Ð¸ Ð³Ð¾Ð´Ñ‹ ÑÐºÑÐ¿Ð»ÑƒÐ°Ñ‚Ð°Ñ†Ð¸Ð¸ Ð¸ Ð¿Ð¾Ð±Ñ‹Ð²Ð°Ñ‚ÑŒ Ð² Ð±ÐµÑ€ÐµÐ¶Ð½Ð¾Ð¼ Ð²Ð»Ð°Ð´ÐµÐ½Ð¸Ð¸ Ñ‚Ñ€ÐµÑ… Ð°Ð²Ñ‚Ð¾Ð¼Ð¾Ð±Ð¸Ð»Ð¸ÑÑ‚Ð¾Ð²."],
    ["ÐŸÑƒÑ‚ÐµÑˆÐµÑÑ‚Ð²Ð¸Ñ", "ÐœÐ°ÑˆÐ¸Ð½Ð° Ð¿ÐµÑ€ÐµÐµÑ…Ð°Ð»Ð° Ð¸Ð· Ð¯Ð¿Ð¾Ð½Ð¸Ð¸ Ð² Ð•ÐºÐ°Ñ‚ÐµÑ€Ð¸Ð½Ð±ÑƒÑ€Ð³, Ð¿Ð¾Ñ‚Ð¾Ð¼ ÑÐ²Ð¾Ð¸Ð¼ Ñ…Ð¾Ð´Ð¾Ð¼ Ð² Ð¡Ð°Ð½ÐºÑ‚-ÐŸÐµÑ‚ÐµÑ€Ð±ÑƒÑ€Ð³, ÐµÐ·Ð´Ð¸Ð»Ð° Ð² Ð¤Ð¸Ð½Ð»ÑÐ½Ð´Ð¸ÑŽ, Ð‘ÐµÐ»Ð¾Ñ€ÑƒÑÑÐ¸ÑŽ, Ð’Ñ‹Ð±Ð¾Ñ€Ð³, ÐŸÑÐºÐ¾Ð² Ð¸ Ð’ÐµÐ»Ð¸ÐºÐ¸Ð¹ ÐÐ¾Ð²Ð³Ð¾Ñ€Ð¾Ð´."],
    ["Ð¡ÐµÐ¹Ñ‡Ð°Ñ", "Ð¯ Ð¿Ð¾ÑÑ‚ÐµÐ¿ÐµÐ½Ð½Ð¾ Ð¿Ñ€Ð¸Ð²Ð¾Ð¶Ñƒ Ð¼Ð°ÑˆÐ¸Ð½Ñƒ Ð² Ð¿Ð¾Ñ€ÑÐ´Ð¾Ðº, Ð¾Ð±ÑÐ»ÑƒÐ¶Ð¸Ð²Ð°ÑŽ ÐµÑ‘, ÑÐ¾Ñ…Ñ€Ð°Ð½ÑÑŽ Ñ…Ð°Ñ€Ð°ÐºÑ‚ÐµÑ€ Ð¸ ÑÑ‚Ð°Ñ€Ð°ÑŽÑÑŒ, Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð¾Ð½Ð° Ñ€Ð°Ð´Ð¾Ð²Ð°Ð»Ð° Ð½Ðµ Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð¼ÐµÐ½Ñ, Ð½Ð¾ Ð¸ Ð¿Ñ€Ð¾Ñ…Ð¾Ð¶Ð¸Ñ…."],
    ["Ð¡Ð»ÐµÐ´ÑƒÑŽÑ‰Ð¸Ð¹ ÑˆÐ°Ð³", "Ð“Ð»Ð°Ð²Ð½Ð°Ñ Ð±Ð»Ð¸Ð¶Ð°Ð¹ÑˆÐ°Ñ Ñ†ÐµÐ»ÑŒ â€” Ð·Ð°Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð¼ÑÐ³ÐºÑƒÑŽ ÐºÑ€Ñ‹ÑˆÑƒ. ÐÐ¾Ð²Ð°Ñ ÐºÑ€Ñ‹ÑˆÐ° ÑÐ´ÐµÐ»Ð°ÐµÑ‚ Ð¼Ð°ÑˆÐ¸Ð½Ñƒ Ð°ÐºÐºÑƒÑ€Ð°Ñ‚Ð½ÐµÐµ Ð¸ Ð»ÑƒÑ‡ÑˆÐµ Ð·Ð°Ñ‰Ð¸Ñ‚Ð¸Ñ‚ ÑÐ°Ð»Ð¾Ð½ Ð¾Ñ‚ Ð´Ð¾Ð¶Ð´Ñ."]
  ],
  "modsPill": "Ð§Ñ‚Ð¾ ÑÐ´ÐµÐ»Ð°Ð½Ð¾",
  "modsTitle": "Ð”Ð¾Ñ€Ð°Ð±Ð¾Ñ‚ÐºÐ¸ Ð¸ Ð¾Ð±ÑÐ»ÑƒÐ¶Ð¸Ð²Ð°Ð½Ð¸Ðµ",
  "modsText": "ÐŸÑ€Ð¾ÐµÐºÑ‚ Ð½Ðµ Ð¿Ñ€Ð¾ Ð±ÐµÐ·ÑƒÐ¼Ð½Ñ‹Ð¹ Ñ‚ÑŽÐ½Ð¸Ð½Ð³, Ð° Ð¿Ñ€Ð¾ ÑÐ¾Ñ…Ñ€Ð°Ð½ÐµÐ½Ð¸Ðµ Ð¶Ð¸Ð²Ð¾Ð³Ð¾ Ð¸ Ð¿Ñ€Ð¸ÑÑ‚Ð½Ð¾Ð³Ð¾ Ð°Ð²Ñ‚Ð¾Ð¼Ð¾Ð±Ð¸Ð»Ñ.",
  "mods": [
    ["âš™ï¸", "Ð¡Ð²Ð°Ð¿ Ð½Ð° Ð¼ÐµÑ…Ð°Ð½Ð¸ÐºÑƒ", "ÐœÐ°ÑˆÐ¸Ð½Ð° Ð±Ñ‹Ð»Ð° Ð¿ÐµÑ€ÐµÐ²ÐµÐ´ÐµÐ½Ð° Ñ ÑÐµÐºÐ²ÐµÐ½Ñ‚Ð°Ð»ÑŒÐ½Ð¾Ð¹ ÐºÐ¾Ñ€Ð¾Ð±ÐºÐ¸ Ð½Ð° ÐºÐ»Ð°ÑÑÐ¸Ñ‡ÐµÑÐºÑƒÑŽ ÐœÐšÐŸÐŸ."],
    ["ðŸ› ï¸", "ÐžÐ±ÑÐ»ÑƒÐ¶Ð¸Ð²Ð°Ð½Ð¸Ðµ", "ÐŸÐ¾ÑÑ‚ÐµÐ¿ÐµÐ½Ð½Ð¾ Ð¿Ñ€Ð¸Ð²Ð¾Ð´ÑÑ‚ÑÑ Ð² Ð¿Ð¾Ñ€ÑÐ´Ð¾Ðº Ð¶Ð¸Ð´ÐºÐ¾ÑÑ‚Ð¸, Ñ€Ð°ÑÑ…Ð¾Ð´Ð½Ð¸ÐºÐ¸, Ð¿Ð¾Ð´Ð²ÐµÑÐºÐ°, Ñ‚Ð¾Ñ€Ð¼Ð¾Ð·Ð° Ð¸ Ñ‚ÐµÑ…Ð½Ð¸Ñ‡ÐµÑÐºÐ¸Ðµ ÑƒÐ·Ð»Ñ‹."],
    ["â˜€ï¸", "Ð’Ð½ÐµÑˆÐ½Ð¸Ð¹ Ð²Ð¸Ð´", "Ð“Ð»Ð°Ð²Ð½Ð°Ñ ÐºÐ¾ÑÐ¼ÐµÑ‚Ð¸Ñ‡ÐµÑÐºÐ°Ñ Ð·Ð°Ð´Ð°Ñ‡Ð° ÑÐµÐ¹Ñ‡Ð°Ñ â€” Ð½Ð¾Ð²Ð°Ñ Ð¼ÑÐ³ÐºÐ°Ñ ÐºÑ€Ñ‹ÑˆÐ°."]
  ],
  "donatePill": "Ð¡Ð±Ð¾Ñ€ Ð½Ð° ÐºÑ€Ñ‹ÑˆÑƒ",
  "donateTitle": "ÐŸÐ¾Ð¼Ð¾Ð³Ð¸ MR-S Ð¿Ð¾Ð»ÑƒÑ‡Ð¸Ñ‚ÑŒ Ð½Ð¾Ð²ÑƒÑŽ Ð¼ÑÐ³ÐºÑƒÑŽ ÐºÑ€Ñ‹ÑˆÑƒ",
  "donateText": [
    "Ð¢ÐµÐºÑƒÑ‰Ð°Ñ ÐºÑ€Ñ‹ÑˆÐ° ÑƒÐ¶Ðµ ÑƒÑÑ‚Ð°Ð»Ð°: Ñ‚ÐºÐ°Ð½ÑŒ Ð¿Ð¾Ñ‚ÐµÑ€ÑÐ»Ð° Ð²Ð½ÐµÑˆÐ½Ð¸Ð¹ Ð²Ð¸Ð´, Ð¿Ð¾ÑÐ²Ð¸Ð»Ð¸ÑÑŒ ÑÐ»ÐµÐ´Ñ‹ Ð¸Ð·Ð½Ð¾ÑÐ°, Ð° Ð´Ð»Ñ Ñ€Ð¾Ð´ÑÑ‚ÐµÑ€Ð° ÐºÑ€Ñ‹ÑˆÐ° â€” ÑÑ‚Ð¾ Ð²Ð°Ð¶Ð½Ð°Ñ Ñ‡Ð°ÑÑ‚ÑŒ Ð¾Ð±Ñ€Ð°Ð·Ð° Ð¸ Ð·Ð°Ñ‰Ð¸Ñ‚Ñ‹ ÑÐ°Ð»Ð¾Ð½Ð°.",
    "Ð•ÑÐ»Ð¸ Ñ‚ÐµÐ±Ðµ Ð¿Ð¾Ð½Ñ€Ð°Ð²Ð¸Ð»Ð°ÑÑŒ Ð¼Ð°ÑˆÐ¸Ð½Ð° Ð¸Ð»Ð¸ Ð¸ÑÑ‚Ð¾Ñ€Ð¸Ñ Ð¿Ñ€Ð¾ÐµÐºÑ‚Ð° â€” Ð¼Ð¾Ð¶Ð½Ð¾ Ð¾ÑÑ‚Ð°Ð²Ð¸Ñ‚ÑŒ Ð´Ð¾Ð±Ñ€Ð¾Ð²Ð¾Ð»ÑŒÐ½Ñ‹Ð¹ Ð´Ð¾Ð½Ð°Ñ‚. Ð›ÑŽÐ±Ð°Ñ ÑÑƒÐ¼Ð¼Ð° Ð¿Ñ€Ð¸Ð±Ð»Ð¸Ð·Ð¸Ñ‚ MR-S Ðº Ð¾Ð±Ð½Ð¾Ð²Ð»ÐµÐ½Ð¸ÑŽ."
  ],
  "raisedLabel": "Ð¡Ð¾Ð±Ñ€Ð°Ð½Ð¾",
  "goalLabel": "Ð¦ÐµÐ»ÑŒ",
  "donateCloudtipsText": "ÐŸÐ¾Ð´Ð´ÐµÑ€Ð¶Ð°Ñ‚ÑŒ Ñ Ñ€Ð¾ÑÑÐ¸Ð¹ÑÐºÐ¾Ð¹ ÐºÐ°Ñ€Ñ‚Ñ‹",
  "donateBoostyText": "ÐŸÐ¾Ð´Ð´ÐµÑ€Ð¶Ð°Ñ‚ÑŒ Ñ Ð¸Ð½Ð¾ÑÑ‚Ñ€Ð°Ð½Ð½Ð¾Ð¹ ÐºÐ°Ñ€Ñ‚Ñ‹",
  "donateCloudtipsLabel": "ÐžÑ‚ÐºÑ€Ñ‹Ñ‚ÑŒ CloudTips Ð´Ð»Ñ Ð¿Ð¾Ð´Ð´ÐµÑ€Ð¶ÐºÐ¸ Ñ Ñ€Ð¾ÑÑÐ¸Ð¹ÑÐºÐ¾Ð¹ ÐºÐ°Ñ€Ñ‚Ñ‹",
  "donateBoostyLabel": "ÐžÑ‚ÐºÑ€Ñ‹Ñ‚ÑŒ Boosty Ð´Ð»Ñ Ð¿Ð¾Ð´Ð´ÐµÑ€Ð¶ÐºÐ¸ Ñ Ð¸Ð½Ð¾ÑÑ‚Ñ€Ð°Ð½Ð½Ð¾Ð¹ ÐºÐ°Ñ€Ñ‚Ñ‹",
  "donateNote": "Ð”Ð¾Ð½Ð°Ñ‚ â€” ÑÑ‚Ð¾ Ð´Ð¾Ð±Ñ€Ð¾Ð²Ð¾Ð»ÑŒÐ½Ð°Ñ Ð»Ð¸Ñ‡Ð½Ð°Ñ Ð¿Ð¾Ð´Ð´ÐµÑ€Ð¶ÐºÐ° Ð°Ð²Ñ‚Ð¾Ð¼Ð¾Ð±Ð¸Ð»ÑŒÐ½Ð¾Ð³Ð¾ Ð¿Ñ€Ð¾ÐµÐºÑ‚Ð°. Ð­Ñ‚Ð¾ Ð½Ðµ Ð¿Ð¾ÐºÑƒÐ¿ÐºÐ° Ñ‚Ð¾Ð²Ð°Ñ€Ð° Ð¸Ð»Ð¸ ÑƒÑÐ»ÑƒÐ³Ð¸.",
  "costsTitle": "ÐÐ° Ñ‡Ñ‚Ð¾ Ð¿Ð¾Ð¹Ð´ÑƒÑ‚ Ð´ÐµÐ½ÑŒÐ³Ð¸",
  "costs": [
    ["ÐÐ¾Ð²Ð°Ñ Ð¼ÑÐ³ÐºÐ°Ñ ÐºÑ€Ñ‹ÑˆÐ°", "80 000 â‚½"],
    ["Ð”Ð¾ÑÑ‚Ð°Ð²ÐºÐ° / ÐºÑ€ÐµÐ¿Ñ‘Ð¶ / Ð¼ÐµÐ»Ð¾Ñ‡Ð¸", "25 000 â‚½"],
    ["Ð£ÑÑ‚Ð°Ð½Ð¾Ð²ÐºÐ°", "15 000 â‚½"],
    ["Ð˜Ñ‚Ð¾Ð³Ð¾", "120 000 â‚½"]
  ],
  "costsText": "Ð¯ Ð±ÑƒÐ´Ñƒ Ð¾Ð±Ð½Ð¾Ð²Ð»ÑÑ‚ÑŒ Ð¿Ñ€Ð¾Ð³Ñ€ÐµÑÑ ÑÐ±Ð¾Ñ€Ð° Ð¸ Ð¿Ð¾ÑÐ»Ðµ Ð¿Ð¾ÐºÑƒÐ¿ÐºÐ¸ Ð¿Ð¾ÐºÐ°Ð¶Ñƒ Ñ€ÐµÐ·ÑƒÐ»ÑŒÑ‚Ð°Ñ‚.",
  "lastUpdateLabel": "ÐŸÐ¾ÑÐ»ÐµÐ´Ð½ÐµÐµ Ð¾Ð±Ð½Ð¾Ð²Ð»ÐµÐ½Ð¸Ðµ:",
  "galleryPill": "Ð“Ð°Ð»ÐµÑ€ÐµÑ",
  "galleryTitle": "ÐÐµÐ¼Ð½Ð¾Ð³Ð¾ Ñ„Ð¾Ñ‚Ð¾",
  "galleryText": "",
  "galleryAlts": [
    "Ð–Ñ‘Ð»Ñ‚Ð°Ñ Toyota MR-S ÑÐ¿ÐµÑ€ÐµÐ´Ð¸",
    "Toyota MR-S ÑÐ±Ð¾ÐºÑƒ",
    "Toyota MR-S ÑÐ·Ð°Ð´Ð¸",
    "Ð¡Ð°Ð»Ð¾Ð½ Toyota MR-S",
    "ÐœÐµÑ…Ð°Ð½Ð¸Ñ‡ÐµÑÐºÐ°Ñ ÐºÐ¾Ñ€Ð¾Ð±ÐºÐ° Toyota MR-S",
    "ÐœÑÐ³ÐºÐ°Ñ ÐºÑ€Ñ‹ÑˆÐ° Toyota MR-S",
    "Ð”ÐµÑ‚Ð°Ð»Ð¸ Toyota MR-S"
  ],
  "faqTitle": "Ð§Ð°ÑÑ‚Ñ‹Ðµ Ð²Ð¾Ð¿Ñ€Ð¾ÑÑ‹",
  "faq": [
    ["Ð­Ñ‚Ð¾ MR2 Ð¸Ð»Ð¸ MR-S?", "Toyota MR-S â€” ÑÑ‚Ð¾ ÑÐ¿Ð¾Ð½ÑÐºÐ°Ñ Ð²ÐµÑ€ÑÐ¸Ñ Ñ‚Ñ€ÐµÑ‚ÑŒÐµÐ³Ð¾ Ð¿Ð¾ÐºÐ¾Ð»ÐµÐ½Ð¸Ñ Toyota MR2. ÐÐ° Ð½ÐµÐºÐ¾Ñ‚Ð¾Ñ€Ñ‹Ñ… Ñ€Ñ‹Ð½ÐºÐ°Ñ… Ð¼Ð¾Ð´ÐµÐ»ÑŒ Ð½Ð°Ð·Ñ‹Ð²Ð°Ð»Ð°ÑÑŒ MR2 Spyder."],
    ["ÐžÐ½Ð° Ð¿Ñ€Ð°Ð²Ð´Ð° ÑÑ€ÐµÐ´Ð½ÐµÐ¼Ð¾Ñ‚Ð¾Ñ€Ð½Ð°Ñ?", "Ð”Ð°. Ð”Ð²Ð¸Ð³Ð°Ñ‚ÐµÐ»ÑŒ Ñ€Ð°ÑÐ¿Ð¾Ð»Ð¾Ð¶ÐµÐ½ Ð·Ð° ÑÐ¸Ð´ÐµÐ½ÑŒÑÐ¼Ð¸, Ð¿ÐµÑ€ÐµÐ´ Ð·Ð°Ð´Ð½ÐµÐ¹ Ð¾ÑÑŒÑŽ."],
    ["ÐŸÐ¾Ñ‡ÐµÐ¼Ñƒ ÐºÐ¾Ñ€Ð¾Ð±ÐºÑƒ ÑÐ²Ð°Ð¿Ð½ÑƒÐ»Ð¸ Ñ ÑÐµÐºÐ²ÐµÐ½Ñ‚Ð°Ð»Ð° Ð½Ð° Ð¼ÐµÑ…Ð°Ð½Ð¸ÐºÑƒ?", "ÐšÐ»Ð°ÑÑÐ¸Ñ‡ÐµÑÐºÐ°Ñ Ð¼ÐµÑ…Ð°Ð½Ð¸ÐºÐ° Ð¿Ñ€Ð¾Ñ‰Ðµ, Ð½Ð°Ð´Ñ‘Ð¶Ð½ÐµÐµ Ð¸ Ð´Ð°Ñ‘Ñ‚ Ð±Ð¾Ð»ÑŒÑˆÐµ ÐºÐ¾Ð½Ñ‚Ñ€Ð¾Ð»Ñ Ð·Ð° Ñ€ÑƒÐ»Ñ‘Ð¼."],
    ["ÐÐ° Ñ‡Ñ‚Ð¾ Ð¸Ð´ÑƒÑ‚ Ð´Ð¾Ð½Ð°Ñ‚Ñ‹?", "ÐÐ° Ð¿Ð¾ÐºÑƒÐ¿ÐºÑƒ Ð¸ ÑƒÑÑ‚Ð°Ð½Ð¾Ð²ÐºÑƒ Ð½Ð¾Ð²Ð¾Ð¹ Ð¼ÑÐ³ÐºÐ¾Ð¹ ÐºÑ€Ñ‹ÑˆÐ¸."],
    ["ÐœÐ¾Ð¶Ð½Ð¾ ÑÑ„Ð¾Ñ‚Ð¾Ð³Ñ€Ð°Ñ„Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ Ð¼Ð°ÑˆÐ¸Ð½Ñƒ?", "ÐšÐ¾Ð½ÐµÑ‡Ð½Ð¾! Ð¢Ð¾Ð»ÑŒÐºÐ¾, Ð¿Ð¾Ð¶Ð°Ð»ÑƒÐ¹ÑÑ‚Ð°, Ð±ÑƒÐ´ÑŒÑ‚Ðµ Ð°ÐºÐºÑƒÑ€Ð°Ñ‚Ð½Ñ‹ Ñ Ð¼Ð°ÑˆÐ¸Ð½Ð¾Ð¹."],
    ["ÐœÐ¾Ð¶Ð½Ð¾ Ð½Ð°Ð¿Ð¸ÑÐ°Ñ‚ÑŒ Ð²Ð»Ð°Ð´ÐµÐ»ÑŒÑ†Ñƒ?", "Ð”Ð°, ÐºÐ¾Ð½Ñ‚Ð°ÐºÑ‚Ñ‹ ÐµÑÑ‚ÑŒ Ð½Ð¸Ð¶Ðµ. Ð›ÑƒÑ‡ÑˆÐµ Ð¿Ð¸ÑÐ°Ñ‚ÑŒ Ð² Telegram."]
  ],
  "contactTitle": "Ð£Ð²Ð¸Ð´ÐµÐ» MR-S Ð½Ð° ÑƒÐ»Ð¸Ñ†Ðµ?",
  "contactText": "Ð¡Ð¿Ð°ÑÐ¸Ð±Ð¾, Ñ‡Ñ‚Ð¾ Ð·Ð°Ð³Ð»ÑÐ½ÑƒÐ» Ð½Ð° ÑÑ‚Ñ€Ð°Ð½Ð¸Ñ†Ñƒ. Ð•ÑÐ»Ð¸ Ñ…Ð¾Ñ‡ÐµÑˆÑŒ Ð¾Ñ‚Ð¿Ñ€Ð°Ð²Ð¸Ñ‚ÑŒ Ñ„Ð¾Ñ‚Ð¾, Ð·Ð°Ð´Ð°Ñ‚ÑŒ Ð²Ð¾Ð¿Ñ€Ð¾Ñ Ð¸Ð»Ð¸ Ð¿Ñ€Ð¾ÑÑ‚Ð¾ ÑÐºÐ°Ð·Ð°Ñ‚ÑŒ Ð¿Ñ€Ð¸Ð²ÐµÑ‚ â€” Ð¼Ð¾Ð¶Ð½Ð¾ Ð½Ð°Ð¿Ð¸ÑÐ°Ñ‚ÑŒ Ð¼Ð½Ðµ Ð² Telegram.",
  "telegramLabel": "ÐÐ°Ð¿Ð¸ÑÐ°Ñ‚ÑŒ Ð²Ð»Ð°Ð´ÐµÐ»ÑŒÑ†Ñƒ Ð–ÐµÐ»Ñ‚Ð¸ÐºÐ° Ð² Telegram",
  "qrTitle": "",
  "footerText": "Ð–Ñ‘Ð»Ñ‚Ñ‹Ð¹ ÑÑ€ÐµÐ´Ð½ÐµÐ¼Ð¾Ñ‚Ð¾Ñ€Ð½Ñ‹Ð¹ Ñ€Ð¾Ð´ÑÑ‚ÐµÑ€.",
  "footerNote": "Ð¡Ð´ÐµÐ»Ð°Ð½Ð¾ Ñ Ð»ÑŽÐ±Ð¾Ð²ÑŒÑŽ Ðº Ð¼Ð°Ð»ÐµÐ½ÑŒÐºÐ¸Ð¼ ÑÐ¿Ð¾Ð½ÑÐºÐ¸Ð¼ Ð¼Ð°ÑˆÐ¸Ð½Ð°Ð¼."
}

~~~


## Файл: src\locales\en.json

~~~json
{
  "lang": "en",
  "locale": "en_US",
  "canonical": "https://mrs.spb.ru/en/",
  "assetPrefix": "../",
  "title": "Zheltik â€” Toyota MR-S 2000",
  "description": "The story of a yellow 2000 Toyota MR-S: a mid-engine roadster, manual transmission swap, and a fundraiser for a new soft top.",
  "ogDescription": "A yellow mid-engine Toyota MR-S 2000. Project story and fundraiser for a new soft top.",
  "twitterDescription": "The story of a yellow 2000 Toyota MR-S and a fundraiser for a new soft top.",
  "imageAlt": "Yellow Toyota MR-S 2000",
  "brand": "Zheltik",
  "brandLabel": "Zheltik â€” back to top",
  "navLabel": "Main navigation",
  "langLabel": "Language selection",
  "langRuUrl": "../",
  "langEnUrl": "index.html",
  "langZhUrl": "../zh/",
  "navAbout": "About",
  "navStory": "Story",
  "navMods": "Mods",
  "navPhotos": "Photos",
  "navFaq": "FAQ",
  "navContact": "Contact",
  "navSupport": "Support",
  "heroTitle": "Zheltik",
  "heroText": "Hi! If you saw this car on the street and scanned the QR code, welcome to the page of the yellow Toyota MR-S. It is a lightweight mid-engine roadster, converted from a sequential transmission to a classic manual gearbox.",
  "heroDonateButton": "Support the new soft top",
  "heroStoryButton": "Car story",
  "heroGalleryButton": "View photos",
  "heroStats": [
    ["2000", "year of production"],
    ["MR-S", "JDM version of MR2 Spyder"],
    ["Midship", "engine behind the seats"],
    ["Manual", "manual gearbox swap"]
  ],
  "aboutPill": "About the car",
  "aboutTitle": "Small, yellow, and very real",
  "aboutText": [
    "This is a 2000 Toyota MR-S â€” a compact Japanese roadster with the engine placed behind the seats. In other markets, this model is known as the Toyota MR2 Spyder.",
    "The magic of this car is in its balance. It is light, low, rear-wheel drive, and mid-engine. Two seats, an open top, a manual gearbox, and a feeling that the car was made for emotions rather than numbers.",
    "Originally, the car had a sequential transmission, but it was later converted to a classic manual gearbox. That made it simpler, more reliable, and much more honest to drive."
  ],
  "specsTitle": "Specifications",
  "specsNote": "* Data is based on open sources for the stock Toyota MR-S / MR2 Spyder W30.",
  "specs": [
    ["Make", "Toyota"],
    ["Model", "MR-S / MR2 Spyder"],
    ["Year", "2000"],
    ["Color", "Yellow"],
    ["Body", "Roadster"],
    ["Layout", "Mid-engine"],
    ["Drive", "Rear-wheel drive"],
    ["Gearbox", "Manual, swapped from sequential"],
    ["Engine", "1ZZ-FE, 1.8 L"],
    ["Power", "about 140 hp"],
    ["Weight", "about 970 kg"]
  ],
  "storyPill": "Project story",
  "storyTitle": "Why the MR-S?",
  "storyText": "This car has character. It is not the fastest, not the most practical, and definitely not the newest. But it has everything people love about old Japanese cars: lightness, simplicity, honest mechanics, and the feeling of a living machine.",
  "timeline": [
    ["2000", "The car was produced in Japan as the Toyota MR-S â€” the third generation of the MR2."],
    ["Before me", "The car lived through years of use and received an important upgrade: a swap from the sequential transmission to a manual gearbox."],
    ["Trips", "It came from Japan to Yekaterinburg, then drove to Saint Petersburg. Since then it has visited Finland, Belarus, Vyborg, Pskov, and Veliky Novgorod."],
    ["Now", "I am gradually maintaining and improving the car while keeping its character alive."],
    ["Next step", "The main upcoming goal is to replace the soft top. A new top will make the car look cleaner and protect the interior better."]
  ],
  "modsPill": "What has been done",
  "modsTitle": "Modifications and maintenance",
  "modsText": "This project is not about wild tuning. It is about keeping a lively and enjoyable car on the road.",
  "mods": [
    ["âš™ï¸", "Manual swap", "The car was converted from a sequential transmission to a classic manual gearbox."],
    ["ðŸ› ï¸", "Maintenance", "Fluids, consumables, suspension, brakes, and other technical parts are being refreshed step by step."],
    ["â˜€ï¸", "Appearance", "The main cosmetic task right now is a new soft top."]
  ],
  "donatePill": "Soft top fundraiser",
  "donateTitle": "Help the MR-S get a new soft top",
  "donateText": [
    "The current soft top is tired: the fabric has lost its look and shows wear. For a roadster, the roof is not just a part â€” it is a key piece of the carâ€™s image and interior protection.",
    "If you like the car or the project story, you can leave a voluntary donation. Any amount brings the MR-S closer to the update."
  ],
  "raisedLabel": "Raised",
  "goalLabel": "Goal",
  "donateCloudtipsText": "Support with a Russian card",
  "donateBoostyText": "Support with an international card",
  "donateCloudtipsLabel": "Open CloudTips to support with a Russian card",
  "donateBoostyLabel": "Open Boosty to support with an international card",
  "donateNote": "A donation is voluntary personal support for the car project. It is not a purchase of goods or services.",
  "costsTitle": "What the money is for",
  "costs": [
    ["New soft top", "80,000 â‚½"],
    ["Shipping / hardware / small parts", "25,000 â‚½"],
    ["Installation", "15,000 â‚½"],
    ["Total", "120,000 â‚½"]
  ],
  "costsText": "I will update the fundraising progress and show the result after the purchase.",
  "lastUpdateLabel": "Last update:",
  "galleryPill": "Gallery",
  "galleryTitle": "Some photos",
  "galleryText": "Here you can see the car from different angles: exterior, interior, manual shifter, soft top, and project details.",
  "galleryAlts": [
    "Yellow Toyota MR-S from the front",
    "Toyota MR-S side view",
    "Toyota MR-S rear view",
    "Toyota MR-S interior",
    "Toyota MR-S manual gearbox",
    "Toyota MR-S soft top",
    "Toyota MR-S project details"
  ],
  "faqTitle": "Frequently asked questions",
  "faq": [
    ["Is it an MR2 or an MR-S?", "Toyota MR-S is the Japanese-market version of the third-generation Toyota MR2. In some markets, it was called the MR2 Spyder."],
    ["Is it really mid-engine?", "Yes. The engine is located behind the seats, in front of the rear axle."],
    ["Why was the transmission swapped to manual?", "A classic manual gearbox is simpler, more reliable, and gives more control behind the wheel."],
    ["What are donations used for?", "For buying and installing a new soft top."],
    ["Can I take a photo of the car?", "Of course! Just please do not touch the body, soft top, windows, or interior."],
    ["Can I contact the owner?", "Yes, the contact is below. Telegram is the best way."]
  ],
  "contactTitle": "Saw the MR-S on the street?",
  "contactText": "Thanks for visiting the page. If you want to send a photo, ask a question, or just say hi, you can message me on Telegram.",
  "telegramLabel": "Message the owner of Zheltik on Telegram",
  "qrTitle": "Text for the windshield sign",
  "qrText": "Hi! I am a Toyota MR-S 2000.\n\nA yellow mid-engine roadster,\nconverted from sequential transmission to manual.\n\nScan the QR:\nâ€” car story\nâ€” photos and modifications\nâ€” fundraiser for a new soft top\n\nPlease do not touch the car :)",
  "footerText": "A yellow mid-engine roadster with a manual gearbox.",
  "footerNote": "Made with love for small Japanese cars."
}

~~~


## Файл: src\locales\zh.json

~~~json
{
  "lang": "zh-CN",
  "locale": "zh_CN",
  "canonical": "https://mrs.spb.ru/zh/",
  "assetPrefix": "../",
  "title": "Zheltik â€” Toyota MR-S 2000",
  "description": "ä¸€è¾†é»„è‰² 2000 å¹´ Toyota MR-S çš„æ•…äº‹ï¼šä¸­ç½®å‘åŠ¨æœºæ•žç¯·è·‘è½¦ï¼Œå·²ä»Žåºåˆ—å¼å˜é€Ÿç®±æ”¹ä¸ºæ‰‹åŠ¨å˜é€Ÿç®±ï¼Œå¹¶ä¸ºæ›´æ¢æ–°è½¯é¡¶ç­¹æ¬¾ã€‚",
  "ogDescription": "ä¸€è¾†é»„è‰²ä¸­ç½®å‘åŠ¨æœº Toyota MR-S 2000ã€‚é¡¹ç›®æ•…äº‹ä»¥åŠæ›´æ¢æ–°è½¯é¡¶çš„ç­¹æ¬¾é¡µé¢ã€‚",
  "twitterDescription": "ä¸€è¾†é»„è‰² 2000 å¹´ Toyota MR-S çš„æ•…äº‹ï¼Œä»¥åŠæ›´æ¢æ–°è½¯é¡¶çš„ç­¹æ¬¾ã€‚",
  "imageAlt": "é»„è‰² Toyota MR-S 2000",
  "brand": "Zheltik",
  "brandLabel": "Zheltik â€” è¿”å›žé¡µé¢é¡¶éƒ¨",
  "navLabel": "ä¸»èœå•",
  "langLabel": "é€‰æ‹©è¯­è¨€",
  "langRuUrl": "../",
  "langEnUrl": "../en/",
  "langZhUrl": "index.html",
  "navAbout": "è½¦è¾†",
  "navStory": "æ•…äº‹",
  "navMods": "æ”¹è£…",
  "navPhotos": "ç…§ç‰‡",
  "navFaq": "FAQ",
  "navContact": "è”ç³»",
  "navSupport": "æ”¯æŒ",
  "heroTitle": "Zheltik",
  "heroText": "ä½ å¥½ï¼å¦‚æžœä½ åœ¨è¡—ä¸Šçœ‹åˆ°äº†è¿™è¾†è½¦å¹¶æ‰«æäº†äºŒç»´ç ï¼Œæ¬¢è¿Žæ¥åˆ°è¿™è¾†é»„è‰² Toyota MR-S çš„é¡µé¢ã€‚è¿™æ˜¯ä¸€è¾†è½»é‡åŒ–ä¸­ç½®å‘åŠ¨æœºæ•žç¯·è·‘è½¦ï¼Œå·²ç»ä»Žåºåˆ—å¼å˜é€Ÿç®±æ”¹ä¸ºç»å…¸æ‰‹åŠ¨å˜é€Ÿç®±ã€‚",
  "heroDonateButton": "æ”¯æŒæ›´æ¢æ–°è½¯é¡¶",
  "heroStoryButton": "è½¦è¾†æ•…äº‹",
  "heroGalleryButton": "æŸ¥çœ‹ç…§ç‰‡",
  "heroStats": [
    ["2000", "ç”Ÿäº§å¹´ä»½"],
    ["MR-S", "MR2 Spyder çš„æ—¥æœ¬ç‰ˆ"],
    ["Midship", "å‘åŠ¨æœºä½äºŽåº§æ¤…åŽæ–¹"],
    ["Manual", "å·²æ”¹ä¸ºæ‰‹åŠ¨å˜é€Ÿç®±"]
  ],
  "aboutPill": "å…³äºŽè¿™è¾†è½¦",
  "aboutTitle": "å°å·§ã€é»„è‰²ï¼Œè€Œä¸”å¾ˆçœŸå®ž",
  "aboutText": [
    "è¿™æ˜¯ä¸€è¾† 2000 å¹´ Toyota MR-Sï¼Œä¸€æ¬¾ç´§å‡‘çš„æ—¥æœ¬æ•žç¯·è·‘è½¦ï¼Œå‘åŠ¨æœºä½äºŽåº§æ¤…åŽæ–¹ã€‚åœ¨å…¶ä»–å¸‚åœºï¼Œè¿™æ¬¾è½¦è¢«ç§°ä¸º Toyota MR2 Spyderã€‚",
    "è¿™è¾†è½¦çš„é­…åŠ›åœ¨äºŽå¹³è¡¡ã€‚å®ƒå¾ˆè½»ã€å¾ˆä½Žã€åŽè½®é©±åŠ¨ï¼Œå¹¶é‡‡ç”¨ä¸­ç½®å‘åŠ¨æœºå¸ƒå±€ã€‚ä¸¤ä¸ªåº§ä½ã€æ•žç¯·ã€æ‰‹åŠ¨å˜é€Ÿç®±ï¼Œè®©å®ƒæ›´åƒæ˜¯ä¸ºé©¾é©¶æƒ…ç»ªè€Œç”Ÿï¼Œè€Œä¸æ˜¯ä¸ºå‚æ•°è¡¨è€Œç”Ÿã€‚",
    "è¿™è¾†è½¦æœ€åˆé…å¤‡åºåˆ—å¼å˜é€Ÿç®±ï¼ŒåŽæ¥æ”¹ä¸ºç»å…¸æ‰‹åŠ¨å˜é€Ÿç®±ã€‚è¿™æ ·å®ƒå˜å¾—æ›´ç®€å•ã€æ›´å¯é ï¼Œä¹Ÿæ›´æœ‰é©¾é©¶å‚ä¸Žæ„Ÿã€‚"
  ],
  "specsTitle": "è§„æ ¼",
  "specsNote": "",
  "specs": [
    ["å“ç‰Œ", "Toyota"],
    ["åž‹å·", "MR-S / MR2 Spyder"],
    ["å¹´ä»½", "2000"],
    ["é¢œè‰²", "é»„è‰²"],
    ["è½¦èº«", "æ•žç¯·è·‘è½¦"],
    ["å¸ƒå±€", "ä¸­ç½®å‘åŠ¨æœº"],
    ["é©±åŠ¨", "åŽè½®é©±åŠ¨"],
    ["å˜é€Ÿç®±", "æ‰‹åŠ¨ï¼Œç”±åºåˆ—å¼æ”¹è£…"],
    ["å‘åŠ¨æœº", "1ZZ-FEï¼Œ1.8 å‡"],
    ["åŠŸçŽ‡", "çº¦ 140 é©¬åŠ›"],
    ["é‡é‡", "çº¦ 970 å…¬æ–¤"]
  ],
  "storyPill": "é¡¹ç›®æ•…äº‹",
  "storyTitle": "ä¸ºä»€ä¹ˆæ˜¯ MR-Sï¼Ÿ",
  "storyText": "è¿™è¾†è½¦å¾ˆæœ‰æ€§æ ¼ã€‚å®ƒä¸æ˜¯æœ€å¿«çš„ï¼Œä¸æ˜¯æœ€å®žç”¨çš„ï¼Œä¹Ÿç»å¯¹ä¸æ˜¯æœ€æ–°çš„ã€‚ä½†å®ƒæ‹¥æœ‰è€æ—¥æœ¬è½¦è®©äººç€è¿·çš„ä¸œè¥¿ï¼šè½»å·§ã€ç®€å•ã€çœŸå®žçš„æœºæ¢°æ„Ÿï¼Œä»¥åŠä¸€è¾†â€œæ´»ç€â€çš„è½¦çš„æ„Ÿè§‰ã€‚",
  "timeline": [
    ["2000", "è¿™è¾†è½¦åœ¨æ—¥æœ¬ä»¥ Toyota MR-S çš„åå­—ç”Ÿäº§ï¼Œæ˜¯ç¬¬ä¸‰ä»£ MR2ã€‚"],
    ["åœ¨æˆ‘ä¹‹å‰", "è¿™è¾†è½¦ç»åŽ†äº†å¤šå¹´çš„ä½¿ç”¨ï¼Œå¹¶å®Œæˆäº†ä¸€ä¸ªé‡è¦å˜åŒ–ï¼šä»Žåºåˆ—å¼å˜é€Ÿç®±æ”¹ä¸ºæ‰‹åŠ¨å˜é€Ÿç®±ã€‚"],
    ["æ—…è¡Œ", "å®ƒä»Žæ—¥æœ¬æ¥åˆ°å¶å¡æ·ç³å ¡ï¼Œä¹‹åŽåˆå¼€åˆ°åœ£å½¼å¾—å ¡ï¼Œå¹¶åŽ»è¿‡èŠ¬å…°ã€ç™½ä¿„ç½—æ–¯ã€ç»´å ¡ã€æ™®æ–¯ç§‘å¤«å’Œå¤§è¯ºå¤«å“¥ç½—å¾·ã€‚"],
    ["çŽ°åœ¨", "æˆ‘æ­£åœ¨é€æ­¥ç»´æŠ¤å’Œæ•´ç†è¿™è¾†è½¦ï¼ŒåŒæ—¶å°½é‡ä¿ç•™å®ƒåŽŸæœ¬çš„æ€§æ ¼ã€‚"],
    ["ä¸‹ä¸€æ­¥", "æœ€è¿‘çš„ä¸»è¦ç›®æ ‡æ˜¯æ›´æ¢è½¯é¡¶ã€‚æ–°çš„è½¯é¡¶ä¼šè®©è½¦çœ‹èµ·æ¥æ›´æ•´æ´ï¼Œä¹Ÿèƒ½æ›´å¥½åœ°ä¿æŠ¤å†…é¥°ã€‚"]
  ],
  "modsPill": "å·²ç»å®Œæˆ",
  "modsTitle": "æ”¹è£…ä¸Žç»´æŠ¤",
  "modsText": "è¿™ä¸ªé¡¹ç›®ä¸æ˜¯ç–¯ç‹‚æ”¹è£…ï¼Œè€Œæ˜¯è®©ä¸€è¾†æœ‰ç”Ÿå‘½åŠ›ã€å¥½å¼€çš„è½¦ç»§ç»­ä¿æŒè‰¯å¥½çŠ¶æ€ã€‚",
  "mods": [
    ["âš™ï¸", "æ‰‹åŠ¨å˜é€Ÿç®±æ”¹è£…", "è½¦è¾†å·²ç»ä»Žåºåˆ—å¼å˜é€Ÿç®±æ”¹ä¸ºç»å…¸æ‰‹åŠ¨å˜é€Ÿç®±ã€‚"],
    ["ðŸ› ï¸", "ç»´æŠ¤ä¿å…»", "æ²¹æ¶²ã€æ¶ˆè€—ä»¶ã€æ‚¬æŒ‚ã€åˆ¹è½¦å’Œå…¶ä»–æŠ€æœ¯éƒ¨ä»¶æ­£åœ¨é€æ­¥æ•´ç†ã€‚"],
    ["â˜€ï¸", "å¤–è§‚", "ç›®å‰æœ€ä¸»è¦çš„å¤–è§‚ä»»åŠ¡æ˜¯æ›´æ¢æ–°çš„è½¯é¡¶ã€‚"]
  ],
  "donatePill": "è½¯é¡¶ç­¹æ¬¾",
  "donateTitle": "å¸®åŠ© MR-S æ¢ä¸Šæ–°çš„è½¯é¡¶",
  "donateText": [
    "ç›®å‰çš„è½¯é¡¶å·²ç»è€åŒ–ï¼šå¸ƒæ–™å¤–è§‚å˜å·®ï¼Œä¹Ÿå‡ºçŽ°äº†ç£¨æŸç—•è¿¹ã€‚å¯¹æ•žç¯·è·‘è½¦æ¥è¯´ï¼Œè½¦é¡¶ä¸ä»…æ˜¯ä¸€ä¸ªé›¶ä»¶ï¼Œä¹Ÿæ˜¯å¤–è§‚å’Œä¿æŠ¤å†…é¥°çš„é‡è¦éƒ¨åˆ†ã€‚",
    "å¦‚æžœä½ å–œæ¬¢è¿™è¾†è½¦æˆ–è¿™ä¸ªé¡¹ç›®æ•…äº‹ï¼Œå¯ä»¥è‡ªæ„¿æ”¯æŒä¸€ä¸‹ã€‚ä»»ä½•é‡‘é¢éƒ½ä¼šè®© MR-S ç¦»æ›´æ–°æ›´è¿‘ä¸€æ­¥ã€‚"
  ],
  "raisedLabel": "å·²ç­¹é›†",
  "goalLabel": "ç›®æ ‡",
  "donateCloudtipsText": "ä½¿ç”¨ä¿„ç½—æ–¯é“¶è¡Œå¡æ”¯æŒ",
  "donateBoostyText": "ä½¿ç”¨å›½é™…é“¶è¡Œå¡æ”¯æŒ",
  "donateCloudtipsLabel": "æ‰“å¼€ CloudTipsï¼Œä½¿ç”¨ä¿„ç½—æ–¯é“¶è¡Œå¡æ”¯æŒ",
  "donateBoostyLabel": "æ‰“å¼€ Boostyï¼Œä½¿ç”¨å›½é™…é“¶è¡Œå¡æ”¯æŒ",
  "donateNote": "æåŠ©æ˜¯å¯¹æ±½è½¦é¡¹ç›®çš„è‡ªæ„¿ä¸ªäººæ”¯æŒï¼Œä¸æ˜¯è´­ä¹°å•†å“æˆ–æœåŠ¡ã€‚",
  "costsTitle": "èµ„é‡‘ç”¨é€”",
  "costs": [
    ["æ–°çš„è½¯é¡¶", "80,000 â‚½"],
    ["è¿è¾“ / å›ºå®šä»¶ / å°é›¶ä»¶", "25,000 â‚½"],
    ["å®‰è£…", "15,000 â‚½"],
    ["æ€»è®¡", "120,000 â‚½"]
  ],
  "costsText": "æˆ‘ä¼šæ›´æ–°ç­¹æ¬¾è¿›åº¦ï¼Œå¹¶åœ¨è´­ä¹°åŽå±•ç¤ºç»“æžœã€‚",
  "lastUpdateLabel": "æœ€åŽæ›´æ–°ï¼š",
  "galleryPill": "ç…§ç‰‡",
  "galleryTitle": "ä¸€äº›ç…§ç‰‡",
  "galleryText": "è¿™é‡Œå¯ä»¥çœ‹åˆ°è½¦è¾†çš„ä¸åŒè§’åº¦ï¼šå¤–è§‚ã€å†…é¥°ã€æ‰‹åŠ¨æŒ¡æ†ã€è½¯é¡¶å’Œé¡¹ç›®ç»†èŠ‚ã€‚",
  "galleryAlts": [
    "é»„è‰² Toyota MR-S æ­£é¢",
    "Toyota MR-S ä¾§é¢",
    "Toyota MR-S åŽæ–¹",
    "Toyota MR-S å†…é¥°",
    "Toyota MR-S æ‰‹åŠ¨å˜é€Ÿç®±",
    "Toyota MR-S è½¯é¡¶",
    "Toyota MR-S é¡¹ç›®ç»†èŠ‚"
  ],
  "faqTitle": "å¸¸è§é—®é¢˜",
  "faq": [
    ["è¿™æ˜¯ MR2 è¿˜æ˜¯ MR-Sï¼Ÿ", "Toyota MR-S æ˜¯ç¬¬ä¸‰ä»£ Toyota MR2 çš„æ—¥æœ¬å¸‚åœºç‰ˆæœ¬ã€‚åœ¨ä¸€äº›å¸‚åœºï¼Œå®ƒè¢«ç§°ä¸º MR2 Spyderã€‚"],
    ["å®ƒçœŸçš„æ˜¯ä¸­ç½®å‘åŠ¨æœºå—ï¼Ÿ", "æ˜¯çš„ã€‚å‘åŠ¨æœºä½äºŽåº§æ¤…åŽæ–¹ã€åŽè½´å‰æ–¹ã€‚"],
    ["ä¸ºä»€ä¹ˆæ”¹æˆæ‰‹åŠ¨å˜é€Ÿç®±ï¼Ÿ", "ç»å…¸æ‰‹åŠ¨å˜é€Ÿç®±æ›´ç®€å•ã€æ›´å¯é ï¼Œä¹Ÿèƒ½ç»™é©¾é©¶è€…æ›´å¤šæŽ§åˆ¶æ„Ÿã€‚"],
    ["æåŠ©ä¼šç”¨åœ¨å“ªé‡Œï¼Ÿ", "ç”¨äºŽè´­ä¹°å’Œå®‰è£…æ–°çš„è½¯é¡¶ã€‚"],
    ["å¯ä»¥ç»™è¿™è¾†è½¦æ‹ç…§å—ï¼Ÿ", "å½“ç„¶å¯ä»¥ï¼ä½†è¯·ä¸è¦è§¦ç¢°è½¦èº«ã€è½¯é¡¶ã€çŽ»ç’ƒå’Œå†…é¥°ã€‚"],
    ["å¯ä»¥è”ç³»è½¦ä¸»å—ï¼Ÿ", "å¯ä»¥ï¼Œè”ç³»æ–¹å¼åœ¨ä¸‹é¢ã€‚æœ€å¥½é€šè¿‡ Telegram è”ç³»ã€‚"]
  ],
  "contactTitle": "åœ¨è¡—ä¸Šçœ‹åˆ°äº† MR-Sï¼Ÿ",
  "contactText": "è°¢è°¢ä½ æ¥åˆ°è¿™ä¸ªé¡µé¢ã€‚å¦‚æžœä½ æƒ³å‘é€ç…§ç‰‡ã€æå‡ºé—®é¢˜ï¼Œæˆ–è€…åªæ˜¯æ‰“ä¸ªæ‹›å‘¼ï¼Œå¯ä»¥é€šè¿‡ Telegram è”ç³»æˆ‘ã€‚",
  "telegramLabel": "é€šè¿‡ Telegram è”ç³» Zheltik çš„è½¦ä¸»",
  "qrTitle": "æŒ¡é£ŽçŽ»ç’ƒä¸‹æ–¹å°ç‰Œå­çš„æ–‡å­—",
  "qrText": "ä½ å¥½ï¼æˆ‘æ˜¯ä¸€è¾† Toyota MR-S 2000ã€‚\n\né»„è‰²ä¸­ç½®å‘åŠ¨æœºæ•žç¯·è·‘è½¦ï¼Œ\nå·²ä»Žåºåˆ—å¼å˜é€Ÿç®±æ”¹ä¸ºæ‰‹åŠ¨å˜é€Ÿç®±ã€‚\n\næ‰«æäºŒç»´ç ï¼š\nâ€” è½¦è¾†æ•…äº‹\nâ€” ç…§ç‰‡å’Œæ”¹è£…\nâ€” æ›´æ¢æ–°è½¯é¡¶çš„ç­¹æ¬¾\n\nè¯·ä¸è¦è§¦ç¢°è½¦è¾† :)",
  "footerText": "ä¸€è¾†é»„è‰²ä¸­ç½®å‘åŠ¨æœºæ‰‹åŠ¨æ•žç¯·è·‘è½¦ã€‚",
  "footerNote": "çŒ®ç»™å°åž‹æ—¥æœ¬è½¦çš„çƒ­çˆ±ã€‚"
}

~~~


## Файл: CNAME

~~~text
mrs.spb.ru
~~~


---

## Дополнительная проверка

После изменения src/template.html или файлов локалей нужно запускать:

    node src/build.js

После сборки проверить:

- index.html
- en/index.html
- zh/index.html

Проверка остатков qr-sign / undefined:

    Select-String -Path "src\template.html","index.html","en\index.html","zh\index.html" -Pattern "qr-sign|qrTitle|qrText|undefined"

