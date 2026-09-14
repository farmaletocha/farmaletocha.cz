# Předání projektu: modernizovaný web Farma Letocha

> **Stav dokumentu:** 30. 8. 2026  
> **Pracovní adresář:** `C:\data\farmaletocha`  
> **Účel:** úplný kontext pro pokračování v nové relaci bez ztráty vstupů, rozhodnutí, zdrojů a otevřených bodů.

## 1. Rychlé shrnutí stavu

Nová verze webu je dokončená jako responzivní statická prezentace v HTML, CSS a JavaScriptu. Obsahuje nabídku ovoce, příběh farmy, sezonní kalendář, galerii, kontakt, veřejnou nabídku samosběru a statickou e-mailovou rezervaci. Nabídka samosběru je oddělená do `data/samosber.json` a připravená k editaci přes Pages CMS.  
**Zdroj:** [`index.html`](index.html), [`styles.css`](styles.css), [`script.js`](script.js), [`data/samosber.json`](data/samosber.json), [`.pages.yml`](.pages.yml).

Projekt zatím **není Git repozitář**, nebyl vytvořen ani připojen GitHub remote a nová statická verze nebyla nasazena. Dedikovaný GitHub účet a název repozitáře uživatel plánuje teprve vytvořit.  
**Zdroj:** lokální inventura `C:\data\farmaletocha` dne 30. 8. 2026 (`.git` neexistuje); uživatelské rozhodnutí v relaci: „vytvorim na to dedikovany account i na githubu“.

Web `https://farmaletocha.cz/` byl na začátku práce použit jako zdroj ověřených obsahových údajů. Nová verze v tomto adresáři nenahradila současný živý web.  
**Zdroj:** <https://farmaletocha.cz/>, <https://farmaletocha.cz/wp-json/wp/v2/pages?per_page=100>.

### Stav jednotlivých oblastí

| Oblast | Stav | Zdroj |
|---|---|---|
| Statická prezentace | Hotová lokálně | [`index.html`](index.html) |
| Responzivní vzhled | Hotový | [`styles.css`](styles.css) |
| Dynamické termíny samosběru | Hotové | [`script.js`](script.js), [`data/samosber.json`](data/samosber.json) |
| Editor Pages CMS | Připravený, zatím nepřipojený k účtu | [`.pages.yml`](.pages.yml) |
| GitHub Pages | Popsáno, zatím nenasazeno | [`GITHUB-PAGES-CMS.md`](GITHUB-PAGES-CMS.md) |
| Dedikovaný GitHub účet | Plánovaný, název není znám | uživatelské rozhodnutí v relaci |
| Git repozitář a první commit | Neprovedeno | lokální inventura dne 30. 8. 2026 |
| Doména `farmaletocha.cz` | Zatím nepřesměrována na GitHub Pages | lokální projekt neobsahuje `CNAME`; současný web je dostupný na původní doméně |
| Termíny 5., 12. a 19. 9. 2026 | Pouze předběžný návrh | [`data/samosber.json`](data/samosber.json) |
| Nahrazení placeholderů vlastními fotografiemi | Neprovedeno | [`README.md`](README.md), sekce Fotografie a placeholdery |

## 2. Původní požadavky uživatele

Požadavky, které určily současnou podobu projektu:

1. načíst a modernizovat obsah `farmaletocha.cz`,
2. vytvořit krásnou, moderní a profesionálně působící prezentaci,
3. zajistit kvalitní responzivní chování na mobilu,
4. připravit dobrou strukturu, příběh a technické SEO,
5. doplnit meruňky, rybíz, švestky, sady a okolní krajinu,
6. fotorealistické náhradní fotografie jasně označit jako placeholdery,
7. vytvořit veřejnou nabídku samosběru včetně termínů a rezervace,
8. zachovat web jako statický,
9. připravit netechnickou editaci termínů přes Pages CMS,
10. počítat s hostováním na GitHub Pages a dedikovaným GitHub účtem.

**Zdroj:** uživatelská zadání v pracovní relaci dne 30. 8. 2026.

## 3. Ověřené obsahové údaje o farmě

Následující údaje byly převzaty ze současného webu farmy a jeho WordPress REST API:

| Údaj | Použitá hodnota | Ověřený zdroj |
|---|---|---|
| Název | Farma Letocha | <https://farmaletocha.cz/> |
| Provozovatel / kontakt | Leoš Letocha | <https://farmaletocha.cz/wp-json/wp/v2/pages?per_page=100> |
| Telefon | 602 793 987 | <https://farmaletocha.cz/wp-json/wp/v2/pages?per_page=100> |
| E-mail | `leosletocha@seznam.cz` | <https://farmaletocha.cz/wp-json/wp/v2/pages?per_page=100> |
| Lokalita | Bělkovice-Lašťany, mezi Olomoucí a Šternberkem | <https://farmaletocha.cz/> |
| Rozloha sadů | přibližně 9 hektarů | <https://farmaletocha.cz/> |
| Způsob produkce | integrovaná produkce ovoce | <https://farmaletocha.cz/> |
| Hlavní prodejní model | většina produkce se prodává „ze dvora“ | <https://farmaletocha.cz/> |
| Jablka | Topaz, Rajka, Rubinola a Šampion; nabídka od září; Topaz i na uskladnění | <https://farmaletocha.cz/> |
| Švestky | Stanley a Gabrovská; srpen až září; možnost samosběru | <https://farmaletocha.cz/> |
| Meruňky | osm odrůd; postupné dozrávání od konce června do konce srpna; možnost samosběru | <https://farmaletocha.cz/> |
| Černý rybíz | Titánie; sklizeň na přelomu června a července; samosběr po dohodě | <https://farmaletocha.cz/> |
| Ovocné stromky | jarní prodej po telefonické dohodě | <https://farmaletocha.cz/> |

### Důležité omezení obsahu

Přesná adresa farmy, běžná otevírací doba, ceny ovoce, cena samosběru, platební metody, kapacita termínů a závazná pravidla samosběru nebyly na načteném webu ověřeny. Proto nejsou v nové prezentaci vydávány za potvrzená fakta. Přesné místo, dostupnost a podmínky se komunikují při potvrzení rezervace nebo telefonicky.  
**Zdroj:** porovnání obsahu <https://farmaletocha.cz/> a [`index.html`](index.html).

## 4. Technická architektura

Web nemá build systém, framework, databázi ani serverovou aplikační vrstvu. Pro lokální spuštění stačí běžný statický HTTP server.  
**Zdroj:** inventura kořene projektu; nejsou přítomny `package.json`, frameworková konfigurace ani serverový kód.

### Základní datový tok

```text
Pages CMS
   ↓ uloží commit
data/samosber.json
   ↓ fetch při načtení stránky
script.js
   ↓ vytvoří DOM prvky
termínové karty + výběr v rezervačním formuláři
```

**Zdroj:** [`.pages.yml`](.pages.yml), [`data/samosber.json`](data/samosber.json), [`script.js`](script.js).

### Hlavní soubory

| Soubor | Účel | Zdroj |
|---|---|---|
| `index.html` | obsahová a sémantická struktura celé prezentace | [`index.html`](index.html) |
| `styles.css` | desktopové, tabletové a mobilní rozvržení, vizuální systém a stavy komponent | [`styles.css`](styles.css) |
| `script.js` | navigace, animace, sezonní zvýraznění, načtení samosběru, rezervace a galerie | [`script.js`](script.js) |
| `data/samosber.json` | jediný zdroj nabídky a termínů samosběru | [`data/samosber.json`](data/samosber.json) |
| `.pages.yml` | formulář a validační pravidla Pages CMS | [`.pages.yml`](.pages.yml) |
| `.nojekyll` | pokyn GitHub Pages, aby web obsluhoval jako čistou statickou prezentaci | [`.nojekyll`](.nojekyll) |
| `robots.txt` | pravidla pro roboty a odkaz na sitemapu | [`robots.txt`](robots.txt) |
| `sitemap.xml` | sitemap obsahující domovskou stránku | [`sitemap.xml`](sitemap.xml) |
| `site.webmanifest` | metadata instalovatelné webové aplikace | [`site.webmanifest`](site.webmanifest) |
| `README.md` | stručný technický přehled, zdroje obsahu a fotografie | [`README.md`](README.md) |
| `GITHUB-PAGES-CMS.md` | návod k účtu, GitHub Pages a Pages CMS | [`GITHUB-PAGES-CMS.md`](GITHUB-PAGES-CMS.md) |
| `PREDANI-PROJEKTU.md` | tento úplný předávací dokument | tento soubor |

### Lokální spuštění

```powershell
python -m http.server 8080
```

Poté otevřít `http://localhost:8080`. Stránku není vhodné otevírat pouze přes `file://`, protože prohlížeče běžně blokují `fetch()` lokálního souboru `data/samosber.json`.  
**Zdroj:** [`README.md`](README.md), [`script.js`](script.js).

## 5. Pages CMS

Pages CMS je v projektu použitý jako editační vrstva nad soubory v GitHub repozitáři. Oficiální dokumentace popisuje přihlášení přes GitHub, instalaci GitHub App, načtení `.pages.yml` a ukládání změn přímo do repozitáře.  
**Zdroj:** <https://pagescms.org/docs/>, <https://pagescms.org/docs/quick-start/>, <https://pagescms.org/docs/configuration/>.

### Co správce uvidí

Po připojení repozitáře se v Pages CMS zobrazí položka **Samosběr**. Formulář je definovaný v `.pages.yml` a upravuje pouze `data/samosber.json`.  
**Zdroj:** [`.pages.yml`](.pages.yml).

### Editovatelná pole

| Pole | Význam | Zdroj |
|---|---|---|
| `enabled` | zobrazit nebo skrýt celou nabídku samosběru | [`.pages.yml`](.pages.yml), [`script.js`](script.js) |
| `booking_enabled` | zobrazit nebo skrýt e-mailovou rezervaci | [`.pages.yml`](.pages.yml), [`script.js`](script.js) |
| `announcement` | text horního informačního proužku | [`.pages.yml`](.pages.yml), [`index.html`](index.html) |
| `offer_label` | krátký štítek nabídky | [`.pages.yml`](.pages.yml) |
| `title` | hlavní nadpis nabídky | [`.pages.yml`](.pages.yml) |
| `description` | vysvětlení aktuální nabídky | [`.pages.yml`](.pages.yml) |
| `time_summary` | souhrnný čas v pravé části panelu | [`.pages.yml`](.pages.yml) |
| `confirmation_title` | zvýrazněný nadpis upozornění | [`.pages.yml`](.pages.yml) |
| `confirmation_note` | doplňující podmínky potvrzení | [`.pages.yml`](.pages.yml) |
| `empty_message` | text při nulovém počtu viditelných termínů | [`.pages.yml`](.pages.yml) |
| `allow_other_term` | nabídnout ve formuláři volbu jiného termínu | [`.pages.yml`](.pages.yml), [`script.js`](script.js) |
| `slots` | seznam termínů | [`.pages.yml`](.pages.yml), [`data/samosber.json`](data/samosber.json) |

### Pole jednoho termínu

| Pole | Význam | Příklad |
|---|---|---|
| `visible` | zda se termín veřejně zobrazí | `true` |
| `date` | datum ve formátu `YYYY-MM-DD` | `2026-09-12` |
| `start` | začátek ve 24hodinovém formátu | `08:00` |
| `end` | konec ve 24hodinovém formátu | `11:30` |
| `fruit` | druh ovoce | `Švestky` |
| `status` | provozní stav termínu | `preliminary` |
| `note` | volitelný krátký text místo výchozího stavu | `Posledních 10 míst` |

**Zdroj:** [`.pages.yml`](.pages.yml), [`data/samosber.json`](data/samosber.json).

### Podporované stavy

| Interní hodnota | Text v CMS | Chování webu |
|---|---|---|
| `preliminary` | Předběžný | lze vybrat; zdůrazňuje nutnost potvrzení |
| `open` | Otevřený | lze vybrat a rezervovat |
| `full` | Obsazený | viditelný, ale nelze rezervovat |
| `closed` | Rezervace uzavřena | viditelný, ale nelze rezervovat |
| `cancelled` | Zrušený | viditelný jako zrušený, nelze rezervovat |
| `visible: false` | Zobrazit termín vypnuto | veřejně se nevykreslí |

Termín se starším datem, než je aktuální datum v časovém pásmu `Europe/Prague`, se automaticky označí jako proběhlý a nelze jej rezervovat.  
**Zdroj:** [`script.js`](script.js), objekt `slotStatuses`, funkce `getPragueDate()` a `createSlotCard()`.

### Aktuální data

V datovém souboru jsou nyní tři **předběžné a dosud nepotvrzené** termíny samosběru švestek:

- 5. 9. 2026, 8:00–11:30,
- 12. 9. 2026, 8:00–11:30,
- 19. 9. 2026, 8:00–11:30.

**Zdroj:** [`data/samosber.json`](data/samosber.json).

## 6. Rezervační mechanismus

Rezervace je záměrně čistě statická:

1. návštěvník vybere termín,
2. vyplní jméno, telefon, počet osob, předpokládané množství a volitelnou poznámku,
3. JavaScript sestaví předmět a text e-mailu,
4. odkaz `mailto:` otevře e-mailovou aplikaci návštěvníka,
5. alternativně lze údaje zkopírovat nebo zavolat.

Web tyto údaje neposílá do databáze ani do vlastní serverové služby.  
**Zdroj:** [`index.html`](index.html), formulář `data-reservation-form`; [`script.js`](script.js), funkce `buildReservationMessage()` a obsluha `submit`.

### Omezení statické rezervace

- Farma nemá centrální seznam rezervací přímo na webu.
- Web automaticky nehlídá počet volných míst.
- Stav `full` musí správce nastavit ručně v Pages CMS.
- Nelze automaticky zabránit duplicitním žádostem.
- Odeslání závisí na e-mailové aplikaci návštěvníka; proto existuje kopírování a telefonní fallback.
- Automatické potvrzovací e-maily ani online platba nejsou implementovány.

**Zdroj:** [`script.js`](script.js), absence backendu a databázové konfigurace v inventuře projektu.

Pokud bude později požadována skutečná online rezervace s kapacitou, bude nutné doplnit externí formulářovou službu, serverless funkci nebo vlastní backend. To je nové rozhodnutí a nemá se vydávat za součást současné statické verze.  
**Zdroj:** současná architektura v [`script.js`](script.js) a inventura projektu.

## 7. GitHub účet, GitHub Pages a doména

### Rozhodnutý směr

Uživatel plánuje dedikovaný GitHub účet pro Farmu Letocha. Konkrétní název účtu ani repozitáře zatím nebyl sdělen. Konfigurace Pages CMS proto není vázaná na konkrétního vlastníka nebo název repozitáře.  
**Zdroj:** uživatelské rozhodnutí v relaci; [`.pages.yml`](.pages.yml).

### Doporučený postup

1. vytvořit dedikovaný účet,
2. zapnout 2FA a bezpečně uložit recovery kódy,
3. vytvořit veřejný repozitář,
4. inicializovat Git v `C:\data\farmaletocha`,
5. provést první commit,
6. přidat GitHub remote a pushnout `main`,
7. zapnout GitHub Pages z větve `main` a kořene `/`,
8. ověřit stránku na adrese `https://UCET.github.io/REPOZITAR/`,
9. připojit repozitář k Pages CMS,
10. teprve po ověření připravit přechod domény `farmaletocha.cz`.

**Zdroj:** [`GITHUB-PAGES-CMS.md`](GITHUB-PAGES-CMS.md), <https://pagescms.org/docs/quick-start/>, <https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages>.

GitHub doporučuje chránit účet dvoufaktorovým ověřením; oficiální dokumentace doporučuje TOTP a bezpečné uložení recovery kódů.  
**Zdroj:** <https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication>.

### Vlastní doména

GitHub Pages podporuje vlastní apex doménu i `www` subdoménu. GitHub doporučuje doménu před připojením ověřit kvůli ochraně před převzetím a doporučuje nastavit také `www` variantu. Aktuální DNS hodnoty se musí při nasazení převzít z oficiální dokumentace, nikoli ze starého návodu.  
**Zdroj:** <https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages>.

V projektu zatím není soubor `CNAME` a DNS nebylo měněno. Přesměrování domény proto není součástí dokončené práce.  
**Zdroj:** lokální inventura projektu dne 30. 8. 2026.

Všechny GitHub Pages weby se správně nastavenou vlastní doménou podporují HTTPS a v nastavení repozitáře lze HTTPS vynutit.  
**Zdroj:** <https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https>.

### Bezpečnost veřejného repozitáře

Do veřejného repozitáře se nesmí uložit heslo, osobní přístupový token, recovery kódy ani jiné tajné údaje. Projekt v současnosti žádné tajné hodnoty nepotřebuje.  
**Zdroj:** současná statická architektura; upozornění GitHubu k veřejně dostupným Pages webům: <https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https>.

### Náklady

Pages CMS je podle oficiálního projektu open source pod licencí MIT a nabízí hostovanou aplikaci `app.pagescms.org`. Oficiální dokumentace použitá dne 30. 8. 2026 neobsahovala samostatnou stránku s garantovaným budoucím ceníkem; podmínky hostované služby je proto vhodné znovu ověřit při nasazení.  
**Zdroj:** <https://github.com/pages-cms/pages-cms>, <https://pagescms.org/docs/quick-start/>.

Pro GitHub Pages byl zvolen veřejný repozitář. Aktuální plán a případné limity je nutné při vytvoření účtu ověřit na oficiálním GitHub ceníku a dokumentaci. Stávající roční poplatek za registraci domény není součástí tohoto projektu.  
**Zdroj:** plán z této relace; <https://github.com/pricing>, <https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages>.

## 8. SEO a metadata

Implementované prvky:

- český titul a meta description,
- canonical URL `https://farmaletocha.cz/`,
- český `hreflang`,
- Open Graph a Twitter Card,
- lokální OG obrázek 1200 × 630 px,
- JSON-LD `LocalBusiness` / `Organization`,
- JSON-LD `FAQPage`,
- `robots.txt`,
- `sitemap.xml`,
- web manifest a favicon,
- sémantická struktura nadpisů a alternativní texty obrázků,
- responzivní `srcset` pro velké fotografie.

**Zdroj:** [`index.html`](index.html), [`robots.txt`](robots.txt), [`sitemap.xml`](sitemap.xml), [`site.webmanifest`](site.webmanifest).

### SEO body před ostrým nasazením

1. Ověřit, že finální primární doména bude opravdu `https://farmaletocha.cz/`; canonical, sitemap a Open Graph jsou na ni již nastavené.
2. Po nasazení zkontrolovat veřejnou dostupnost `robots.txt`, `sitemap.xml` a OG obrázku.
3. Po stabilizaci domény odeslat sitemapu do Google Search Console a Seznam Webmaster.
4. Pokud bude dočasně dostupná pouze projektová URL GitHub Pages, zachovat canonical na finální doménu pouze tehdy, pokud je přechod na doménu bezprostředně plánovaný.
5. Po získání skutečných sezonních fotografií znovu vytvořit OG obrázek.

**Zdroj:** [`index.html`](index.html), [`robots.txt`](robots.txt), [`sitemap.xml`](sitemap.xml), [`README.md`](README.md).

## 9. Fotografie

### Reálné fotografie farmy

| Lokální soubor | Původní zdroj |
|---|---|
| `assets/images/orchard-real-01.webp` | <https://farmaletocha.cz/wp-content/uploads/2026/01/sady01-1536x1152.jpg> |
| `assets/images/orchard-real-02.webp` | <https://farmaletocha.cz/wp-content/uploads/2026/01/sady02-1536x1152.jpg> |
| `assets/images/farm-real.webp` | <https://farmaletocha.cz/wp-content/uploads/2026/01/farma.jpg> |
| `assets/images/portrait-real.webp` | <https://farmaletocha.cz/wp-content/uploads/2026/01/kontakt.png> |
| `assets/images/logo-transparent.png` | odvozeno z <https://farmaletocha.cz/wp-content/uploads/2026/01/cropped-farma-letocha-logo-1.jpg> |

**Zdroj:** WordPress media API <https://farmaletocha.cz/wp-json/wp/v2/media?per_page=100>, [`README.md`](README.md).

### Fotorealistické placeholdery

Po nevyhovujících testech bezklíčového generování byly pro profesionální vzhled vybrány licencované fotografie z Unsplash. Testovací výstupy byly odstraněny. Všechny placeholdery jsou uvnitř snímku i v rozhraní označené jako fotografie, které nejsou z Farmy Letocha.  
**Zdroj:** [`README.md`](README.md), aktuální inventura `assets/images`, označení v [`index.html`](index.html).

| Lokální soubor | Autor a zdroj |
|---|---|
| `hero-orchard-placeholder.webp` | Hasti Jahanara / <https://unsplash.com/photos/rows-of-apple-trees-heavy-with-ripe-fruit-9kfN3-4BaL4> |
| `apricots-placeholder.webp` | Linus Belanger / <https://unsplash.com/photos/apricots-ripen-on-a-tree-branch-against-blue-sky-dvtir2hldyY> |
| `plums-placeholder.webp` | Zulfugar Karimov / <https://unsplash.com/photos/ripe-plums-hanging-from-a-tree-branch-VCFmlcpvNvg> |
| `blackcurrants-placeholder.webp` | Bermix Studio / <https://unsplash.com/photos/a-bunch-of-black-berries-hanging-from-a-tree-rntSEgrGg18> |
| `surroundings-placeholder.webp` | Dawid Zawiła / <https://unsplash.com/photos/panorama-photography-of-green-hills-L3sh5N6Lqzo> |

Licenční zdroj: <https://unsplash.com/license>.

### Pravidlo pro výměnu

Při výměně je nejjednodušší zachovat názvy souborů a poměry stran. U velkých snímků je potřeba obnovit také zmenšené varianty `-800.webp` nebo `-900.webp`, protože je používá `srcset`. Placeholderové štítky se u skutečných fotografií farmy musí odstranit z obrázku i z HTML popisku.  
**Zdroj:** [`index.html`](index.html), adresář `assets/images`.

## 10. Responzivita, přístupnost a výkon

Web používá responzivní přechody zejména na šířkách 1120, 940, 720 a 480 px. Mobilní verze má samostatné menu, jednosloupcovou rezervaci a pevné tlačítko pro telefonát.  
**Zdroj:** [`styles.css`](styles.css), příslušné `@media` bloky.

Implementováno je:

- odkaz „Přeskočit na hlavní obsah“,
- viditelné focus stavy,
- popisky formulářových polí,
- alternativní texty obrázků,
- respektování `prefers-reduced-motion`,
- dialog galerie ovladatelný klávesou Escape,
- bezpečný obsah bez JavaScriptu pro termíny,
- responzivní obrázky WebP.

**Zdroj:** [`index.html`](index.html), [`styles.css`](styles.css), [`script.js`](script.js).

## 11. Dosud provedená validace

Validace proběhla lokálně 30. 8. 2026.

| Kontrola | Výsledek | Reprodukční příkaz nebo zdroj |
|---|---|---|
| Syntaxe JavaScriptu | bez chyby | `node --check .\script.js` |
| Syntaxe `data/samosber.json` | validní JSON | `python -c "import json; json.load(open('data/samosber.json', encoding='utf-8'))"` |
| Syntaxe `.pages.yml` | `YAML Lint successful` | `npx --yes yaml-lint .pages.yml` |
| Lokální assety a kotvy | žádný chybějící soubor, kotva ani duplicitní ID | vlastní kontrolní skript přes Python `html.parser` |
| JSON-LD | dva validní bloky | Python `json.loads()` nad bloky v `index.html` |
| Manifest | validní JSON | Python `json.loads()` |
| Sitemap | validní XML | Python `xml.etree.ElementTree.parse()` |
| Responzivní šířky | bez horizontálního přetečení na 320, 390, 768, 1024 a 1440 px | headless Chrome přes DevTools Protocol |
| Mobilní menu | otevření a zavření funguje | headless Chrome |
| Výběr termínu | karta vyplní formulář a zvýrazní se | headless Chrome |
| Kopírování rezervace | funguje přes Clipboard API nebo fallback | headless Chrome |
| Načtení CMS dat | 3 karty a 5 položek formuláře na 390 i 1440 px | headless Chrome |
| Stavy CMS | otevřený lze rezervovat; obsazený a zrušený nelze; skrytý se nevykreslí | headless Chrome s testovacími daty |
| Vypnutá nabídka | nabídka i formulář se skryjí | headless Chrome s testovacími daty |

Žádný testovací server neběží na pozadí; všechny lokální servery byly po validaci zastaveny.  
**Zdroj:** dokončení validačních příkazů v relaci dne 30. 8. 2026.

## 12. Otevřené body před publikací

### Nutné

1. **Získat název dedikovaného GitHub účtu a repozitáře.** Bez těchto údajů nelze nastavit remote ani publikovat.
2. **Potvrdit nebo změnit termíny samosběru.** Současné zářijové termíny jsou pouze návrh.
3. **Rozhodnout o typu repozitáře.** Dosavadní plán počítá s veřejným repozitářem.
4. **Inicializovat Git a vytvořit první commit.**
5. **Pushnout větev `main` na GitHub.**
6. **Zapnout GitHub Pages.**
7. **Připojit Pages CMS a provést reálnou testovací změnu.**
8. **Ověřit kontakt a e-mail před zveřejněním.** Hodnoty odpovídají současnému webu, ale vlastník je má potvrdit.
9. **Připravit bezpečný přechod DNS.** Nejdříve ověřit GitHub Pages URL, potom doménu a HTTPS.

### Doporučené

1. Nahradit placeholdery vlastními fotografiemi z farmy.
2. Doplnit přesnou cenu, platební metody a pravidla samosběru až po potvrzení farmou.
3. Rozhodnout, zda statická e-mailová rezervace dlouhodobě postačuje.
4. Po nasazení zkontrolovat Lighthouse / Core Web Vitals na veřejné HTTPS URL.
5. Přidat analytiku pouze pokud je potřeba a současně vyřešit související soukromí a cookies.
6. Odeslat sitemapu vyhledávačům.

## 13. Doporučený začátek příští relace

Nová relace má postupovat v tomto pořadí:

1. Přečíst `PREDANI-PROJEKTU.md`.
2. Zkontrolovat, zda uživatel vytvořil dedikovaný GitHub účet a repozitář.
3. Vyžádat si pouze:
   - název účtu,
   - název repozitáře,
   - zda má být repozitář veřejný,
   - zda jsou předběžné termíny potvrzené.
4. Ověřit, že v adresáři stále není cizí nebo neočekávaná změna.
5. Inicializovat Git pouze po potvrzení cílového repozitáře.
6. Vytvořit první smysluplný commit.
7. Připojit remote a publikovat `main`.
8. Zapnout GitHub Pages a ověřit projektovou URL.
9. Přihlásit dedikovaný účet do Pages CMS, nainstalovat GitHub App pouze pro tento repozitář a otestovat změnu termínu.
10. Až potom řešit `farmaletocha.cz`, DNS, `CNAME`, ověření domény a HTTPS.

## 14. Pravidla pro další úpravy

1. Termíny se běžně upravují pouze přes `data/samosber.json` nebo Pages CMS, ne ručně v `index.html`.
2. Při přidání nového stavu termínu je nutné změnit současně `.pages.yml` a mapu `slotStatuses` v `script.js`.
3. Neuvádět neověřené ceny, dostupnost, otevírací dobu ani přesnou adresu jako fakta.
4. Každý externí placeholder musí zůstat jasně označený, dokud nebude nahrazen skutečnou fotografií farmy.
5. Zachovat relativní cesty k assetům, aby fungovala projektová GitHub Pages URL i vlastní doména.
6. Do repozitáře neukládat přihlašovací údaje ani tokeny.
7. Veškerou projektovou dokumentaci udržovat v češtině a věcná tvrzení doplňovat zdrojem.

## 15. Registr externích zdrojů

### Farma Letocha

- <https://farmaletocha.cz/>
- <https://farmaletocha.cz/wp-json/wp/v2/pages?per_page=100>
- <https://farmaletocha.cz/wp-json/wp/v2/media?per_page=100>

### Pages CMS

- <https://pagescms.org/docs/>
- <https://pagescms.org/docs/quick-start/>
- <https://pagescms.org/docs/configuration/>
- <https://pagescms.org/docs/configuration/content/>
- <https://pagescms.org/docs/configuration/content/fields/>
- <https://pagescms.org/docs/configuration/content/list/>
- <https://pagescms.org/docs/configuration/fields/date/>
- <https://pagescms.org/docs/configuration/fields/object/>
- <https://pagescms.org/docs/configuration/fields/select/>
- <https://pagescms.org/docs/configuration/settings/>
- <https://github.com/pages-cms/pages-cms>

### GitHub Pages a účet

- <https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages>
- <https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages>
- <https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https>
- <https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication>
- <https://github.com/pricing>

### Fotografie

- <https://unsplash.com/license>
- <https://unsplash.com/photos/rows-of-apple-trees-heavy-with-ripe-fruit-9kfN3-4BaL4>
- <https://unsplash.com/photos/apricots-ripen-on-a-tree-branch-against-blue-sky-dvtir2hldyY>
- <https://unsplash.com/photos/ripe-plums-hanging-from-a-tree-branch-VCFmlcpvNvg>
- <https://unsplash.com/photos/a-bunch-of-black-berries-hanging-from-a-tree-rntSEgrGg18>
- <https://unsplash.com/photos/panorama-photography-of-green-hills-L3sh5N6Lqzo>
