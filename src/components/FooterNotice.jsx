export default function DomainForm() {
  return (
    <section
      id="footer-notice"
      className="bg-light position-fixed w-100 disclaimer-wrapper z-0 start-0 end-0 bottom-0"
    >
      <div className="container-fluid">
        <div className="p-lg-4 p-3 ps-md-0 pe-md-0 text-secondary text-center">
          <div className="row">
            <div className="col-xl-8 offset-xl-2 col-lg-10 offset-lg-1 fw-light">
              <small>
                Bei dieser Webseite handelt es sich um eine Projektarbeit.
                <br />
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