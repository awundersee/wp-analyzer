export default function DomainForm() {
  return (
    <section
      id="footer-notice"
      className="bg-light disclaimer-wrapper z-0 start-0 end-0 bottom-0"
    >
      <div className="container-fluid">
        <div className="p-lg-4 p-3 ps-md-0 pe-md-0 text-secondary text-center">
          <div className="row">
            <div className="col-xl-8 offset-xl-2 col-lg-10 offset-lg-1 fw-light">
              <small>
                <p>
                Bei dieser Webseite handelt es sich um eine Projektarbeit. Zu Testzwecken 
                kann der individuelle API-Endpunkt meiner Webseite genutzt werden:
                <br />
                <span className="text-dark">https://bureau.wundersee.com/api/pages</span>
                </p>
                ©2026{" "}
                <a
                  href="https://bureau.wundersee.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Andreas Wundersee
                </a>
                {" "}| <a href="https://bureau.wundersee.com/impressum" className="text-secondary text-decoration-none" target="_blank">Impressum</a>
                {" "}| <a href="https://bureau.wundersee.com/datenschutzbelehrung" className="text-secondary text-decoration-none" target="_blank">Datenschutz</a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}