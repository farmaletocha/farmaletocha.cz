const fruitKeys = ["apples", "apricots", "blackcurrants", "plums"];

const fruitColors = {
  apples: "apple",
  apricots: "apricot",
  plums: "plum",
  blackcurrants: "currant"
};

let contactDetails = null;

const getContactDetails = () => contactDetails;

const createElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

const formatPhone = (phone) => phone.startsWith("+420") && phone.length === 13
  ? phone.slice(4).replace(/(\d{3})(?=\d)/g, "$1 ")
  : phone;

const check = (condition, message) => {
  if (!condition) throw new Error(message);
};

const checkText = (value, path) => {
  check(typeof value === "string" && value.trim().length > 0, `Missing text: ${path}`);
};

const checkFields = (object, fields, path) => {
  check(object && typeof object === "object" && !Array.isArray(object), `Invalid object: ${path}`);
  fields.forEach((field) => checkText(object[field], `${path}.${field}`));
};

const isMonth = (value) => /^(?:[1-9]|1[0-2])$/.test(String(value));

const validateWeb = (data) => {
  checkFields(data?.contact, ["name", "phone", "email", "locality", "address", "postal_code", "location_text", "directions"], "contact");
  check(/^\+[1-9]\d{6,14}$/.test(data.contact.phone), "Invalid contact phone");
  check(/^[^\s@<>?&#]+@[^\s@<>?&#]+\.[^\s@<>?&#]+$/.test(data.contact.email), "Invalid contact email");
  check(Number.isFinite(data.contact.latitude) && Math.abs(data.contact.latitude) <= 90, "Invalid map latitude");
  check(Number.isFinite(data.contact.longitude) && Math.abs(data.contact.longitude) <= 180, "Invalid map longitude");
  checkFields(data.intro, ["location", "title", "subtitle", "description"], "intro");
  check(typeof data.intro.rotate_fruit === "boolean", "Invalid fruit rotation setting");
  checkFields(data.story, ["title", "lead", "description"], "story");
  checkFields(data.trees, ["title", "description"], "trees");
  fruitKeys.forEach((key) => {
    const fruit = data.fruit?.[key];
    checkFields(fruit, ["name", "season", "description", "hero_title", "hero_description"], `fruit.${key}`);
    check(Array.isArray(fruit.months) && fruit.months.every(isMonth), `Invalid season months: ${key}`);
  });
  check(Array.isArray(data.fruit.apples.varieties), "Invalid apple varieties");
  data.fruit.apples.varieties.forEach((value) => checkText(value, "apple variety"));
  check(Array.isArray(data.calendar), "Invalid calendar");
  const months = new Set();
  data.calendar.forEach((month) => {
    checkFields(month, ["title", "description"], "calendar");
    check(isMonth(month.month) && !months.has(Number(month.month)), "Invalid or repeated calendar month");
    months.add(Number(month.month));
    check(Array.isArray(month.fruits) && month.fruits.every((key) => fruitKeys.includes(key)), "Invalid calendar fruit");
  });
  return data;
};

const validateOffer = (data) => {
  checkFields(data, ["title", "price_subject", "price", "unit", "price_note", "hours", "arrangement"], "offer");
  check(typeof data.enabled === "boolean", "Invalid offer visibility");
  check(Array.isArray(data.varieties), "Invalid offer varieties");
  data.varieties.forEach((item) => {
    checkFields(item, ["name", "status", "description"], "offer variety");
    check(typeof item.sold_out === "boolean", "Invalid sold-out state");
  });
  return data;
};

const validateFaq = (data) => {
  check(Array.isArray(data?.items), "Invalid FAQ list");
  data.items.forEach((item) => {
    checkText(item.question, "FAQ question");
    check(typeof item.visible === "boolean", "Invalid FAQ visibility");
    check(["text", "availability", "sales"].includes(item.answer_source), "Invalid FAQ answer source");
    if (item.answer_source === "text") checkText(item.answer, "FAQ answer");
  });
  return data;
};

const loadJson = async (filename, validate) => {
  const response = await fetch(`data/${filename}.json`, { cache: "no-store" });
  if (!response.ok) throw new Error(`${filename}: HTTP ${response.status}`);
  return validate(await response.json());
};

const bindContact = (contact) => {
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
      link.href = `mailto:${contact.email}`;
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
    element.textContent = contact ? contact.email : "E-mail není dostupný";
  });
  const form = document.querySelector("[data-reservation-form]");
  if (form) {
    if (contact) form.action = `mailto:${contact.email}`;
    else form.removeAttribute("action");
    form.querySelector('[type="submit"]').disabled = !contact;
  }
};

const renderWeb = (data) => {
  document.querySelectorAll("[data-copy]").forEach((element) => {
    const value = element.dataset.copy.split(".").reduce((value, key) => value?.[key], data);
    checkText(value, element.dataset.copy);
    element.textContent = value;
  });
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
    card.querySelector("h3").textContent = fruit.name;
    card.querySelector("[data-fruit-description]").textContent = fruit.description;
    const chip = card.querySelector(".season-chip");
    chip.textContent = fruit.season;
    chip.dataset.months = fruit.months.join(",");
    chip.classList.toggle("is-current", fruit.months.map(Number).includes(currentMonth));
    const slide = document.querySelector(`[data-hero-slide="${key}"]`);
    slide.dataset.title = fruit.hero_title;
    slide.dataset.description = fruit.hero_description;
    slide.dataset.name = fruit.name;
    const control = document.querySelector(`[data-hero-select="${key}"]`);
    control.setAttribute("aria-label", `Zobrazit: ${fruit.name}`);
  });
  document.querySelector("[data-apple-varieties]").replaceChildren(
    ...data.fruit.apples.varieties.map((name) => createElement("li", "", name))
  );
  const calendar = document.querySelector("[data-calendar]");
  calendar.replaceChildren(...data.calendar.map((entry) => {
    const month = Number(entry.month);
    const article = createElement("article", "calendar__month");
    article.dataset.month = String(month);
    article.classList.toggle("is-current", month === currentMonth);
    const text = createElement("div");
    const monthName = new Intl.DateTimeFormat("cs-CZ", { month: "long", timeZone: "UTC" })
      .format(new Date(Date.UTC(2026, month - 1, 1)));
    const fruits = createElement("div", "calendar__fruit");
    entry.fruits.forEach((key) => {
      fruits.append(
        createElement("span", `dot dot--${fruitColors[key]}`),
        document.createTextNode(` ${data.fruit[key].name} `)
      );
    });
    text.append(
      createElement("span", "calendar__name", monthName.charAt(0).toUpperCase() + monthName.slice(1)),
      createElement("h3", "", entry.title),
      createElement("p", "", entry.description),
      fruits
    );
    article.append(createElement("div", "calendar__number", String(month).padStart(2, "0")), text);
    return article;
  }));
  document.querySelector("#sezona").hidden = data.calendar.length === 0;
};

const renderOffer = (data) => {
  document.querySelectorAll("[data-sale-hours]").forEach((element) => {
    element.textContent = data.hours;
  });
  document.querySelectorAll("[data-sale-arrangement]").forEach((element) => {
    element.textContent = data.arrangement;
  });
  const panel = document.querySelector("[data-current-offer]");
  panel.hidden = !data.enabled;
  if (!data.enabled) return;
  const summary = createElement("div", "current-offer__summary");
  const heading = createElement("h3", "", data.title);
  heading.id = "aktualni-nabidka-nadpis";
  const price = createElement("p", "current-offer__price", `${data.price} `);
  price.append(createElement("span", "", data.unit));
  price.setAttribute("aria-label", `${data.price_subject}: ${data.price} ${data.unit}`);
  const hours = createElement("p", "current-offer__hours");
  hours.append(
    createElement("strong", "", data.hours),
    createElement("br"),
    document.createTextNode(`${data.arrangement} `)
  );
  if (contactDetails) {
    const phone = createElement("a", "", formatPhone(contactDetails.phone));
    phone.href = `tel:${contactDetails.phone}`;
    hours.append(phone);
  }
  summary.append(createElement("p", "eyebrow", "Aktuální nabídka"), heading, price,
    createElement("p", "", data.price_note), hours);
  const varieties = createElement("dl", "current-offer__varieties");
  data.varieties.forEach((item) => {
    const row = createElement("div");
    const name = createElement("dt", "", `${item.name} `);
    name.append(createElement("span", item.sold_out ? "current-offer__sold-out" : "", item.status));
    row.append(name, createElement("dd", "", item.description));
    varieties.append(row);
  });
  panel.replaceChildren(summary, varieties);
};

const sentence = (text) => /[.!?]$/.test(text) ? text : `${text}.`;

const renderFaq = (data, offer) => {
  const list = document.querySelector("[data-faq-list]");
  const questions = [];
  let missingOffer = false;
  data.items.filter((item) => item.visible).forEach((item) => {
    let answer = item.answer;
    if (item.answer_source !== "text") {
      if (!offer) {
        missingOffer = true;
        return;
      }
      if (item.answer_source === "availability") {
        if (!offer.enabled) return;
        answer = offer.varieties.map((variety) => sentence(`${variety.name}: ${variety.status}`)).join(" ");
        if (!answer) return;
      } else {
        answer = [
          offer.enabled
            ? `${sentence(`${offer.price_subject} v aktuální nabídce: ${offer.price} ${offer.unit}`)} ${sentence(offer.price_note)} Cenu ostatního ovoce prosím ověřte samostatně.`
            : "",
          `Prodej: ${sentence(offer.hours)} ${sentence(offer.arrangement)}`,
          contactDetails ? `Telefon: ${formatPhone(contactDetails.phone)}.` : ""
        ].filter(Boolean).join(" ");
      }
    }
    questions.push({ question: item.question, answer });
  });
  list.replaceChildren(...questions.map((item) => {
    const details = createElement("details");
    const summary = createElement("summary", "", item.question);
    summary.append(createElement("span"));
    details.append(summary, createElement("p", "", item.answer));
    return details;
  }));
  if (missingOffer) {
    list.append(createElement("p", "content-message", "Aktuální nabídku se nepodařilo načíst. S dotazy se na nás obraťte přímo."));
  }
  document.querySelector("[data-faq-section]").hidden = !questions.length && !missingOffer;
  const schema = document.querySelector("[data-faq-schema]");
  schema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  });
};

const updateBusinessSchema = (web) => {
  const element = document.querySelector("[data-business-schema]");
  const data = JSON.parse(element.textContent);
  if (web) {
    data.telephone = web.contact.phone;
    data.email = web.contact.email;
    data.founder.name = web.contact.name;
    data.address.addressLocality = web.contact.locality;
    data.address.streetAddress = web.contact.address;
    data.address.postalCode = web.contact.postal_code;
    data.geo = { "@type": "GeoCoordinates", latitude: web.contact.latitude, longitude: web.contact.longitude };
    data.hasOfferCatalog.itemListElement = fruitKeys.map((key) => ({
      "@type": "OfferCatalog",
      name: web.fruit[key].name,
      description: web.fruit[key].description
    }));
  } else {
    delete data.telephone;
    delete data.email;
    delete data.founder;
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
      element.textContent = "Prodejní dobu si ověřte přímo na farmě.";
    });
    document.querySelectorAll("[data-sale-arrangement]").forEach((element) => {
      element.textContent = "";
    });
    const panel = document.querySelector("[data-current-offer]");
    const heading = createElement("h3", "", "Aktuální nabídka");
    heading.id = "aktualni-nabidka-nadpis";
    panel.replaceChildren(heading, createElement("p", "content-message",
      "Aktuální nabídku se nepodařilo načíst. Rádi vám ji sdělíme telefonicky."));
    panel.hidden = false;
  }
  if (faq) {
    renderFaq(faq, offer);
  } else {
    document.querySelector("[data-faq-list]").replaceChildren(createElement("p", "content-message",
      "Odpovědi se nepodařilo načíst. S dotazy se na nás obraťte přímo."));
  }
  updateBusinessSchema(web);
  return { web, offer };
};
