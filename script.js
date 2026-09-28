const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const closeMenu = () => {
  if (!menuButton || !menu) return;
  menuButton.setAttribute("aria-expanded", "false");
  menu.classList.remove("is-open");
  document.body.classList.remove("menu-open");
};

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(willOpen));
    menu.classList.toggle("is-open", willOpen);
    document.body.classList.toggle("menu-open", willOpen);
  });

  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 940) closeMenu();
  });
}

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const revealElements = document.querySelectorAll(".reveal");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
  document.documentElement.classList.add("js");
}

const currentMonth = new Date().getMonth() + 1;

document.querySelectorAll("[data-months]").forEach((element) => {
  const months = element.dataset.months
    .split(",")
    .map(Number);
  element.classList.toggle("is-current", months.includes(currentMonth));
});

document.querySelectorAll("[data-month]").forEach((element) => {
  element.classList.toggle("is-current", Number(element.dataset.month) === currentMonth);
});

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const reservationForm = document.querySelector("[data-reservation-form]");
const slotSelect = document.querySelector("[data-slot-select]");
const slotGrid = document.querySelector("[data-slot-grid]");
const harvestOffer = document.querySelector("[data-harvest-offer]");
const reservationSection = document.querySelector("[data-reservation-section]");
const harvestAnnouncement = document.querySelector("[data-harvest-announcement]");
const harvestAnnouncementLink = document.querySelector("[data-harvest-announcement-link]");
const offerLabel = document.querySelector("[data-offer-label]");
const offerTitle = document.querySelector("[data-offer-title]");
const offerDescription = document.querySelector("[data-offer-description]");
const offerMeta = document.querySelector("[data-offer-meta]");
const offerTime = document.querySelector("[data-offer-time]");
const offerConfirmationTitle = document.querySelector("[data-offer-confirmation-title]");
const offerConfirmationNote = document.querySelector("[data-offer-confirmation-note]");
const reservationFeedback = document.querySelector("[data-reservation-feedback]");
const copyReservationButton = document.querySelector("[data-copy-reservation]");

const slotStatuses = {
  preliminary: {
    label: "K potvrzení podle zralosti",
    button: "Vybrat",
    reservable: true
  },
  open: {
    label: "Volná místa",
    button: "Vybrat",
    reservable: true
  },
  full: {
    label: "Obsazeno",
    button: "Obsazeno",
    reservable: false
  },
  closed: {
    label: "Rezervace uzavřena",
    button: "Uzavřeno",
    reservable: false
  },
  cancelled: {
    label: "Termín zrušen",
    button: "Zrušeno",
    reservable: false
  }
};

const getPragueDate = () => {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
};

const parseSlotDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
};

const formatSlotDate = (date, includeYear = false) => {
  const formatted = new Intl.DateTimeFormat("cs-CZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: includeYear ? "numeric" : undefined,
    timeZone: "UTC"
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const formatSlotTime = (start, end) => {
  const normalize = (value) => String(value || "").replace(/^0/, "");
  if (start && end) return `${normalize(start)}–${normalize(end)}`;
  return normalize(start || end) || "čas bude upřesněn";
};

const updateSelectedSlot = () => {
  document.querySelectorAll("[data-slot-card]").forEach((card) => {
    const button = card.querySelector("[data-slot-value]");
    const isSelected = button?.dataset.slotValue === slotSelect?.value;
    card.classList.toggle("is-selected", isSelected);
    if (button && !button.disabled) {
      button.textContent = isSelected ? "Vybráno" : button.dataset.defaultLabel || "Vybrat";
    }
  });
};

const createSlotCard = (slot, bookingEnabled, today) => {
  const date = parseSlotDate(slot.date);
  if (!date) return null;

  const statusKey = slotStatuses[slot.status] ? slot.status : "preliminary";
  const status = slotStatuses[statusKey];
  const isPast = slot.date < today;
  const isReservable = bookingEnabled && !isPast && status.reservable;
  const time = formatSlotTime(slot.start, slot.end);
  const reservationValue = `${formatSlotDate(date, true)} · ${time} · ${slot.fruit}`;

  const card = createElement("article", `slot-card slot-card--${statusKey}`);
  card.dataset.slotCard = "";
  card.dataset.slotDate = slot.date;
  if (isPast) card.classList.add("is-past");
  if (!isReservable) card.classList.add("is-disabled");

  const dateBox = createElement("div", "slot-card__date");
  const weekday = new Intl.DateTimeFormat("cs-CZ", {
    weekday: "short",
    timeZone: "UTC"
  }).format(date).replace(".", "").toUpperCase();
  const month = new Intl.DateTimeFormat("cs-CZ", {
    month: "long",
    timeZone: "UTC"
  }).format(date).toUpperCase();
  dateBox.append(
    createElement("span", "", weekday),
    createElement("strong", "", String(date.getUTCDate()).padStart(2, "0")),
    createElement("small", "", month)
  );

  const content = createElement("div", "slot-card__content");
  content.append(
    createElement("h4", "", formatSlotDate(date)),
    createElement("p", "", `${slot.fruit} · ${time}`),
    createElement(
      "span",
      "slot-card__status",
      isPast ? "Termín již proběhl" : slot.note || status.label
    )
  );

  const buttonLabel = isPast ? "Proběhlo" : bookingEnabled ? status.button : "Rezervace vypnutá";
  const button = createElement("button", "", buttonLabel);
  button.type = "button";
  button.disabled = !isReservable;
  button.dataset.defaultLabel = status.button;
  if (isReservable) button.dataset.slotValue = reservationValue;

  card.append(dateBox, content, button);
  return { card, reservationValue, isReservable, date: slot.date };
};

const setAnnouncementLink = (label, href) => {
  if (!harvestAnnouncementLink) return;
  harvestAnnouncementLink.href = href;
  harvestAnnouncementLink.replaceChildren(
    document.createTextNode(`${label} `),
    createElement("strong", "", "→")
  );
};

const fillSlotSelect = (reservableSlots, allowOtherTerm) => {
  if (!slotSelect) return;
  slotSelect.replaceChildren(new Option(
    reservableSlots.length ? "Vyberte termín samosběru" : "Aktuálně není termín k rezervaci",
    ""
  ));

  reservableSlots.forEach(({ reservationValue }) => {
    slotSelect.add(new Option(reservationValue, reservationValue));
  });

  if (allowOtherTerm) {
    const otherTerm = "Jiný termín po telefonické dohodě";
    slotSelect.add(new Option(otherTerm, otherTerm));
  }

  slotSelect.disabled = reservableSlots.length === 0 && !allowOtherTerm;
};

const renderHarvestOffer = (data) => {
  const enabled = data?.enabled !== false;
  const bookingEnabled = data?.booking_enabled !== false;

  if (harvestAnnouncement) {
    harvestAnnouncement.textContent = data?.announcement || "Aktuální nabídku samosběru ověřte telefonicky.";
  }

  if (!enabled) {
    if (harvestOffer) harvestOffer.hidden = true;
    if (reservationSection) reservationSection.hidden = true;
    setAnnouncementLink("Kontaktovat farmu", "#kontakt");
    return;
  }

  if (harvestOffer) harvestOffer.hidden = false;
  if (offerLabel) offerLabel.textContent = data.offer_label || "Aktuální nabídka";
  if (offerTitle) offerTitle.textContent = data.title || "Termíny samosběru";
  if (offerDescription) offerDescription.textContent = data.description || "";
  if (offerConfirmationTitle) {
    offerConfirmationTitle.textContent = data.confirmation_title || "Rezervace platí až po potvrzení farmou.";
  }
  if (offerConfirmationNote) offerConfirmationNote.textContent = data.confirmation_note || "";
  if (offerTime) offerTime.textContent = data.time_summary || "Podle termínu";
  if (offerMeta) offerMeta.hidden = !data.time_summary;

  const today = getPragueDate();
  const slots = Array.isArray(data.slots)
    ? data.slots
        .filter((slot) => slot && slot.visible !== false && parseSlotDate(slot.date))
        .sort((left, right) => `${left.date}${left.start || ""}`.localeCompare(`${right.date}${right.start || ""}`))
    : [];

  const renderedSlots = slots
    .map((slot) => createSlotCard(slot, bookingEnabled, today))
    .filter(Boolean);
  const reservableSlots = renderedSlots.filter((slot) => slot.isReservable);

  if (slotGrid) {
    if (renderedSlots.length) {
      slotGrid.replaceChildren(...renderedSlots.map(({ card }) => card));
    } else {
      slotGrid.replaceChildren(createElement(
        "p",
        "slot-empty",
        data.empty_message || "Aktuálně nejsou vypsané žádné veřejné termíny."
      ));
    }
  }

  fillSlotSelect(reservableSlots, data.allow_other_term !== false);
  if (reservationSection) reservationSection.hidden = !bookingEnabled;

  if (bookingEnabled && (reservableSlots.length || data.allow_other_term !== false)) {
    setAnnouncementLink("Vybrat termín", "#rezervace");
  } else {
    setAnnouncementLink("Zobrazit nabídku", "#samosber");
  }
};

const showHarvestLoadError = () => {
  if (harvestAnnouncement) {
    harvestAnnouncement.textContent = "Aktuální termíny se nepodařilo načíst. Ověřte je prosím telefonicky.";
  }
  const contact = getContactDetails();
  setAnnouncementLink(contact ? "Zavolat na farmu" : "Kontaktovat farmu", contact ? `tel:${contact.phone}` : "#kontakt");
  if (offerLabel) offerLabel.textContent = "Telefonické ověření";
  if (offerTitle) offerTitle.textContent = "Termíny ověřte přímo na farmě";
  if (offerDescription) {
    offerDescription.textContent = "Aktuální termíny se nepodařilo zobrazit. Rádi vám je sdělíme telefonicky.";
  }
  if (offerMeta) offerMeta.hidden = true;
  if (slotGrid) {
    slotGrid.replaceChildren(createElement(
      "p",
      "slot-empty slot-empty--error",
      contact
        ? `Zavolejte na ${formatPhone(contact.phone)} a ověřte aktuální možnosti samosběru.`
        : "Aktuální možnosti samosběru si prosím ověřte přímo na farmě."
    ));
  }
  if (reservationSection) reservationSection.hidden = true;
};

const loadHarvestOffer = async () => {
  try {
    const response = await fetch("data/samosber.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    renderHarvestOffer(await response.json());
  } catch (error) {
    console.error("Nepodařilo se načíst nabídku samosběru.", error);
    showHarvestLoadError();
  }
};

slotGrid?.addEventListener("click", (event) => {
  const button = event.target.closest?.("[data-slot-value]");
  if (!button || button.disabled || !slotSelect || !reservationForm) return;
  slotSelect.value = button.dataset.slotValue || "";
  updateSelectedSlot();
  reservationSection?.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start"
  });
  window.setTimeout(() => slotSelect.focus({ preventScroll: true }), reduceMotion ? 0 : 450);
});

slotSelect?.addEventListener("change", updateSelectedSlot);
loadHarvestOffer();

const buildReservationMessage = () => {
  if (!reservationForm) return null;
  const formData = new FormData(reservationForm);
  const term = String(formData.get("Termin") || "").trim();
  const name = String(formData.get("Jmeno") || "").trim();
  const phone = String(formData.get("Telefon") || "").trim();
  const people = String(formData.get("Pocet osob") || "").trim();
  const amount = String(formData.get("Mnozstvi") || "").trim();
  const note = String(formData.get("Poznamka") || "").trim();

  const subject = `Předběžná rezervace samosběru – ${term}`;
  const body = [
    "Dobrý den,",
    "",
    "prosím o potvrzení předběžné rezervace samosběru:",
    "",
    `Termín: ${term}`,
    `Jméno: ${name}`,
    `Telefon: ${phone}`,
    `Počet osob: ${people}`,
    `Předpokládané množství: ${amount}`,
    `Poznámka: ${note || "bez poznámky"}`,
    "",
    "Rozumím, že termín platí až po potvrzení farmou podle zralosti ovoce a počasí.",
    "",
    "Děkuji."
  ].join("\n");

  return { subject, body };
};

reservationForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!reservationForm.reportValidity()) return;
  const message = buildReservationMessage();
  if (!message) return;

  const contact = getContactDetails();
  if (!contact) {
    reservationFeedback.textContent = "Kontaktní údaje se nepodařilo načíst. Zkuste prosím stránku znovu načíst.";
    return;
  }
  const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(message.subject)}&body=${encodeURIComponent(message.body)}`;
  if (reservationFeedback) {
    reservationFeedback.textContent = "Žádost je připravená. Otevírám váš e-mailový program…";
  }
  window.location.href = mailto;
});

const copyText = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Continue with the selection-based fallback below.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard copy was rejected.");
};

copyReservationButton?.addEventListener("click", async () => {
  if (!reservationForm?.reportValidity()) return;
  const message = buildReservationMessage();
  if (!message) return;

  try {
    await copyText(`${message.subject}\n\n${message.body}`);
    if (reservationFeedback) {
      reservationFeedback.textContent = "Údaje rezervace jsou zkopírované. Můžete je vložit do SMS nebo e-mailu.";
    }
  } catch {
    if (reservationFeedback) {
      reservationFeedback.textContent = "Kopírování se nepodařilo. Použijte prosím e-mailové tlačítko nebo zavolejte.";
    }
  }
});

const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");

if (lightbox && lightboxImage && lightboxCaption && typeof lightbox.showModal === "function") {
  document.querySelectorAll("[data-gallery-src]").forEach((item) => {
    item.addEventListener("click", () => {
      lightboxImage.src = item.dataset.gallerySrc;
      lightboxImage.alt = item.dataset.galleryAlt || "";
      lightboxCaption.textContent = item.dataset.galleryCaption || "";
      lightbox.showModal();
    });
  });

  lightboxClose?.addEventListener("click", () => lightbox.close());

  lightbox.addEventListener("click", (event) => {
    const bounds = lightbox.getBoundingClientRect();
    const clickedOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (clickedOutside) lightbox.close();
  });
}

const initializeHeroCarousel = (autoplay) => {
  const carousel = document.querySelector("[data-hero-carousel]");
  if (!carousel) return;
  const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
  const buttons = Array.from(carousel.querySelectorAll("[data-hero-select]"));
  const toggle = carousel.querySelector("[data-hero-toggle]");
  const caption = carousel.querySelector("[data-hero-caption]");
  const title = carousel.querySelector("[data-hero-title]");
  const description = carousel.querySelector("[data-hero-description]");
  const feedback = carousel.querySelector("[data-hero-feedback]");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let index = 0;
  let playing = autoplay && !motion.matches;
  let timer;
  let request = 0;
  let hovered = false;
  let visible = !("IntersectionObserver" in window);
  let focusPlayback = false;
  let pointerIntent = null;

  const updateCaption = () => {
    const slide = slides[index];
    title.textContent = slide.dataset.title;
    description.textContent = slide.dataset.description;
    caption.dataset.fruitColor = slide.dataset.heroSlide;
    carousel.dataset.activeFruit = slide.dataset.heroSlide;
    slides.forEach((item, position) => {
      const active = position === index;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-hidden", String(!active));
      item.setAttribute("aria-label", `${position + 1} ze ${slides.length}: ${item.dataset.name}`);
      buttons[position].setAttribute("aria-pressed", String(active));
    });
  };

  const updatePlayback = () => {
    toggle.textContent = playing ? "Ⅱ" : "▶";
    toggle.setAttribute("aria-label", playing ? "Pozastavit střídání fotografií" : "Spustit střídání fotografií");
    caption.setAttribute("aria-live", playing ? "off" : "polite");
    carousel.dataset.playing = String(playing);
  };

  const schedule = () => {
    window.clearTimeout(timer);
    const focused = carousel.contains(document.activeElement);
    if (playing && visible && !hovered && !document.hidden && (!focused || focusPlayback)) {
      timer = window.setTimeout(() => showSlide((index + 1) % slides.length), 6000);
    }
  };

  const setPlaying = (value) => {
    if (!value) request += 1;
    playing = value;
    updatePlayback();
    schedule();
  };

  const showSlide = async (next) => {
    const currentRequest = ++request;
    window.clearTimeout(timer);
    const image = slides[next].querySelector("img");
    try {
      image.loading = "eager";
      await image.decode();
      if (currentRequest !== request) return;
      index = next;
      feedback.hidden = true;
      updateCaption();
      schedule();
    } catch (error) {
      if (currentRequest !== request) return;
      console.error("Nepodařilo se zobrazit fotografii ovoce.", error);
      feedback.textContent = "Fotografii se nepodařilo zobrazit. Zkuste jiné ovoce.";
      feedback.hidden = false;
      setPlaying(false);
    }
  };

  buttons.forEach((button, position) => {
    button.addEventListener("click", () => {
      focusPlayback = false;
      setPlaying(false);
      showSlide(position);
    });
  });
  toggle.addEventListener("pointerdown", () => { pointerIntent = !playing; });
  toggle.addEventListener("click", () => {
    const next = pointerIntent ?? !playing;
    pointerIntent = null;
    focusPlayback = next;
    setPlaying(next);
  });
  carousel.addEventListener("pointercancel", () => { pointerIntent = null; });
  carousel.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "touch") return;
    hovered = true;
    schedule();
  });
  carousel.addEventListener("pointerleave", () => {
    hovered = false;
    pointerIntent = null;
    schedule();
  });
  carousel.addEventListener("focusin", () => {
    focusPlayback = false;
    setPlaying(false);
  });
  carousel.addEventListener("focusout", () => {
    window.setTimeout(schedule, 0);
  });
  carousel.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0
      : event.key === "End" ? slides.length - 1
      : (index + (event.key === "ArrowRight" ? 1 : -1) + slides.length) % slides.length;
    setPlaying(false);
    buttons[next].focus();
    showSlide(next);
  });
  motion.addEventListener("change", (event) => {
    if (event.matches) setPlaying(false);
  });
  document.addEventListener("visibilitychange", schedule);
  window.addEventListener("pagehide", () => window.clearTimeout(timer));
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }, { threshold: 0.15 });
    observer.observe(carousel);
  }
  carousel.querySelector("[data-hero-controls]").hidden = false;
  updateCaption();
  updatePlayback();
  schedule();
};

initializeContent()
  .then(({ web }) => initializeHeroCarousel(web ? web.intro.rotate_fruit : true))
  .catch((error) => {
    console.error("Nepodařilo se zobrazit obsah webu.", error);
    const message = document.querySelector("[data-content-error]");
    message.textContent = "Informace se nepodařilo zobrazit. Zkuste prosím stránku znovu načíst.";
    message.hidden = false;
  });
