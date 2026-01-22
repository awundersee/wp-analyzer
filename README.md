# WP Analyzer – React Frontend (MVP)

Dieses Repository enthält das Frontend des Projekts **WP Analyzer**.  
Die Anwendung dient ausschließlich der **Aufbereitung von WordPress-Inhalten** und stellt eine vorgeschaltete Komponente für die nachgelagerte Analyseanwendung (C/C++) dar.

Der Fokus liegt auf:
- Abruf von WordPress-Seiten über die öffentliche REST-API
- Bereinigung und Normalisierung der Inhalte
- Strukturierter Übergabe der aufbereiteten Daten an ein Backend

---

## Funktionsumfang (MVP)

- Eingabe einer WordPress-Domain
- Abruf aller Seiten über `/wp-json/wp/v2/pages`
- Anzeige der Seitenliste inkl. Direktlink zur Originalseite
- Auswahl einzelner oder aller Seiten
- DOM-basierte Textextraktion und -bereinigung
- Erzeugung strukturierter Seitenobjekte `{ id, name, url, text }`

Das Frontend übernimmt **keine Analyse**, sondern bereitet ausschließlich die Daten vor.

---

## Technologiestack

- **React** (Vite)
- **Bootstrap 5** (SCSS)
- **Sass** für Variablen-Overrides und eigenes Styling
- **Fetch API** für REST-Zugriffe
- **DOMParser** zur HTML-Textbereinigung

---

## Projektstruktur (Auszug)

```text
src/
├─ api/              # WordPress- und Backend-API-Zugriffe
├─ components/       # React UI-Komponenten
├─ services/         # Textaufbereitung & Seitenobjekte
├─ styles/           # Bootstrap-Overrides + App-Styles (Sass)
├─ utils/            # Hilfsfunktionen (z.B. URL-Normalisierung)
├─ App.jsx
└─ main.jsx