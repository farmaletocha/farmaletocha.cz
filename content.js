const fruitKeys = ["apples", "apricots", "blackcurrants", "plums"];

const fruitColors = {
  apples: "apple",
  apricots: "apricot",
  plums: "plum",
  blackcurrants: "currant"
};

let contactDetails = null;

const getContactDetails = () => contactDetails;

const getSalesEmail = (contact) => contact.sales_email ?? contact.email;

const getEmailLink = (contact, sales = false, subject = "") => {
  const address = sales ? getSalesEmail(contact) : contact.email;
  const name = sales ? "Farma Letocha – prodej" : "Farma Letocha";
  const subjectHeader = subject ? `&subject=${encodeURIComponent(subject)}` : "";
  return `mailto:?to=${encodeURIComponent(`"${name}" <${address}>`)}${subjectHeader}`;
};

const hasText = (value) => typeof value === "string" && /[^\s.,]/u.test(value);

const setText = (element, value) => {
  if (!element) return;
  element.hidden = !hasText(value);
  element.textContent = element.hidden ? "" : value;
};

const createElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) setText(element, text);
  return element;
};

const formatPhone = (phone) => phone.startsWith("+420") && phone.length === 13
  ? phone.slice(4).replace(/(\d{3})(?=\d)/g, "$1 ")
  : phone;

const check = (condition, message) => {
  if (!condition) throw new Error(message);
};

const checkText = (value, path) => {
  check(hasText(value), `Missing text: ${path}`);
};

const checkOptionalText = (value, path) => {
  check(value == null || typeof value === "string", `Invalid text: ${path}`);
};

const checkFields = (object, fields, path, validate = checkText) => {
  check(object && typeof object === "object" && !Array.isArray(object), `Invalid object: ${path}`);
  fields.forEach((field) => validate(object[field], `${path}.${field}`));
};

const isMonth = (value) => /^(?:[1-9]|1[0-2])$/.test(String(value));

const isEmail = (value) => typeof value === "string" && /^[^\s@<>?&#]+@[^\s@<>?&#]+\.[^\s@<>?&#]+$/.test(value);

const validateOperator = (operator) => {
  checkFields(operator, ["name", "ico", "registered_address", "registration", "privacy_email"], "operator");
  check(/^\d{8}$/.test(operator.ico), "Invalid operator ICO");
  check(isEmail(operator.privacy_email), "Invalid privacy email");
  return operator;
};

const faqLinkTargets = new Set(["#farma", "#ovoce", "#med", "#stromky", "#samosber", "#prijezd", "#kontakt"]);

const faqGroups = new Map([
  ["sales", "Ovoce a prodej"],
  ["picking", "Samosběr a termíny"],
  ["visit", "Příjezd a zázemí"]
]);

const parseFaqLinks = (answer) => [...answer.matchAll(/\[([^\]\r\n]+)\]\(([^)\s]+)\)/g)].map((match) => {
  checkText(match[1], "FAQ link text");
  check(faqLinkTargets.has(match[2]), `Unsupported FAQ link: ${match[2]}`);
  return match;
});

const validateWeb = (data) => {
  checkFields(data?.contact, ["name", "phone", "email", "locality", "address", "postal_code"], "contact");
  checkFields(data.contact, ["location_text", "directions"], "contact", checkOptionalText);
  check(/^\+[1-9]\d{6,14}$/.test(data.contact.phone), "Invalid contact phone");
  check(isEmail(data.contact.email), "Invalid contact email");
  if (data.contact.sales_email !== undefined) {
    check(isEmail(data.contact.sales_email), "Invalid sales email");
  }
  validateOperator(data.operator);
  check(Number.isFinite(data.contact.latitude) && Math.abs(data.contact.latitude) <= 90, "Invalid map latitude");
  check(Number.isFinite(data.contact.longitude) && Math.abs(data.contact.longitude) <= 180, "Invalid map longitude");
  checkFields(data.intro, ["location", "title", "subtitle", "description"], "intro", checkOptionalText);
  check(typeof data.intro.rotate_fruit === "boolean", "Invalid fruit rotation setting");
  checkFields(data.story, ["title", "lead", "description"], "story", checkOptionalText);
  checkFields(data.trees, ["title", "description"], "trees", checkOptionalText);
  checkFields(data.honey, ["title", "description"], "honey", checkOptionalText);
  fruitKeys.forEach((key) => {
    const fruit = data.fruit?.[key];
    checkFields(fruit, ["name", "season", "description", "hero_title", "hero_description"], `fruit.${key}`, checkOptionalText);
    check(Array.isArray(fruit.months) && fruit.months.every(isMonth), `Invalid season months: ${key}`);
    if (fruit.varieties != null) {
      check(Array.isArray(fruit.varieties), `Invalid fruit varieties: ${key}`);
      fruit.varieties.forEach((value) => checkOptionalText(value, `fruit.${key}.varieties`));
    }
  });
  check(data.calendar == null || Array.isArray(data.calendar), "Invalid calendar");
  const months = new Set();
  (data.calendar ?? []).forEach((month) => {
    checkFields(month, ["title", "description"], "calendar", checkOptionalText);
    check(isMonth(month.month) && !months.has(Number(month.month)), "Invalid or repeated calendar month");
    months.add(Number(month.month));
    check(Array.isArray(month.fruits) && month.fruits.every((key) => fruitKeys.includes(key)), "Invalid calendar fruit");
  });
  return data;
};

const validateOffer = (data) => {
  checkFields(data, ["title", "off_season_title", "price_subject", "price", "unit", "price_note", "hours", "arrangement"], "offer", checkOptionalText);
  check(typeof data.enabled === "boolean", "Invalid offer visibility");
  check(data.season_active === undefined || typeof data.season_active === "boolean", "Invalid sales season");
  check(data.varieties == null || Array.isArray(data.varieties), "Invalid offer varieties");
  (data.varieties ?? []).forEach((item) => {
    checkFields(item, ["name", "status", "description"], "offer variety", checkOptionalText);
    check(typeof item.sold_out === "boolean", "Invalid sold-out state");
  });
  return data;
};

const validateFaq = (data) => {
  checkFields(data, [], "FAQ");
  check(data.items == null || Array.isArray(data.items), "Invalid FAQ list");
  (data.items ?? []).forEach((item) => {
    checkFields(item, ["question"], "FAQ", checkOptionalText);
    check(typeof item.visible === "boolean", "Invalid FAQ visibility");
    check(faqGroups.has(item.group), "Invalid FAQ group");
    check(["text", "availability", "sales"].includes(item.answer_source), "Invalid FAQ answer source");
    if (item.answer_source === "text") {
      checkOptionalText(item.answer, "FAQ answer");
      if (hasText(item.answer)) parseFaqLinks(item.answer);
    }
  });
  return data;
};

const loadJson = async (filename, validate) => {
  const response = await fetch(`data/${filename}.json`, { cache: "no-store" });
  if (!response.ok) throw new Error(`${filename}: HTTP ${response.status}`);
  return validate(await response.json());
};

const bindContact = (contact) => {
  const emailFor = (element) => element.closest("[data-sales-email]") ? getSalesEmail(contact) : contact.email;
  document.querySelectorAll('a[href^="tel:"], a[data-phone-link]').forEach((link) => {
    link.dataset.phoneLink = "";
    if (contact) {
      link.href = `tel:${contact.phone}`;
      link.removeAttribute("aria-disabled");
    } else {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
    }
  });
  document.querySelectorAll('a[href^="mailto:"], a[data-email-link]').forEach((link) => {
    link.dataset.emailLink = "";
    if (contact) {
      const sales = Boolean(link.closest("[data-sales-email]"));
      const subject = link.dataset.emailSubject ??
        (sales ? "Dotaz na prodej a samosběr" : "Dotaz na Farmu Letocha");
      link.href = getEmailLink(contact, sales, subject);
      link.removeAttribute("aria-disabled");
    } else {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
    }
  });
  document.querySelectorAll("[data-phone-text]").forEach((element) => {
    element.textContent = contact ? formatPhone(contact.phone) : "Telefon není dostupný";
  });
  document.querySelectorAll("[data-email-text]").forEach((element) => {
    element.textContent = contact ? emailFor(element) : "E-mail není dostupný";
  });
  const form = document.querySelector("[data-reservation-form]");
  if (form) {
    if (contact) form.action = getEmailLink(contact, true, "Žádost o samosběr");
    else form.removeAttribute("action");
    form.querySelector('[type="submit"]').disabled = !contact;
  }
};

const bindWebCopy = (data) => {
  document.querySelectorAll("[data-copy]").forEach((element) => {
    const value = element.dataset.copy.split(".").reduce((value, key) => value?.[key], data);
    checkOptionalText(value, element.dataset.copy);
    setText(element, value);
  });
  document.querySelectorAll("[data-copy-group]").forEach((group) => {
    group.hidden = [...group.querySelectorAll("[data-copy]")].every((element) => element.hidden);
    group.querySelectorAll(":scope > br").forEach((separator) => {
      separator.hidden = [...group.querySelectorAll(":scope > [data-copy]")].some((element) => element.hidden);
    });
  });
};

const syncSectionLinks = () => {
  document.querySelectorAll('a[href^="#"], a[data-section-target]').forEach((link) => {
    const href = link.dataset.sectionTarget ?? link.getAttribute("href");
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    const hidden = Boolean(target.closest("[hidden]"));
    if (link.closest("[data-faq-list]")) {
      if (hidden) {
        link.dataset.sectionTarget = href;
        link.removeAttribute("href");
      } else {
        link.href = href;
        delete link.dataset.sectionTarget;
      }
    } else {
      link.hidden = hidden;
    }
  });
};

const updateProduceVisibility = () => {
  const section = document.querySelector("#ovoce");
  section.hidden = [...section.querySelectorAll("[data-current-offer], [data-fruit], .product-offer")]
    .every((element) => element.hidden);
  syncSectionLinks();
};

const renderWeb = (data) => {
  bindWebCopy(data);
  contactDetails = data.contact;
  bindContact(contactDetails);
  const { latitude, longitude } = data.contact;
  const coordinates = `${latitude},${longitude}`;
  document.querySelector("[data-map-link]").href =
    `https://mapy.com/cs/zakladni?source=coor&id=${encodeURIComponent(`${longitude},${latitude}`)}&x=${longitude}&y=${latitude}&z=17`;
  document.querySelectorAll("[data-navigation-link]").forEach((link) => {
    link.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coordinates)}&travelmode=driving`;
  });
  const frame = document.querySelector("[data-map-frame]");
  frame.src = `https://www.google.com/maps?q=${encodeURIComponent(coordinates)}&z=15&hl=cs&output=embed`;
  frame.title = `Mapa: Farma Letocha, ${data.contact.address}`;
  document.querySelector("[data-map-panel]").hidden = false;
  const currentMonth = new Date().getMonth() + 1;
  fruitKeys.forEach((key) => {
    const fruit = data.fruit[key];
    const card = document.querySelector(`[data-fruit="${key}"]`);
    setText(card.querySelector("h3"), fruit.name);
    setText(card.querySelector("[data-fruit-description]"), fruit.description);
    const names = (fruit.varieties ?? []).filter(hasText);
    const varieties = card.querySelector("[data-fruit-varieties], [data-apple-varieties]");
    if (varieties) {
      varieties.replaceChildren(...names.map((name) => createElement("li", "", name)));
      varieties.hidden = names.length === 0;
    }
    const chip = card.querySelector(".season-chip");
    setText(chip, fruit.season);
    chip.closest(".produce-card__topline").hidden = chip.hidden;
    chip.dataset.months = fruit.months.join(",");
    chip.classList.toggle("is-current", fruit.months.map(Number).includes(currentMonth));
    card.hidden = ![fruit.name, fruit.description, fruit.season].some(hasText) && !names.length;
    const slide = document.querySelector(`[data-hero-slide="${key}"]`);
    slide.dataset.title = hasText(fruit.hero_title) ? fruit.hero_title : "";
    slide.dataset.description = hasText(fruit.hero_description) ? fruit.hero_description : "";
    slide.dataset.name = hasText(fruit.name) ? fruit.name : "";
    const control = document.querySelector(`[data-hero-select="${key}"]`);
    control.setAttribute("aria-label", hasText(fruit.name) ? `Zobrazit: ${fruit.name}` : "Zobrazit fotografii ovoce");
  });
  const entries = (data.calendar ?? []).filter((entry) => [entry.title, entry.description].some(hasText) ||
    entry.fruits.some((key) => hasText(data.fruit[key].name)));
  const calendar = document.querySelector("[data-calendar]");
  calendar.replaceChildren(...entries.map((entry) => {
    const month = Number(entry.month);
    const article = createElement("article", "calendar__month");
    article.dataset.month = String(month);
    article.classList.toggle("is-current", month === currentMonth);
    const text = createElement("div");
    const monthName = new Intl.DateTimeFormat("cs-CZ", { month: "long", timeZone: "UTC" })
      .format(new Date(Date.UTC(2026, month - 1, 1)));
    const fruits = createElement("div", "calendar__fruit");
    entry.fruits.filter((key) => hasText(data.fruit[key].name)).forEach((key) => {
      fruits.append(
        createElement("span", `dot dot--${fruitColors[key]}`),
        document.createTextNode(` ${data.fruit[key].name} `)
      );
    });
    fruits.hidden = fruits.childElementCount === 0;
    text.append(
      createElement("span", "calendar__name", monthName.charAt(0).toUpperCase() + monthName.slice(1)),
      createElement("h3", "", entry.title ?? ""),
      createElement("p", "", entry.description ?? ""),
      fruits
    );
    article.append(createElement("div", "calendar__number", String(month).padStart(2, "0")), text);
    return article;
  }));
  const hasCalendar = entries.length > 0;
  document.querySelector("#sezona").hidden = !hasCalendar;
  updateProduceVisibility();
};

const isSalesSeason = (data) => data.season_active !== false;

const hasOfferPrice = (data) => isSalesSeason(data) && hasText(data.price) && hasText(data.price_subject);

const renderOffer = (data) => {
  const seasonActive = isSalesSeason(data);
  const title = seasonActive ? data.title : data.off_season_title;
  const priceNote = seasonActive ? data.price_note : "";
  const labelText = seasonActive ? "Aktuální nabídka" : "Mimo sezonu";
  document.querySelectorAll("[data-sale-hours]").forEach((element) => {
    setText(element, seasonActive ? data.hours : "");
  });
  document.querySelectorAll("[data-sale-arrangement]").forEach((element) => {
    setText(element, seasonActive ? data.arrangement : "");
  });
  const hasHours = seasonActive && hasText(data.hours);
  const hasArrangement = seasonActive && hasText(data.arrangement);
  document.querySelectorAll(".hero__note").forEach((note) => {
    note.hidden = !hasHours && !hasArrangement;
    note.querySelector("br").hidden = !hasHours || !hasArrangement;
  });
  const items = (data.varieties ?? []).filter((item) => hasText(item.name));
  const hasPrice = hasOfferPrice(data);
  const hasSummary = [title, priceNote].some(hasText) || hasPrice || hasHours || hasArrangement;
  const panel = document.querySelector("[data-current-offer]");
  panel.hidden = !data.enabled || (!hasSummary && !items.length);
  panel.replaceChildren();
  if (panel.hidden) {
    updateProduceVisibility();
    return;
  }
  panel.toggleAttribute("aria-labelledby", hasSummary);
  if (hasSummary) {
    panel.setAttribute("aria-labelledby", "aktualni-nabidka-nadpis");
    panel.removeAttribute("aria-label");
  } else {
    panel.setAttribute("aria-label", labelText);
  }
  const summary = createElement("div", "current-offer__summary");
  const label = createElement("p", "eyebrow", labelText);
  const heading = createElement("h3", "", title ?? "");
  (hasText(title) ? heading : label).id = "aktualni-nabidka-nadpis";
  summary.append(label, heading);
  if (hasPrice) {
    const price = createElement("p", "current-offer__price", `${data.price}${hasText(data.unit) ? " " : ""}`);
    if (hasText(data.unit)) price.append(createElement("span", "", data.unit));
    price.setAttribute("aria-label", `${data.price_subject}: ${[data.price, data.unit].filter(hasText).join(" ")}`);
    summary.append(price);
  }
  if (hasText(priceNote)) summary.append(createElement("p", "", priceNote));
  if (hasHours || hasArrangement || (hasPrice && contactDetails)) {
    const hours = createElement("p", "current-offer__hours");
    if (hasHours) hours.append(createElement("strong", "", data.hours));
    if (hasHours && (hasArrangement || contactDetails)) hours.append(createElement("br"));
    if (hasArrangement) hours.append(document.createTextNode(data.arrangement));
    if (contactDetails) {
      const email = createElement("a", "", getSalesEmail(contactDetails));
      email.dataset.salesEmail = "";
      email.dataset.emailSubject = hasText(data.price_subject)
        ? `Objednávka – ${data.price_subject}` : "Dotaz na aktuální nabídku ovoce";
      email.href = getEmailLink(contactDetails, true, email.dataset.emailSubject);
      hours.append(document.createTextNode(" "), email);
    }
    summary.append(hours);
  }
  const varieties = createElement("dl", "current-offer__varieties");
  items.forEach((item) => {
    const row = createElement("div");
    const name = createElement("dt", "", `${item.name} `);
    if (hasText(item.status)) name.append(createElement("span", item.sold_out ? "current-offer__sold-out" : "", item.status));
    row.append(name);
    if (seasonActive && hasText(item.description)) row.append(createElement("dd", "", item.description));
    varieties.append(row);
  });
  if (hasSummary) panel.append(summary);
  if (items.length) panel.append(varieties);
  updateProduceVisibility();
};

const sentence = (text) => /[.!?]$/.test(text) ? text : `${text}.`;

const createFaqAnswer = (answer) => {
  const paragraph = createElement("p");
  let offset = 0;
  for (const match of parseFaqLinks(answer)) {
    paragraph.append(document.createTextNode(answer.slice(offset, match.index)));
    const link = createElement("a", "", match[1]);
    link.href = match[2];
    paragraph.append(link);
    offset = match.index + match[0].length;
  }
  paragraph.append(document.createTextNode(answer.slice(offset)));
  return paragraph;
};

const renderFaq = (data, offer) => {
  const list = document.querySelector("[data-faq-list]");
  const questions = [];
  let missingOffer = false;
  (data.items ?? []).filter((item) => item.visible && hasText(item.question)).forEach((item) => {
    let answer = item.answer;
    if (item.answer_source !== "text") {
      if (!offer) {
        missingOffer = true;
        return;
      }
      if (!isSalesSeason(offer)) return;
      if (item.answer_source === "availability") {
        if (!offer.enabled) return;
        answer = (offer.varieties ?? []).filter((variety) => hasText(variety.name) && hasText(variety.status))
          .map((variety) => sentence(`${variety.name}: ${variety.status}`)).join(" ");
        if (!answer) return;
      } else {
        const parts = [];
        if (offer.enabled && hasOfferPrice(offer)) {
          parts.push(sentence(`${offer.price_subject} v aktuální nabídce: ${[offer.price, offer.unit].filter(hasText).join(" ")}`));
          if (hasText(offer.price_note)) parts.push(sentence(offer.price_note));
          parts.push("Na cenu dalšího ovoce se nás prosím zeptejte.");
        } else if (!offer.enabled && [offer.hours, offer.arrangement].some(hasText)) {
          parts.push("Ceny teď na webu neuvádíme.");
        }
        if (hasText(offer.hours)) parts.push(`Prodejní doba: ${sentence(offer.hours)}`);
        if (hasText(offer.arrangement)) parts.push(sentence(offer.arrangement));
        if (!parts.length) return;
        if (contactDetails) parts.push(`Napište nám na ${getSalesEmail(contactDetails)}.`);
        answer = parts.join(" ");
      }
    }
    if (!hasText(answer)) return;
    questions.push({
      group: item.group,
      question: item.question,
      answerElement: item.answer_source === "text" ? createFaqAnswer(answer) : createElement("p", "", answer)
    });
  });
  const groups = [...faqGroups].map(([key, title]) => ({
    key,
    title,
    questions: questions.filter((item) => item.group === key)
  })).filter((group) => group.questions.length);
  list.replaceChildren(...groups.map((group) => {
    const section = createElement("section", "faq__group");
    const heading = createElement("h3", "faq__group-title", group.title);
    heading.id = `faq-${group.key}`;
    section.dataset.faqGroup = group.key;
    section.setAttribute("aria-labelledby", heading.id);
    section.append(heading, ...group.questions.map((item) => {
      const details = createElement("details");
      const summary = createElement("summary", "", item.question);
      summary.append(createElement("span"));
      details.append(summary, item.answerElement);
      return details;
    }));
    return section;
  }));
  if (missingOffer) {
    list.append(createElement("p", "content-message", contactDetails
      ? "Ceny a prodejní dobu se teď nepodařilo načíst. Napište nám, rádi vám je pošleme."
      : "Ceny a prodejní dobu se teď nepodařilo načíst. Zkuste prosím stránku znovu načíst."));
  }
  document.querySelector("[data-faq-section]").hidden = !questions.length && !missingOffer;
  const schema = document.querySelector("[data-faq-schema]");
  schema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((group) => group.questions).map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answerElement.textContent }
    }))
  });
  syncSectionLinks();
};

const updateBusinessSchema = (web) => {
  const element = document.querySelector("[data-business-schema]");
  const data = JSON.parse(element.textContent);
  delete data.founder;
  if (web) {
    data.legalName = web.operator.name;
    data.identifier = { "@type": "PropertyValue", propertyID: "IČO", value: web.operator.ico };
    data.telephone = web.contact.phone;
    data.email = web.contact.email;
    data.address.addressLocality = web.contact.locality;
    data.address.streetAddress = web.contact.address;
    data.address.postalCode = web.contact.postal_code;
    data.geo = { "@type": "GeoCoordinates", latitude: web.contact.latitude, longitude: web.contact.longitude };
    const items = [
      ...fruitKeys.map((key) => ({ name: web.fruit[key].name, description: web.fruit[key].description })),
      ...["honey", "trees"].map((key) => ({ name: web[key].title, description: web[key].description }))
    ].filter((item) => hasText(item.name)).map((item) => ({
      "@type": "OfferCatalog",
      name: item.name,
      ...(hasText(item.description) ? { description: item.description } : {})
    }));
    if (items.length) {
      data.hasOfferCatalog = { "@type": "OfferCatalog", name: "Nabídka Farmy Letocha", itemListElement: items };
    } else {
      delete data.hasOfferCatalog;
    }
  } else {
    delete data.legalName;
    delete data.identifier;
    delete data.telephone;
    delete data.email;
    delete data.hasOfferCatalog;
  }
  element.textContent = JSON.stringify(data);
};

const initializeContent = async () => {
  const results = await Promise.allSettled([
    loadJson("web", validateWeb),
    loadJson("nabidka", validateOffer),
    loadJson("faq", validateFaq)
  ]);
  const values = results.map((result, index) => {
    if (result.status === "fulfilled") return result.value;
    console.error(`Nepodařilo se načíst obsah: ${["web", "nabidka", "faq"][index]}.`, result.reason);
    return null;
  });
  const [web, offer, faq] = values;
  if (web) {
    renderWeb(web);
  } else {
    bindContact(null);
    const message = document.querySelector("[data-content-error]");
    message.hidden = false;
    message.textContent = "Kontaktní údaje a další informace se nepodařilo načíst. Zkuste prosím stránku znovu načíst.";
  }
  if (offer) {
    renderOffer(offer);
  } else {
    document.querySelectorAll("[data-sale-hours]").forEach((element) => {
      element.textContent = contactDetails
        ? "Prodejní dobu vám rádi pošleme e-mailem."
        : "Prodejní dobu ani kontaktní údaje se nepodařilo načíst. Zkuste prosím stránku znovu načíst.";
    });
    document.querySelectorAll("[data-sale-arrangement]").forEach((element) => {
      element.textContent = "";
    });
    const panel = document.querySelector("[data-current-offer]");
    const heading = createElement("h3", "", "Aktuální nabídka");
    heading.id = "aktualni-nabidka-nadpis";
    panel.replaceChildren(heading, createElement("p", "content-message",
      contactDetails
        ? "Aktuální nabídku se teď nepodařilo načíst. Rádi vám ji pošleme e-mailem."
        : "Aktuální nabídku ani kontaktní údaje se nepodařilo načíst. Zkuste prosím stránku znovu načíst."));
    panel.hidden = false;
  }
  updateProduceVisibility();
  if (faq) {
    renderFaq(faq, offer);
  } else {
    document.querySelector("[data-faq-list]").replaceChildren(createElement("p", "content-message",
      contactDetails
        ? "Odpovědi se teď nepodařilo načíst. Napište nám, rádi poradíme."
        : "Odpovědi se teď nepodařilo načíst. Zkuste prosím stránku znovu načíst."));
  }
  updateBusinessSchema(web);
  return { web, offer };
};
