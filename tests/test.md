# 📊 Mitt første Mermaid-kart

Dette er en visualisering av hvordan appen min snakker med databasen.

```mermaid
graph TD
    %% Her definerer vi boksene og kablene
    App[📱 Brukergrensesnitt / Frontend] -->|1. Bruker trykker på en knapp| Controller(⚙️ App-logikk / Controller)
    
    Controller -->|2. Ber om data| API{🌐 API Endepunkt}
    
    API -->|3. Validerer forespørsel| DB[(🗄️ Database)]
    
    %% Returveien med notater på kablene
    DB -->|4. Sender rådata i retur| API
    API -->|5. Formaterer til JSON| Controller
    Controller -->|6. Oppdaterer skjermen| App

    %% Litt farge og stil (valgfritt)
    style App fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    style DB fill:#008CBA,stroke:#333,stroke-width:2px,color:#fff
    style API fill:#f44336,stroke:#333,stroke-width:2px,color:#fff
```

## 📝 Mine Notater til koden over:
- **Appen** er det brukeren ser på skjermen sin.
- **API-et** fungerer som en sikkerhetsvakt for databasen.
- Hvis jeg endrer databasestrukturen, må jeg huske å oppdatere punkt **4** og **5**.
