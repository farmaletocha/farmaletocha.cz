# Modernizovaný web Farma Letocha

> **Pokračování v nové relaci:** nejdříve přečtěte [`PREDANI-PROJEKTU.md`](PREDANI-PROJEKTU.md). Obsahuje úplný stav, rozhodnutí, zdroje, omezení a otevřené kroky.

Statická, responzivní prezentace farmy bez externích knihoven. Obsahuje:

- moderní jednostránkovou strukturu s jasnými výzvami k zavolání,
- přehled ovoce, orientační kalendář sklizně a veřejnou nabídku samosběru,
- statickou rezervaci, která připraví e-mailovou žádost bez ukládání osobních údajů na webu,
- galerii reálných fotografií a zřetelně označených fotorealistických placeholderů,
- technické SEO: metadata, Open Graph, strukturovaná data, `robots.txt`, `sitemap.xml`,
- mobilní navigaci, přístupné ovládání a omezení animací podle nastavení uživatele.

## Lokální spuštění

```powershell
python -m http.server 8080
```

Web bude dostupný na `http://localhost:8080`.

## Ověřené obsahové zdroje

Fakta použitá v textech vycházejí ze stávajícího webu Farmy Letocha, načteného 30. 8. 2026:

- domovská stránka: <https://farmaletocha.cz/>
- WordPress REST API – stránky: <https://farmaletocha.cz/wp-json/wp/v2/pages?per_page=100>
- WordPress REST API – média: <https://farmaletocha.cz/wp-json/wp/v2/media?per_page=100>

Z těchto zdrojů byly převzaty zejména kontaktní údaje, lokalita, rozloha sadů, režim integrované produkce, pěstované druhy a odrůdy, období sklizně a možnosti samosběru.

## Fotografie a placeholdery

### Reálné fotografie převzaté ze stávajícího webu

| Soubor | Zdroj |
|---|---|
| `orchard-real-01.webp` | <https://farmaletocha.cz/wp-content/uploads/2026/01/sady01-1536x1152.jpg> |
| `orchard-real-02.webp` | <https://farmaletocha.cz/wp-content/uploads/2026/01/sady02-1536x1152.jpg> |
| `farm-real.webp` | <https://farmaletocha.cz/wp-content/uploads/2026/01/farma.jpg> |
| `portrait-real.webp` | <https://farmaletocha.cz/wp-content/uploads/2026/01/kontakt.png> |
| `logo-transparent.png` | odvozeno z <https://farmaletocha.cz/wp-content/uploads/2026/01/cropped-farma-letocha-logo-1.jpg> |

### Fotorealistické placeholdery z Unsplash

Tyto ilustrační fotografie jsou použity podle [Unsplash License](https://unsplash.com/license). Uvnitř obrázku i na webu jsou označeny jako `FOTOGRAFICKÝ PLACEHOLDER` a textem, že nejde o snímek Farmy Letocha:

| Soubor | Autor a zdroj | Doporučená reálná náhrada |
|---|---|---|
| `hero-orchard-placeholder.webp` | Hasti Jahanara / [Unsplash](https://unsplash.com/photos/rows-of-apple-trees-heavy-with-ripe-fruit-9kfN3-4BaL4) | široký letní záběr vlastního sadu |
| `apricots-placeholder.webp` | Linus Belanger / [Unsplash](https://unsplash.com/photos/apricots-ripen-on-a-tree-branch-against-blue-sky-dvtir2hldyY) | detail zralých meruněk na farmě |
| `plums-placeholder.webp` | Zulfugar Karimov / [Unsplash](https://unsplash.com/photos/ripe-plums-hanging-from-a-tree-branch-VCFmlcpvNvg) | detail odrůd Stanley nebo Gabrovská |
| `blackcurrants-placeholder.webp` | Bermix Studio / [Unsplash](https://unsplash.com/photos/a-bunch-of-black-berries-hanging-from-a-tree-rntSEgrGg18) | hrozen rybízu Titánie před sklizní |
| `surroundings-placeholder.webp` | Dawid Zawiła / [Unsplash](https://unsplash.com/photos/panorama-photography-of-green-hills-L3sh5N6Lqzo) | panorama pořízené přímo od farmy |

Pro snadnou výměnu zachovejte názvy souborů, poměr stran a formát WebP. Doporučené rozlišení zdrojových fotografií je alespoň 2400 × 1600 px.

## Nabídka a rezervace samosběru

Termíny a text nabídky jsou uložené pouze v `data/samosber.json`. Soubor je napojený na Pages CMS pomocí `.pages.yml`, takže jej běžný správce upravuje přes webový formulář na <https://app.pagescms.org> bez zásahu do HTML nebo JavaScriptu.

Připravené termíny 5., 12. a 19. září 2026 jsou návrh nabídky pro veřejnost, nikoli ověřené provozní termíny. Před zveřejněním je nutné, aby je farma potvrdila podle zralosti ovoce, počasí a své kapacity.

Rezervace je plně statická:

1. návštěvník vybere termín a vyplní kontaktní údaje,
2. JavaScript připraví e-mail adresovaný na `leosletocha@seznam.cz`,
3. návštěvník odešle žádost ze svého e-mailového programu,
4. alternativně může údaje zkopírovat nebo zavolat na telefon farmy.

Web žádné údaje neposílá na vlastní server a nikde je neukládá. Karty termínů i výběrové pole rezervace se automaticky generují ze stejného datového souboru.

Kompletní postup vytvoření dedikovaného účtu, zapnutí GitHub Pages a připojení Pages CMS je v souboru [`GITHUB-PAGES-CMS.md`](GITHUB-PAGES-CMS.md).

## Nasazení

Na webový server se nahraje `index.html`, `styles.css`, `script.js`, SEO soubory a celý adresář `assets`. Po nasazení je vhodné odeslat `https://farmaletocha.cz/sitemap.xml` do Google Search Console a Seznam Webmaster.
