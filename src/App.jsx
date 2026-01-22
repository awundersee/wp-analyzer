import DomainForm from "./components/DomainForm.jsx";
import FooterNotice from "./components/FooterNotice.jsx";

function App() {
  return (
    <div className="d-flex flex-column bg-white">
      <main className="flex-grow-1 d-flex align-items-center px-3 min-vh-100 py-4">
        <div className="app-container w-100">
          <div className="content-container list-wrapper">
            <h1 className="ms-2">
              <span className="text-primary fw-bold">WordPress</span> Textanalyse-Tool
            </h1>
            <p className="mb-4 ms-2">
              Die WordPress REST API muss öffentlich erreichbar sein (
              <code>/wp-json/wp/v2/pages</code>). Für eine korrekte Analyse müssen
              die Inhalte vollständig als <code>content</code> in der Datenbank gespeichert sein
              und dürfen nicht vom Template mit <code>meta_fields</code> zusammengesetzt werden.
            </p>
            <DomainForm />
          </div>
        </div>
      </main>

      <FooterNotice />
    </div>
  );
}

export default App;