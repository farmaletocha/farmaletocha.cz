(() => {
  "use strict";

  const measurementId = "G-33V24NLD2W";
  const host = window.location.hostname;
  const allowedHosts = ["farmaletocha.github.io", "farmaletocha.cz", "www.farmaletocha.cz"];
  const isReview = host === "farmaletocha.github.io";

  if (
    window.location.protocol !== "https:" ||
    !allowedHosts.includes(host) ||
    (isReview && !window.location.pathname.startsWith("/farmaletocha.cz/"))
  ) {
    console.info("Analytics is disabled for local previews and unrelated hosts.");
    return;
  }
  if (document.getElementById("farm-ga4-tag")) return;

  // Enhanced Measurement can read URL parameters outside page_location overrides.
  const campaignFields = new Map([
    ["utm_source", "campaign_source"],
    ["utm_medium", "campaign_medium"],
    ["utm_campaign", "campaign_name"],
    ["utm_content", "campaign_content"],
    ["utm_id", "campaign_id"],
    ["utm_term", "campaign_term"]
  ]);
  const clickIdKeys = new Set(["fbclid", "gclid", "dclid", "msclkid", "gbraid", "wbraid", "igshid", "igsh"]);
  const campaignOverrides = {};
  const cleanCampaignValue = (value) => {
    const text = value.trim();
    const digits = text.replace(/\D/g, "");
    const phone = /^\+?[\d\s().-]+$/.test(text) && digits.length >= 9 && digits.length <= 15 &&
      (text.startsWith("+") || text.startsWith("00") || text.startsWith("420") || /[\s().-]/.test(text));
    return /[@<>\r\n]|(?:https?:|mailto:|tel:)/i.test(text) || phone ? "redacted" : text.slice(0, 100);
  };
  const query = [...new URLSearchParams(window.location.search)];
  const safeQuery = new Set(query.map(([key]) => key)).size === query.length &&
    query.every(([key, value]) => {
      if (campaignFields.has(key)) {
        campaignOverrides[campaignFields.get(key)] = cleanCampaignValue(value);
        return true;
      }
      if (key === "gtm_debug") return /^(?:1|true|x|\d{10,13})$/.test(value);
      const minimum = key === "igshid" || key === "igsh" ? 6 : 16;
      return clickIdKeys.has(key) && value.length >= minimum &&
        /^[a-z0-9_-]{1,512}$/i.test(value) && /[a-z]/i.test(value);
    });
  let safeFragment = true;
  if (window.location.hash) {
    try {
      safeFragment = Boolean(document.getElementById(decodeURIComponent(window.location.hash.slice(1))));
    } catch (error) {
      safeFragment = false;
      console.warn("Analytics ignored an invalid URL fragment.", error);
    }
  }
  if (!safeQuery || !safeFragment) {
    console.info("Analytics is disabled for URLs with unsupported parameters or fragments.");
    return;
  }

  let referrer = "";
  if (document.referrer) {
    try {
      const url = new URL(document.referrer);
      if (["https:", "http:"].includes(url.protocol)) referrer = url.origin;
    } catch (error) {
      console.warn("Analytics ignored an invalid referrer.", error);
    }
  }

  const pageData = {
    page_location: `${window.location.origin}${window.location.pathname}`,
    page_referrer: referrer,
    page_title: document.title,
    content_group: isReview ? "review" : "production"
  };
  let available = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  const track = (name, parameters = {}) => {
    if (!available) return;
    window.gtag("event", name, { ...pageData, ...parameters, send_to: measurementId });
  };

  const linkArea = (link) => {
    if (link.closest(".mobile-call")) return "mobile";
    if (link.closest(".site-header")) return "header";
    if (link.closest(".site-footer")) return "footer";
    if (link.closest("[data-faq-section]")) return "faq";
    const section = link.closest("section")?.id;
    return ["uvod", "farma", "ovoce", "sezona", "samosber", "rezervace", "kontakt"].includes(section)
      ? section
      : "other";
  };

  document.addEventListener("click", (event) => {
    const link = event.target?.closest?.("a[href]");
    if (!link) return;
    if (link.matches("[data-navigation-link], [data-map-link]")) {
      track("directions_click", {
        link_area: linkArea(link),
        map_action: link.hasAttribute("data-navigation-link") ? "directions" : "map"
      });
    } else if (link.getAttribute("href").toLowerCase().startsWith("mailto:")) {
      track("contact_email_click", { link_area: linkArea(link) });
    }
  });
  document.addEventListener("farma:reservation-email-prepared", () => {
    track("reservation_email_prepared");
  });

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    ...pageData,
    ...campaignOverrides,
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_domain: "none",
    cookie_flags: "SameSite=Lax;Secure"
  });
  track("page_view");

  const script = document.createElement("script");
  script.id = "farm-ga4-tag";
  script.async = true;
  script.referrerPolicy = "origin";
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.addEventListener("error", () => {
    available = false;
    console.error("Google Analytics could not be loaded; the website remains available without measurement.");
  });
  document.head.append(script);
})();
