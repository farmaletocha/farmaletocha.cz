# Správa webu přes GitHub Pages a Pages CMS

Tento web je připravený jako čistě statická prezentace pro GitHub Pages. Nabídka samosběru se spravuje přes formulář Pages CMS a ukládá se do jediného souboru `data/samosber.json`.

## 1. Založení dedikovaného GitHub účtu

1. Založte účet určený pouze pro Farmu Letocha.
2. Zapněte dvoufázové ověření.
3. Vytvořte veřejný repozitář, například `farmaletocha-web`.
4. Nahrajte do něj celý obsah tohoto adresáře včetně skrytých souborů `.pages.yml` a `.nojekyll`.

Do repozitáře nikdy neukládejte hesla, přístupové tokeny ani jiné tajné údaje.

## 2. Zapnutí GitHub Pages

1. V repozitáři otevřete **Settings → Pages**.
2. V části **Build and deployment** zvolte **Deploy from a branch**.
3. Vyberte větev `main` a adresář `/ (root)`.
4. Uložte nastavení.

GitHub následně zveřejní prezentaci na adrese ve tvaru:

`https://NAZEV-UCTU.github.io/farmaletocha-web/`

Po otestování lze v nastavení Pages připojit doménu `farmaletocha.cz`.

## 3. Připojení Pages CMS

1. Otevřete <https://app.pagescms.org>.
2. Přihlaste se dedikovaným GitHub účtem.
3. Povolte Pages CMS přístup pouze k repozitáři s webem.
4. Vyberte příslušný repozitář a větev `main`.
5. V levém menu se zobrazí položka **Samosběr**.

Pages CMS načítá formulář z konfiguračního souboru `.pages.yml` v kořeni repozitáře.

## 4. Běžná úprava nabídky

V položce **Samosběr** lze bez práce s kódem:

- zapnout nebo skrýt celou nabídku,
- povolit nebo vypnout e-mailovou rezervaci,
- upravit text v horním informačním proužku,
- přidat, upravit, skrýt nebo odstranit termín,
- změnit datum, čas a druh ovoce,
- nastavit stav termínu na předběžný, otevřený, obsazený, uzavřený nebo zrušený.

Po stisknutí **Save** Pages CMS uloží změnu jako commit do GitHubu. GitHub Pages potom automaticky publikuje novou verzi.

## 5. Chování jednotlivých stavů

| Stav | Chování na webu |
|---|---|
| Předběžný | Termín lze vybrat, ale web zdůrazní nutnost potvrzení farmou. |
| Otevřený | Termín lze vybrat a rezervovat. |
| Obsazený | Termín zůstane viditelný, ale nelze jej rezervovat. |
| Rezervace uzavřena | Termín zůstane viditelný bez možnosti rezervace. |
| Zrušený | Termín se zobrazí jako zrušený a nelze jej rezervovat. |
| Zobrazit termín vypnuto | Termín se veřejnosti vůbec nezobrazí. |

Termíny se starším datem se automaticky označí jako proběhlé a nelze je rezervovat.

## 6. Důležité soubory

| Soubor | Účel |
|---|---|
| `.pages.yml` | Definice formuláře pro Pages CMS |
| `data/samosber.json` | Aktuální nabídka a seznam termínů |
| `script.js` | Načtení dat a vytvoření termínových karet |
| `index.html` | Statická struktura prezentace |

## Ověřené zdroje

- Pages CMS – úvod a princip ukládání do GitHubu: <https://pagescms.org/docs/>
- Pages CMS – konfigurace `.pages.yml`: <https://pagescms.org/docs/configuration/>
- Pages CMS – soubory a kolekce: <https://pagescms.org/docs/configuration/content/>
- Pages CMS – seznamy a opakované objekty: <https://pagescms.org/docs/configuration/content/list/>
- GitHub Pages – princip statického hostingu: <https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages>
