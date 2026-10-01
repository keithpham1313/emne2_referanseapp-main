# Emne 2-måten å bygge en applikasjon

Dette dokumentet beskriver den måten vi bygger frontend-applikasjoner på i Emne 2 ved GET Academy.

Dokumentet skal kunne brukes:

- av studenter som referanse under utvikling
- av lærere i undervisning
- sammen med egen kode når en student ber KI evaluere løsningen
- som grunnlag for å be KI lage eller forbedre en Emne 2-applikasjon

Det er derfor viktig at både **arkitekturen** og **det tekniske nivået** i dette dokumentet følges.

Målet er ikke å bruke mest mulig moderne JavaScript.

Målet er å bruke enkle teknikker studentene allerede kjenner, samtidig som vi lærer gode prinsipper for modellering, dataflyt og struktur.

---

# 1. Hva Emne 2 handler om

I Emne 2 går vi fra å kunne programmere enkeltstående funksjoner til å lage en fungerende applikasjon for en kunde.

Vi trener blant annet på:

- kundedialog
- analyse
- skjermbilder
- modellering
- frontend-arkitektur
- teamarbeid
- Git/GitHub
- testing
- iterativ utvikling

Den overordnede prosessen er:

**kundebehov → tekstlig oppsummering → skjermbilder → modell → implementasjon**

Vi prøver å redusere usikkerhet steg for steg før vi skriver mye kode.

---

# 2. Fra kundebehov til modell

Vi starter ikke med modellen.

Vi starter med brukerens behov og skjermbildene.

For hvert skjermbilde spør vi:

1. Hva må vises?
2. Hva holder brukeren på med akkurat nå?
3. Hva kan brukeren gjøre?
4. Hva må modellen kunne huske eller endre når brukeren gjør dette?

På denne måten lar vi skjermbildene hjelpe oss å finne modellen.

Et viktig prinsipp er:

> Ikke finn på modellen separat fra brukergrensesnittet.  
> La skjermbildene og brukerhandlingene fortelle hva modellen trenger.

---

# 3. Den overordnede modellen

Vi bruker én global variabel som heter:

```js
const model = {
};
```

Den ligger i en egen fil:

```text
model.js
```

En typisk modell ser slik ut:

```js
const model = {
    app: {
        currentPage: 'contactsPage',
    },

    viewState: {
        contactsPage: {
            searchText: '',
        },

        editContactPage: {
            contactId: null,
            name: '',
            phone: '',
            email: '',
        },
    },

    contacts: [],
    groups: [],
    memberships: [],
};
```

Vi bruker altså tre hovedtyper informasjon:

- `model.app`
- `model.viewState`
- domenedata direkte på `model`

Vi bruker ikke nødvendigvis et ekstra `data`-objekt rundt domenedataene.

---

# 4. `model.app`

`model.app` inneholder state som gjelder hele applikasjonen.

Eksempel:

```js
app: {
    currentPage: 'contactsPage',
    loggedInUserId: null,
}
```

Typiske verdier her er:

- hvilken side som vises
- hvilken bruker som er logget inn
- annen state som gjelder hele applikasjonen

Ikke legg DOM-elementer her.

Dette er feil:

```js
app: document.getElementById('app')
```

`model` skal inneholde state og data, ikke referanser til HTML-elementer.

---

# 5. `model.viewState`

`viewState` beskriver hva brukeren holder på med akkurat nå.

Eksempel:

```js
viewState: {
    editContactPage: {
        contactId: 1,
        name: 'Terje',
        phone: '12345678',
        email: 'terje@example.com',
    },
}
```

Dette er ikke nødvendigvis de lagrede dataene.

Det er et arbeidsutkast.

Hvis kontakten i `model.contacts` heter:

```js
{
    id: 1,
    name: 'Terje'
}
```

og brukeren har begynt å endre navnet til:

```text
Terje K
```

skal ikke kontaktobjektet endres ennå.

I stedet skal:

```js
model.viewState.editContactPage.name
```

inneholde:

```js
'Terje K'
```

Først når brukeren trykker Lagre, endrer controlleren de faktiske domenedataene.

Dette gjør blant annet Avbryt enkelt å implementere.

## Lokal referanse til sidens state

Når samme `model.viewState.sidenavn` brukes mer enn én gang i en funksjon,
trekker vi den ut i en lokal variabel med det faste navnet `viewState`:

```js
function clearEditContactViewState() {
    const viewState = model.viewState.editContactPage;
    viewState.contactId = null;
    viewState.name = '';
    viewState.phone = '';
    viewState.email = '';
    viewState.selectedGroupIds = [];
}
```

`viewState` viser til samme objekt; det er ingen kopi eller ekstra state.
Navnet er lokalt for funksjonen og viser til siden funksjonen tilhører.
Vi bruker dette navnet konsekvent fremfor lokale navn som `draft`.
Lokale variabler skrives med liten forbokstav, for eksempel `const viewState`.
Selve modellfeltet heter fortsatt `viewState` med liten v, og den globale
variabelen heter fortsatt `model`. Ved bare ett oppslag trengs ikke et alias.

I et view kan `${viewState.name}` brukes mens HTML-strengen bygges.
En inline-hendelse som `oninput` kjøres senere og har ikke tilgang til den lokale
variabelen. Der bruker vi fortsatt `model.viewState.editContactPage.name`.

---

# 6. Domenedata

De faktiske tingene applikasjonen handler om ligger direkte på `model`.

Eksempel:

```js
contacts: [
    {
        id: 1,
        name: 'Terje',
        phone: '12345678',
        email: 'terje@example.com',
    },
],

groups: [
    {
        id: 1,
        name: 'Sykling',
    },
],
```

Eksempler på domenedata kan være:

- contacts
- groups
- students
- courses
- products
- orders
- users

Som hovedregel har vi én liste per entitetstype.

---

# 7. Unngå dype datastrukturer

Vi prøver å unngå at objekter inneholder store kopier av andre objekter.

Dette er ofte uheldig:

```js
contacts: [
    {
        id: 1,
        name: 'Terje',
        groups: [
            {
                id: 1,
                name: 'Sykling',
            },
            {
                id: 2,
                name: 'Reising',
            },
        ],
    },
]
```

Da finnes gruppeinformasjonen flere steder.

I stedet bruker vi egne lister.

---

# 8. Koble entiteter sammen med ID-er

Eksempel:

```js
contacts: [
    { id: 1, name: 'Terje' },
],

groups: [
    { id: 1, name: 'Sykling' },
    { id: 2, name: 'Reising' },
],

memberships: [
    { contactId: 1, groupId: 1 },
    { contactId: 1, groupId: 2 },
],
```

`memberships` beskriver relasjonen mellom kontakter og grupper.

Det samme prinsippet kan brukes på:

```text
students
courses
enrollments
```

eller:

```text
orders
products
orderItems
```

Bruk ID-er for å referere til andre entiteter.

Ikke kopier hele objektet.

---

# 9. Bruk ID, ikke array-indeks

En handling skal normalt identifisere et objekt med ID.

Bra:

```js
editContact(17)
deleteContact(17)
showOrder(1336)
```

Mindre bra:

```js
editContact(3)
```

dersom `3` bare betyr «element nummer 3 i arrayen».

Array-rekkefølgen kan endres når vi søker, sorterer eller filtrerer.

ID identifiserer objektet.

---

# 10. Ikke lagre avledede data

Modellen skal inneholde det vi må huske.

Den trenger ikke inneholde alt som skal vises.

Hvis vi har:

```js
contacts: [
    { id: 1, name: 'Terje' },
    { id: 2, name: 'Per' },
]
```

og:

```js
model.viewState.contactsPage.searchText
```

trenger vi ikke også lagre:

```js
model.filteredContacts
```

Den filtrerte listen kan beregnes når viewet tegnes.

Det samme gjelder blant annet:

- filtrerte lister
- totalpris
- antall elementer
- gruppenavn til en kontakt
- medlemmer i en gruppe
- summer
- gjennomsnitt

Hovedregel:

> Hvis verdien enkelt kan beregnes fra annen state, bør vi vanligvis beregne den.

---

# 11. Én sannhet

Unngå å lagre de samme opplysningene flere steder.

Hvis et produkt finnes i:

```js
products: [
    {
        id: 7,
        name: 'Cappuccino',
        price: 45,
    }
]
```

bør handlekurven vanligvis bare lagre:

```js
{
    productId: 7,
    quantity: 2,
}
```

Ikke:

```js
{
    productId: 7,
    productName: 'Cappuccino',
    productPrice: 45,
    quantity: 2,
}
```

Navn og pris kan finnes ved hjelp av `productId`.

---

# 12. View

Viewets oppgave er å:

> lese modellen og lage HTML.

View skal ikke inneholde forretningslogikk som endrer domenedata.

En hovedfunksjon heter:

```js
function updateView() {
}
```

Denne ser på:

```js
model.app.currentPage
```

og kaller riktig under-view.

Eksempel:

```js
function updateView() {
    if (model.app.currentPage === 'contactsPage') {
        updateViewContactsPage();
    }
    else if (model.app.currentPage === 'editContactPage') {
        updateViewEditContactPage();
    }
    else if (model.app.currentPage === 'groupsPage') {
        updateViewGroupsPage();
    }
}
```

---

# 13. Sidefunksjoner heter `updateView...`

Eksempel:

```js
function updateViewContactsPage() {
}
```

```js
function updateViewEditContactPage() {
}
```

```js
function updateViewGroupsPage() {
}
```

Hver funksjon bygger HTML og skriver den til:

```js
document.getElementById('app').innerHTML
```

---

# 14. HTML i JavaScript

Vi bruker template strings med backticks.

Ved lengre HTML legger vi `/*HTML*/` foran:

```js
const html = /*HTML*/`
    <div>
        <h1>Kontakter</h1>
    </div>
`;
```

Dette gjør at editoren lettere kan syntax-highlighte HTML-en.

---

# 15. Små komponentfunksjoner

Når samme HTML-struktur brukes flere ganger, lager vi gjerne en funksjon.

Vi bruker også hjelpefunksjoner for å gjøre selve sideviewet oversiktlig.
Sideviewet viser sidestrukturen i én sammenhengende HTML-template, og delene
settes rett inn med `${...}`. Løkker og håndtering av tomme lister ligger i
hjelpefunksjonene.

Eksempel på et forenklet kontaktview:

```js
function updateViewContactsPage() {
    const contacts = getFilteredContacts();
    document.getElementById('app').innerHTML = /*HTML*/`
        <h1>Kontakter</h1>
        <button onclick="startNewContact()">Ny kontakt</button>
        <div class="cards">
            ${createContactsHtml(contacts)}
        </div>
    `;
}

function createContactsHtml(contacts) {
    if (contacts.length === 0) {
        return '<p>Ingen kontakter å vise.</p>';
    }
    let html = '';
    for (let contact of contacts) {
        html += createContactHtml(contact);
    }
    return html;
}
```

Listen sendes inn som parameter. En hjelpefunksjon kan ikke lese en lokal
variabel inne i funksjonen som kaller den.

Samme mønster brukes for eksempel med `${createGroupsHtml()}`,
`${createGroupCheckboxesHtml()}` og `${createGroupMembersHtml(contacts)}`.
Hjelpefunksjonene returnerer HTML; sideviewet skriver den til `#app`.
De skal ikke endre domenedata.

Dette etterligner litt måten vi setter sammen komponenter i Vue eller React:
en del av visningen settes inn i en større visning. Her er hver slik del en
vanlig JavaScript-funksjon som returnerer en HTML-streng.

Trekk ut deler når det gjør sidestrukturen lettere å lese, også når delen bare
brukes ett sted. Vi trenger ikke en egen funksjon for hver HTML-tag.

Eksempel:

```js
function createContactHtml(contact) {
    return /*HTML*/`
        <div>
            <h3>${contact.name}</h3>
            <div>${contact.phone}</div>

            <button onclick="startEditContact(${contact.id})">
                Rediger
            </button>
        </div>
    `;
}
```

I Emne 2 betyr «komponent» ofte bare:

> en funksjon som returnerer HTML

Vi introduserer ikke et komponentrammeverk.

---

# 16. Controller

Controller-funksjoner håndterer brukerhandlinger.

Eksempler:

```js
startNewContact()
startEditContact(contactId)
saveContact()
deleteContact(contactId)
createGroup()
```

En controller-funksjon skal typisk:

1. lese fra `model`
2. endre `model`
3. kalle `updateView()`

Controlleren skal ikke bygge HTML.

---

# 17. Den grunnleggende dataflyten

Dette er en sentral idé i Emne 2:

```text
USER ACTION
     ↓
CONTROLLER
     ↓
MODEL CHANGES
     ↓
updateView()
     ↓
NEW HTML
```

Eller:

**brukerhandling → controller → modell → view**

Viewet leser modellen.

Controlleren endrer modellen.

---

# 18. Input kan skrive direkte til viewState

Enkle inputfelt kan oppdatere `viewState` direkte.

Eksempel:

```html
<input
    value="${model.viewState.editContactPage.name}"
    oninput="model.viewState.editContactPage.name = this.value"
/>
```

Dette er greit fordi vi bare oppdaterer midlertidig view state.

Vi skal derimot ikke endre domenedata direkte fra HTML-eventet.

## Input lagrer state; knapper utløser handlinger

Tekstfeltets `oninput` skal bare lagre verdien i state. Det skal ikke kalle
`updateView()` eller en funksjon som tegner siden på nytt. Når HTML erstattes
etter hvert tastetrykk, mister feltet fokus. Vi introduserer ikke kode for
markørposisjon eller gjenoppretting av fokus for å løse dette.

Bruk i stedet en knapp ved siden av feltet. Noen ganger er `updateView()` hele
handlingen, slik som ved filtrering:

```js
function updateViewContactsPage() {
    const viewState = model.viewState.contactsPage;
    const contacts = getFilteredContacts();
    document.getElementById('app').innerHTML = /*HTML*/`
        <label for="search">Søk</label>
        <div class="search-row">
            <input id="search" value="${escapeHtml(viewState.searchText)}"
                oninput="model.viewState.contactsPage.searchText = this.value">
            <button onclick="updateView()">Filtrer</button>
        </div>
        ${createContactsHtml(contacts)}
    `;
}
```

Her brukes hjelpefunksjonene fra referanseappen. CSS plasserer felt og knapp
på samme rad med litt mellomrom. Andre skjemaer har en Lagre- eller Opprett-knapp
som kaller controlleren. En avkrysning kan oppdatere utkastet via `onchange`
uten ny tegning; nettleseren viser allerede den endrede avkrysningen.

---

# 19. viewState som arbeidsutkast

Når en kontakt skal redigeres:

```js
function startEditContact(contactId) {
    const contact = findObjectById(model.contacts, contactId);

    const viewState = model.viewState.editContactPage;
    viewState.contactId = contact.id;
    viewState.name = contact.name;
    viewState.phone = contact.phone;
    viewState.email = contact.email;

    model.app.currentPage = 'editContactPage';

    updateView();
}
```

Brukeren redigerer nå `viewState`.

Den lagrede kontakten endres først ved Lagre.

---

# 20. Nullstill viewState tydelig

Lag gjerne egne funksjoner:

```js
function clearEditContactViewState() {
    const viewState = model.viewState.editContactPage;
    viewState.contactId = null;
    viewState.name = '';
    viewState.phone = '';
    viewState.email = '';
    viewState.selectedGroupIds = [];
}
```

Bruk denne når det gjør koden tydeligere.

---

# 21. Lag nye objekter ved domenendringer

Vi ønsker å unngå unødvendig mutasjon av eksisterende domenedata.

Når en kontakt lagres, lag et nytt objekt:

```js
const viewState = model.viewState.editContactPage;
const updatedContact = {
    id: contactId,
    name: viewState.name,
    phone: viewState.phone,
    email: viewState.email,
};
```

Ikke bruk:

```js
contact.name = ...
contact.phone = ...
```

dersom det enkelt kan unngås.

---

# 22. Nye arrays ved lagring, `splice` ved sletting

Ved oppretting og redigering foretrekker vi å lage nye arrays. Ved sletting
velger vi `splice`, som endrer den eksisterende arrayen. Dette er et bevisst
valg fordi det gir kort og lettlest kode. Mutasjon er ikke generelt forbudt.

På dette tidspunktet i kurset bruker vi løkker.

Eksempel:

```js
const newContacts = [];

for (let contact of model.contacts) {
    if (contact.id === contactId) {
        newContacts.push(updatedContact);
    } else {
        newContacts.push(contact);
    }
}

model.contacts = newContacts;
```

Dette er bevisst eksplisitt kode.

Senere kan samme kode skrives kortere med andre JavaScript-teknikker.

## Sletting med `splice`

Handlingen tar fortsatt inn en ID. Vi finner objektet med `findObjectById`,
finner plasseringen med `indexOf`, og sletter med `splice(index, 1)`:

```js
function deleteContact(contactId) {
    const contact = findObjectById(model.contacts, contactId);
    if (contact !== null) {
        const index = model.contacts.indexOf(contact);
        model.contacts.splice(index, 1);
    }

    for (let i = model.memberships.length - 1; i >= 0; i--) {
        if (model.memberships[i].contactId === contactId) {
            model.memberships.splice(i, 1);
        }
    }
    updateView();
}
```

Indeksen brukes bare til selve array-operasjonen; ID-en identifiserer kontakten.
Vi sjekker at kontakten finnes, så vi ikke ender med `splice(-1, 1)`, som ville
slettet siste element.

Når flere elementer skal slettes, går vi baklengs. Ved sletting flyttes senere
elementer én plass mot starten. En løkke som går forlengs kan derfor hoppe over
et treff. Baklengs gjennomgang unngår dette, også når treffene ligger ved siden
av hverandre.

Et alternativ er å samle ID-ene som skal slettes først, og deretter finne og
slette hvert objekt. Da må vi finne plasseringen på nytt for hver sletting;
gamle indekser kan ha endret seg. For medlemskapene over er baklengs løkke enklest.

`splice` beholder selve arrayen, men endrer innholdet. Andre referanser til den
samme arrayen ser også slettingen. Testene skal gjenspeile dette valget.

---

# 23. JavaScript-nivået i Emne 2

Det er viktig at løsninger og KI-forslag bruker teknikker studentene faktisk kjenner.

Vi bruker gjerne:

- variabler
- objekter
- arrays
- funksjoner
- `if` / `else`
- `for`
- `for...of`
- `push`
- `splice` til sletting
- `includes`
- `indexOf`
- template strings
- `getElementById`
- inline `onclick`
- inline `oninput`
- inline `onchange`

Vi bruker enkle hjelpefunksjoner for å skjule repeterende løkkelogikk.

---

# 24. Dette skal ikke brukes ennå

KI skal ikke foreslå eller innføre følgende i en Emne 2-løsning på dette tidspunktet:

## JavaScript modules

Ikke bruk:

```js
import
export
```

Ikke bruk:

```html
<script type="module">
```

---

## Node / npm / Vite

Ikke bruk:

- Node
- npm
- package.json
- Vite
- build scripts
- bundlere

Applikasjonen skal kunne kjøres som vanlige HTML- og JavaScript-filer.

---

## `map()`

Ikke bruk:

```js
array.map(...)
```

Bruk en løkke i stedet.

---

## `filter()`

Ikke bruk:

```js
array.filter(...)
```

Ved filtrering for visning bygger vi en ny resultatliste med en løkke.
Ved sletting bruker vi `splice`, som beskrevet i del 22.

---

## `find()`

Ikke bruk:

```js
array.find(...)
```

Lag heller en hjelpefunksjon:

```js
function findObjectById(array, id) {
    for (let object of array) {
        if (object.id === id) {
            return object;
        }
    }

    return null;
}
```

Senere kan studenten lære at dette kan skrives kortere med `find()`.

---

## `reduce()`

Ikke bruk `reduce()`.

Bruk en løkke.

---

## Spread syntax

Ikke bruk:

```js
{ ...object }
```

eller:

```js
[...array]
```

Lag objekter og arrays eksplisitt.

---

## `Object.assign()`

Ikke bruk:

```js
Object.assign(...)
```

Kopier felter eksplisitt.

---

## Avansert DOM-kode

Unngå unødvendig:

```js
querySelector()
querySelectorAll()
addEventListener()
```

når enkel Emne 2-kode med:

```js
getElementById()
onclick
oninput
onchange
```

er tilstrekkelig.

---

## Ekstra rammeverk og infrastruktur

Ikke introduser:

- React
- Vue
- Angular
- Svelte
- TypeScript
- state management-bibliotek
- router-bibliotek
- dependency injection
- services
- repositories
- factories
- classes som arkitekturmønster
- backend
- database
- API
- localStorage
- async/await
- Promises

med mindre oppgaven eksplisitt handler om dette.

---

## Unødvendige tilgjengelighetsattributter

Ikke legg inn ekstra:

```html
aria-label
aria-describedby
role
tabindex
```

som studenten ikke har lært.

Dette betyr ikke at tilgjengelighet er uviktig.

Det betyr bare at denne undervisningen har et annet faglig fokus.

---

# 25. Hjelpefunksjoner fremfor avansert syntax

Hvis koden blir omstendelig med løkker, trekk den ut i en hjelpefunksjon.

Eksempel:

```js
function getGroupsForContact(contactId) {
    const groups = [];

    for (let membership of model.memberships) {
        if (membership.contactId === contactId) {
            const group = findObjectById(
                model.groups,
                membership.groupId
            );

            if (group != null) {
                groups.push(group);
            }
        }
    }

    return groups;
}
```

Da kan resten av koden være enkel:

```js
const groups = getGroupsForContact(contact.id);
```

Det er bedre enn én kort, men avansert expression studenten ikke forstår.

---

# 26. Kommentarer om senere JavaScript er greit

Det er lov å kommentere at kode kan skrives enklere senere.

For eksempel:

```js
// Later this could be written shorter using Array.filter().
```

eller:

```js
// Later this could be simplified with map() and spread syntax.
```

Men løsningen skal fortsatt bruke teknikkene som er beskrevet i dette dokumentet.

---

# 27. `common.js`

Generelle hjelpefunksjoner kan ligge i:

```text
common.js
```

Eksempler:

```js
findObjectById(array, id)
getNextId(array)
```

Hold filen liten.

Ikke lag et stort utility-bibliotek.

---

# 28. Filstruktur

En typisk app kan ha:

```text
index.html
style.css

model.js
common.js

contactsPageView.js
contactsPageController.js

editContactPageView.js
editContactPageController.js

groupsPageView.js
groupsPageController.js

```

Filer lastes inn med vanlige:

```html
<script src="model.js"></script>
```

i riktig rekkefølge.

---

# 29. Sidevalg og oppstart i `index.html`

Legg `updateView()` og oppstartskallet i en vanlig script-tag nederst i
`index.html`, etter script-tagene som laster de andre JavaScript-filene.
Da er oppstarten og sidevalget samlet på ett sted.

Eksempel:

```html
<script>
function updateView() {
    if (model.app.currentPage === 'contactsPage') {
        updateViewContactsPage();
    }
    else if (model.app.currentPage === 'editContactPage') {
        updateViewEditContactPage();
    }
    else if (model.app.currentPage === 'groupsPage') {
        updateViewGroupsPage();
    }
}

updateView();
</script>
```

Dette er nok routing for denne typen SPA.

---

# 30. Testing med QUnit

Studentene har lært QUnit.

Vi bruker derfor QUnit, ikke Vitest.

Testing skal kunne skje i nettleseren uten Node eller npm.

Controller-/modell-logikk bør være mulig å teste uten DOM.

Eksempel:

```js
QUnit.test('deleteContact removes contact', function(assert) {
    // arrange

    // act

    // assert
});
```

Hvis controlleren kaller `updateView()`, kan testmiljøet bruke en enkel tom funksjon:

```js
function updateView() {
}
```

slik at domenelogikken kan testes isolert.

---

# 31. Hva bør testes?

Eksempler:

- opprette kontakt
- redigere kontakt
- slette kontakt
- slette alle tilhørende medlemskap, også flere treff ved siden av hverandre
- forsøke å slette en ukjent ID uten å slette feil objekt
- opprette gruppe
- oppdatere medlemskap
- `findObjectById`
- `getNextId`
- andre rene hjelpefunksjoner

Test først og fremst logikk, ikke HTML.

---

# 32. Git og arbeidsflyt

Bruk GitHub gjennom hele arbeidet.

Commit og push ofte.

En god tommelfingerregel er å committe når noe konkret fungerer.

Dette gjør det lettere å:

- samarbeide
- gå tilbake
- forstå hva som er endret
- unngå store konflikter

I denne fasen holder vi Git-bruken enkel.

---

# 33. Når KI evaluerer en løsning

Når dette dokumentet gis til KI sammen med studentens kode, skal KI evaluere løsningen ut fra **denne arkitekturen og dette tekniske nivået**.

KI skal blant annet se etter:

- ligger app-state riktig?
- ligger midlertidig input-state i `viewState`?
- ligger domenedata direkte i `model`?
- brukes ID-er mellom entiteter?
- finnes unødvendige dype strukturer?
- er data kopiert flere steder?
- lagres avledede verdier?
- brukes array-indeks som identitet?
- endrer view domenedata?
- bygger controller HTML?
- er controlleren unødvendig avhengig av DOM?
- brukes avansert JavaScript studentene ikke har lært?
- brukes import/export?
- brukes Node/npm/Vite?
- brukes `map`, `filter`, `find` eller `reduce`?
- brukes spread syntax?
- brukes `Object.assign`?
- kunne avansert kode vært erstattet av en enkel løkke og en hjelpefunksjon?
- kan sideviewet bli tydeligere med HTML-hjelpefunksjoner satt inn via `${...}`?
- bruker sletting `splice`, med baklengs løkke når flere treff skal fjernes?

KI skal ikke «modernisere» løsningen ved å introdusere teknikker som dette dokumentet eksplisitt sier at vi ikke bruker.

KI skal heller ikke foreslå å erstatte `splice` bare for å unngå mutasjon.
Sletting med `splice` er en del av den valgte kodestilen.

---

# 34. Hvordan KI bør gi tilbakemelding

Tilbakemeldingen bør være pedagogisk.

Ikke bare skriv:

> Dette kan forbedres.

Forklar:

- hvilket prinsipp som brytes
- hvorfor det er et problem
- hvordan det kan gjøres på Emne 2-måten

Eksempel:

> `filteredContacts` trenger ikke ligge i modellen. Den kan beregnes fra `contacts` og `searchText` hver gang viewet tegnes. Da unngår vi å ha to versjoner av samme informasjon.

Eller:

> Her brukes `filter()` til å finne søketreff. Studentene har ikke lært `filter()` ennå. Lag i stedet en ny array og fyll den ved hjelp av en `for...of`-løkke. Legg gjerne løkken i en hjelpefunksjon. Hvis hensikten er sletting, bruker vi `splice`.

---

# 35. Ikke overkompliser

Når to løsninger begge fungerer, foretrekker vi vanligvis den studenten lettest kan forstå.

Ikke legg inn abstraksjon bare fordi den er «renere».

Spør heller:

> Gjør dette koden lettere å forstå for en student på dette nivået?

Hvis svaret er nei, la være.

---

# 36. Den viktigste mentale modellen

Hele Emne 2-arkitekturen kan oppsummeres slik:

```text
MODEL
  ↓
VIEW
  ↓
USER
  ↓
CONTROLLER
  ↓
MODEL
```

Mer konkret:

```text
USER ACTION
     ↓
CONTROLLER
     ↓
MODEL CHANGES
     ↓
updateView()
     ↓
NEW HTML
```

Og modellen kan igjen forstås slik:

```text
model.app
    =
state for hele applikasjonen

model.viewState
    =
det brukeren holder på med akkurat nå

model.contacts / groups / products / orders / ...
    =
de faktiske domenedataene
```

Hvis denne strukturen er tydelig, har applikasjonen som regel et godt utgangspunkt.

---

# 37. Sjekkliste for studenten

Før du anser løsningen som ferdig, spør:

- Har jeg én global `model`?
- Har jeg `model.app` for state som gjelder hele appen?
- Har jeg `model.viewState` for midlertidig state per side?
- Bruker jeg det lokale navnet `viewState` når samme sidestate gjentas i en funksjon?
- Lagrer tekstinput bare til state, med en egen knapp for handling eller ny tegning?
- Ligger domenedataene i egne arrays?
- Har objektene ID-er?
- Bruker jeg ID-er til å koble objekter?
- Har jeg unngått unødvendig nesting?
- Har jeg unngått dobbeltlagring?
- Beregner jeg verdier som ikke trenger å lagres?
- Bruker jeg ID fremfor array-indeks?
- Leser view modellen uten å endre domenedata?
- Endrer controller modellen uten å bygge HTML?
- Kaller controlleren `updateView()` etter relevante endringer?
- Bruker jeg `updateView()` som hovedfunksjon for sidevalg?
- Har jeg trukket ut gjentatt HTML i små funksjoner der det er nyttig?
- Viser sideviewet sidestrukturen tydelig, med deler satt inn via `${...}`?
- Ligger løkker og tomtilfeller for HTML-lister i passende hjelpefunksjoner?
- Bruker jeg `splice` ved sletting og unngår å hoppe over treff når flere slettes?
- Har jeg trukket ut kompliserte løkker i hjelpefunksjoner?
- Har jeg unngått `map`, `filter`, `find` og `reduce`?
- Har jeg unngått spread syntax og `Object.assign`?
- Har jeg unngått modules, Node, npm og Vite?
- Kan sentral controller-logikk testes med QUnit uten DOM?

Hvis svarene stort sett er ja, følger løsningen Emne 2-måten godt.

---

# 38. Hovedprinsippet

Emne 2-måten er ikke ment som den eneste riktige måten å bygge JavaScript-applikasjoner på.

Det er en **pedagogisk arkitektur** som gjør det mulig å lære viktige prinsipper tidlig:

- state
- dataflyt
- MVC-tenkning
- modellering
- relasjoner
- komponenter
- separasjon av ansvar
- testing

Senere vil studentene lære flere JavaScript-teknikker og andre frontend-arkitekturer.

I Emne 2 holder vi bevisst teknologien enkel slik at vi kan konsentrere oss om **hvordan en applikasjon er bygget opp og hvorfor**.
