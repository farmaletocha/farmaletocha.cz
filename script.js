const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobileMenu = window.matchMedia("(max-width: 940px)");
const menuBackground = document.querySelectorAll("main, .site-footer, .mobile-call");

const menuIsOpen = () => menuButton?.getAttribute("aria-expanded") === "true";

const updateMenuPosition = () => {
  if (menu && header && mobileMenu.matches && menuIsOpen()) {
    menu.style.setProperty("--menu-top", `${Math.max(0, header.getBoundingClientRect().bottom)}px`);
  }
};

const menuLinks = () => Array.from(menu?.querySelectorAll("a[href]") || [])
  .filter((link) => link.getClientRects().length && link.getAttribute("aria-disabled") !== "true");

const setMenuOpen = (open, restoreFocus = false) => {
  if (!menuButton || !menu) return;
  const expanded = open && mobileMenu.matches;
  menuButton.setAttribute("aria-expanded", String(expanded));
  menu.classList.toggle("is-open", expanded);
  document.body.classList.toggle("menu-open", expanded);
  menu.inert = mobileMenu.matches && !expanded;
  if (mobileMenu.matches) menu.setAttribute("aria-hidden", String(!expanded));
  else menu.removeAttribute("aria-hidden");
  menuBackground.forEach((element) => { element.inert = expanded; });
  updateMenuPosition();
  if (expanded) {
    menu.scrollTop = 0;
    menuLinks()[0]?.focus({ preventScroll: true });
  }
  else if (restoreFocus && mobileMenu.matches) menuButton.focus({ preventScroll: true });
};

const closeMenu = (restoreFocus = false) => setMenuOpen(false, restoreFocus);

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    if (menuIsOpen()) closeMenu(true);
    else setMenuOpen(true);
  });

  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu()));
  document.querySelectorAll(".site-header .brand, .notice-bar a").forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  document.addEventListener("keydown", (event) => {
    if (!menuIsOpen()) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
    } else if (event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey) {
      const headerLinks = Array.from(document.querySelectorAll(".notice-bar a[href], .site-header .brand[href]"))
        .filter((link) => link.getBoundingClientRect().bottom > 0 && link.getClientRects().length);
      const controls = [...headerLinks, menuButton, ...menuLinks()];
      const index = controls.indexOf(document.activeElement);
      if (event.shiftKey && index <= 0) {
        event.preventDefault();
        controls[controls.length - 1].focus();
      } else if (!event.shiftKey && (index === -1 || index === controls.length - 1)) {
        event.preventDefault();
        controls[0].focus();
      }
    }
  });

  window.addEventListener("resize", () => {
    if (!mobileMenu.matches) closeMenu();
    else if (!menuIsOpen()) closeMenu(menu.contains(document.activeElement));
    else updateMenuPosition();
  });
  closeMenu();
}

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
  updateMenuPosition();
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
const reservationUnavailable = document.querySelector("[data-reservation-unavailable]");
const harvestAction = document.querySelector("[data-harvest-action]");
const otherReservationTerm = "Jiný termín po domluvě";
let harvestData = null;

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

const getPragueNow = () => {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`
  };
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

const describeSlot = (slot, bookingEnabled, now) => {
  const date = parseSlotDate(slot.date);
  if (!date) return null;

  const statusKey = Object.keys(slotStatuses).includes(slot.status) ? slot.status : "preliminary";
  const status = slotStatuses[statusKey];
  const hasEndTime = /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(slot.end || "");
  const isPast = slot.date < now.date ||
    (slot.date === now.date && hasEndTime && slot.end <= now.time);
  const isReservable = bookingEnabled && !isPast && status.reservable;
  const time = formatSlotTime(slot.start, slot.end);
  const reservationValue = `${formatSlotDate(date, true)} · ${time} · ${slot.fruit}`;
  return { date, statusKey, status, isPast, isReservable, time, reservationValue };
};

const visibleHarvestSlots = (data) => Array.isArray(data?.slots)
  ? data.slots
      .filter((slot) => slot && slot.visible !== false && parseSlotDate(slot.date))
      .sort((left, right) => `${left.date}${left.start || ""}`.localeCompare(`${right.date}${right.start || ""}`))
  : [];

const isAllowedReservation = (value, now = getPragueNow()) => {
  if (!harvestData || harvestData.enabled === false || harvestData.booking_enabled === false || !getContactDetails()) return false;
  if (harvestData.allow_other_term !== false && value === otherReservationTerm) return true;
  return visibleHarvestSlots(harvestData).some((slot) => {
    const state = describeSlot(slot, true, now);
    return state.isReservable && state.reservationValue === value;
  });
};

const createSlotCard = (slot, bookingEnabled, now) => {
  const state = describeSlot(slot, bookingEnabled, now);
  if (!state) return null;
  const { date, statusKey, status, isPast, isReservable, time, reservationValue } = state;

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

  const buttonLabel = isPast ? "Proběhlo" : bookingEnabled ? status.button : "Nelze rezervovat";
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

const setHarvestAction = (label, href) => {
  if (!harvestAction) return;
  harvestAction.href = href;
  const text = harvestAction.querySelector("[data-harvest-action-label]");
  if (text) text.textContent = label;
};

const setReservationAvailability = (available, message = "") => {
  if (reservationSection) reservationSection.hidden = !available;
  const submit = reservationForm?.querySelector('[type="submit"]');
  if (submit) submit.disabled = !available;
  if (copyReservationButton) copyReservationButton.disabled = !available;
  if (reservationUnavailable) {
    reservationUnavailable.textContent = message;
    reservationUnavailable.hidden = !message;
  }
};

const fillSlotSelect = (reservableSlots, allowOtherTerm) => {
  if (!slotSelect) return;
  const selected = slotSelect.value;
  slotSelect.replaceChildren(new Option(
    reservableSlots.length ? "Vyberte termín samosběru" : "Aktuálně není termín k rezervaci",
    ""
  ));

  reservableSlots.forEach(({ reservationValue }) => {
    slotSelect.add(new Option(reservationValue, reservationValue));
  });

  if (allowOtherTerm) {
    slotSelect.add(new Option(otherReservationTerm, otherReservationTerm));
  }

  slotSelect.disabled = reservableSlots.length === 0 && !allowOtherTerm;
  if (Array.from(slotSelect.options).some((option) => option.value === selected)) {
    slotSelect.value = selected;
  }
  updateSelectedSlot();
};

const renderHarvestOffer = (data) => {
  const enabled = data?.enabled !== false;
  const bookingEnabled = data?.booking_enabled !== false;
  const contact = getContactDetails();
  const contactError = "Kontaktní údaje se nepodařilo načíst. Zkuste prosím stránku znovu načíst.";

  if (harvestAnnouncement) {
    harvestAnnouncement.textContent = contact
      ? data?.announcement || "Na možnosti samosběru se nás zeptejte e-mailem."
      : contactError;
  }

  if (!enabled) {
    if (harvestOffer) harvestOffer.hidden = true;
    setReservationAvailability(false);
    setAnnouncementLink(contact ? "Kontaktovat farmu" : "Znovu načíst stránku", contact ? "#kontakt" : window.location.pathname);
    setHarvestAction(contact ? "Kontaktovat farmu" : "Znovu načíst stránku", contact ? "#kontakt" : window.location.pathname);
    return;
  }

  if (harvestOffer) harvestOffer.hidden = false;
  if (offerLabel) offerLabel.textContent = data.offer_label || "Aktuální nabídka";
  if (offerTitle) offerTitle.textContent = data.title || "Termíny samosběru";
  if (offerDescription) offerDescription.textContent = data.description || "";
  if (offerConfirmationTitle) {
    offerConfirmationTitle.textContent = data.confirmation_title || "Termín platí až po našem potvrzení.";
  }
  if (offerConfirmationNote) offerConfirmationNote.textContent = data.confirmation_note || "";
  if (offerTime) offerTime.textContent = data.time_summary || "Podle termínu";
  if (offerMeta) offerMeta.hidden = !data.time_summary;

  const now = getPragueNow();
  const slots = visibleHarvestSlots(data);

  const renderedSlots = slots
    .map((slot) => createSlotCard(slot, bookingEnabled && Boolean(contact), now))
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
  const canReserve = Boolean(contact) && bookingEnabled &&
    (reservableSlots.length > 0 || data.allow_other_term !== false);
  setReservationAvailability(canReserve, !contact
    ? contactError
    : bookingEnabled && !canReserve ? "Aktuálně není volný termín k rezervaci." : "");

  if (!contact) {
    setAnnouncementLink("Znovu načíst stránku", window.location.pathname);
    setHarvestAction("Znovu načíst stránku", window.location.pathname);
  } else if (canReserve) {
    setAnnouncementLink(reservableSlots.length ? "Vybrat termín" : "Domluvit termín", "#rezervace");
    setHarvestAction("Rezervovat samosběr", "#samosber");
  } else {
    setAnnouncementLink("Zobrazit nabídku", "#samosber");
    setHarvestAction("Zobrazit samosběr", "#samosber");
  }
};

const showHarvestLoadError = () => {
  if (harvestAnnouncement) {
    harvestAnnouncement.textContent = "Termíny samosběru se teď nepodařilo načíst.";
  }
  const contact = getContactDetails();
  setAnnouncementLink(contact ? "Napsat e-mail" : "Znovu načíst stránku", contact ? `mailto:${contact.email}` : window.location.pathname);
  setHarvestAction(contact ? "Kontaktovat farmu" : "Znovu načíst stránku", contact ? "#kontakt" : window.location.pathname);
  if (offerLabel) offerLabel.textContent = "Nedostupné";
  if (offerTitle) offerTitle.textContent = "Termíny samosběru nejsou dostupné";
  if (offerDescription) {
    offerDescription.textContent = "Zkuste prosím stránku znovu načíst.";
  }
  if (offerMeta) offerMeta.hidden = true;
  if (slotGrid) {
    slotGrid.replaceChildren(createElement(
      "p",
      "slot-empty slot-empty--error",
      contact
        ? `Napište nám na ${contact.email} a zeptejte se na možnosti samosběru.`
        : "Informace o samosběru nejsou k dispozici."
    ));
  }
  setReservationAvailability(false);
};

const loadHarvestOffer = async () => {
  const response = await fetch("data/samosber.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  check(data && typeof data === "object" && !Array.isArray(data), "Invalid self-picking offer");
  return data;
};

const showReservationError = (message) => {
  if (harvestData) renderHarvestOffer(harvestData);
  if (reservationSection && !reservationSection.hidden && reservationFeedback) {
    reservationFeedback.textContent = message;
    slotSelect?.focus({ preventScroll: true });
  } else if (reservationUnavailable) {
    reservationUnavailable.textContent = message;
    reservationUnavailable.hidden = false;
    reservationUnavailable.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }
};

slotGrid?.addEventListener("click", (event) => {
  const button = event.target.closest?.("[data-slot-value]");
  if (!button || button.disabled || !slotSelect || !reservationForm) return;
  if (!isAllowedReservation(button.dataset.slotValue)) {
    showReservationError("Vybraný termín už není dostupný. Zkontrolujte prosím aktuální nabídku.");
    return;
  }
  slotSelect.value = button.dataset.slotValue || "";
  updateSelectedSlot();
  reservationSection?.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start"
  });
  window.setTimeout(() => slotSelect.focus({ preventScroll: true }), reduceMotion ? 0 : 450);
});

slotSelect?.addEventListener("change", updateSelectedSlot);

const validateReservation = () => {
  if (!reservationForm || !harvestData || harvestData.enabled === false ||
      harvestData.booking_enabled === false || !getContactDetails()) {
    showReservationError("Rezervaci teď nelze připravit. Zkuste prosím stránku znovu načíst.");
    return false;
  }
  if (!slotSelect || slotSelect.disabled) {
    showReservationError("Aktuálně není volný termín k rezervaci.");
    return false;
  }
  if (!reservationForm.reportValidity()) return false;
  if (!isAllowedReservation(slotSelect.value)) {
    showReservationError("Vybraný termín už není dostupný. Vyberte prosím jiný z aktuální nabídky.");
    return false;
  }
  return true;
};

const buildReservationMessage = () => {
  if (!reservationForm) return null;
  const formData = new FormData(reservationForm);
  const term = String(formData.get("Termin") || "").trim();
  const name = String(formData.get("Jmeno") || "").trim();
  const phone = String(formData.get("Telefon") || "").trim();
  const people = String(formData.get("Pocet osob") || "").trim();
  const amount = String(formData.get("Mnozstvi") || "").trim();
  const note = String(formData.get("Poznamka") || "").trim();

  const subject = `Žádost o samosběr – ${term}`;
  const body = [
    "Dobrý den,",
    "",
    "prosím o domluvu samosběru:",
    "",
    `Termín: ${term}`,
    `Jméno: ${name}`,
    `Telefon: ${phone}`,
    `Počet osob: ${people}`,
    `Předpokládané množství: ${amount}`,
    `Poznámka: ${note || "bez poznámky"}`,
    "",
    "Rozumím, že termín platí až po vašem potvrzení podle zralosti ovoce a počasí.",
    "",
    "Děkuji."
  ].join("\n");

  return { subject, body };
};

reservationForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateReservation()) return;
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
  reservationForm.dispatchEvent(new Event("farma:reservation-email-prepared", { bubbles: true }));
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
  if (!validateReservation()) return;
  const message = buildReservationMessage();
  if (!message) return;

  try {
    await copyText(`${message.subject}\n\n${message.body}`);
    if (reservationFeedback) {
      reservationFeedback.textContent = "Údaje rezervace jsou zkopírované. Můžete je vložit do e-mailu.";
    }
  } catch {
    if (reservationFeedback) {
      reservationFeedback.textContent = getContactDetails()
        ? "Kopírování se nepodařilo. Použijte prosím tlačítko „Připravit žádost e-mailem“."
        : "Kopírování se nepodařilo. Zkuste prosím stránku znovu načíst.";
    }
  }
});

const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const lightboxPrevious = document.querySelector("[data-lightbox-previous]");
const lightboxNext = document.querySelector("[data-lightbox-next]");
const lightboxPosition = document.querySelector("[data-lightbox-position]");
const lightboxFeedback = document.querySelector("[data-lightbox-feedback]");

if (lightbox && lightboxImage && lightboxCaption && typeof lightbox.showModal === "function") {
  const galleryItems = Array.from(document.querySelectorAll("[data-gallery-src]"));
  let lightboxIndex = 0;

  const showLightboxPhoto = (index) => {
    lightboxIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[lightboxIndex];
    lightbox.setAttribute("aria-busy", "true");
    if (lightboxFeedback) {
      lightboxFeedback.textContent = "Načítám fotografii…";
      lightboxFeedback.hidden = false;
    }
    lightboxImage.hidden = false;
    lightboxImage.src = item.dataset.gallerySrc;
    lightboxImage.alt = item.dataset.galleryAlt || "";
    lightboxCaption.textContent = item.dataset.galleryCaption || "";
    if (lightboxPosition) lightboxPosition.textContent = `${lightboxIndex + 1} z ${galleryItems.length}`;
  };

  lightboxImage.addEventListener("load", () => {
    lightbox.removeAttribute("aria-busy");
    if (lightboxFeedback) lightboxFeedback.hidden = true;
  });
  lightboxImage.addEventListener("error", () => {
    lightbox.removeAttribute("aria-busy");
    lightboxImage.hidden = true;
    console.error("Nepodařilo se zobrazit fotografii z galerie.", lightboxImage.src);
    if (lightboxFeedback) {
      lightboxFeedback.textContent = "Fotografii se nepodařilo načíst. Zkuste předchozí nebo další.";
      lightboxFeedback.hidden = false;
    }
  });

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      showLightboxPhoto(index);
      lightbox.showModal();
    });
  });

  if (lightboxPrevious) {
    lightboxPrevious.disabled = galleryItems.length < 2;
    lightboxPrevious.addEventListener("click", () => showLightboxPhoto(lightboxIndex - 1));
  }
  if (lightboxNext) {
    lightboxNext.disabled = galleryItems.length < 2;
    lightboxNext.addEventListener("click", () => showLightboxPhoto(lightboxIndex + 1));
  }
  lightbox.addEventListener("keydown", (event) => {
    if (galleryItems.length < 2 || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showLightboxPhoto(lightboxIndex + (event.key === "ArrowRight" ? 1 : -1));
    }
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

const showPageLoadError = (error) => {
  console.error("Nepodařilo se zobrazit obsah webu.", error);
  const message = document.querySelector("[data-content-error]");
  message.textContent = "Informace se nepodařilo zobrazit. Zkuste prosím stránku znovu načíst.";
  message.hidden = false;
};

const contentReady = initializeContent();
contentReady
  .then(({ web }) => initializeHeroCarousel(web ? web.intro.rotate_fruit : true))
  .catch(showPageLoadError);

Promise.allSettled([contentReady, loadHarvestOffer()])
  .then(([content, harvest]) => {
    if (content.status === "rejected") {
      showHarvestLoadError();
      return;
    }
    if (harvest.status === "fulfilled") {
      harvestData = harvest.value;
      renderHarvestOffer(harvestData);
    } else {
      console.error("Nepodařilo se načíst nabídku samosběru.", harvest.reason);
      showHarvestLoadError();
    }
  })
  .catch((error) => {
    showPageLoadError(error);
    showHarvestLoadError();
  });
