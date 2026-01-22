# WP Analyzer – React Frontend (MVP)

Dieses Repository enthält das Frontend des Projekts **WP Analyzer**.  
Die Anwendung dient ausschließlich der **Aufbereitung von WordPress-Inhalten** und stellt eine vorgeschaltete Komponente für die nachgelagerte Analyseanwendung (C/C++) dar.

Der Fokus liegt auf:
- Abruf von WordPress-Seiten über die öffentliche REST-API oder eigene Endpunkte
- Bereinigung und Normalisierung der Inhalte
- Strukturierte Übergabe der aufbereiteten Daten an ein Backend

Die Anwendung ist über folgenden Link erreichbar:
[wp-analyzer.wundersee.dev](https://wp-analyzer.wundersee.dev)

---

## Funktionsumfang (MVP)

- Eingabe einer WordPress-Domain
- Abruf aller Seiten über `/wp-json/wp/v2/pages`
- Abruf über eigenen Endpunkt z.B. `/wp-json/custom/v1/pages`
- Anzeige der Seitenliste inkl. Direktlink zur Originalseite und Anzeige des Datenobjekts
- Auswahl einzelner oder aller Seiten
- DOM-basierte Textextraktion und -bereinigung
- Erzeugung strukturierter Seitenobjekte `{ id, name, url, text }`

Das Frontend übernimmt **keine Analyse**, sondern bereitet ausschließlich die Daten vor.

---

## Technologiestack

- **React** (Vite)
- **Bootstrap 5** (SCSS, JS)
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