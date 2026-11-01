(() => {
  "use strict";

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  loadJson("web", (data) => validateOperator(data?.operator))
    .then((operator) => {
      bindWebCopy({ operator });
      document.querySelectorAll("[data-privacy-email]").forEach((link) => {
        link.textContent = operator.privacy_email;
        link.href = getEmailLink({ email: operator.privacy_email }, false, "Ochrana osobních údajů");
      });
    })
    .catch((error) => {
      console.error("Nepodařilo se načíst údaje správce osobních údajů.", error);
      document.querySelectorAll("[data-privacy-email]").forEach((link) => {
        link.removeAttribute("href");
        link.setAttribute("aria-disabled", "true");
      });
      const message = document.querySelector("[data-privacy-error]");
      message.textContent = "Aktuální údaje správce se nepodařilo načíst. Zkuste prosím stránku znovu načíst.";
      message.hidden = false;
    });
})();
