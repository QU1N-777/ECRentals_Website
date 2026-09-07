import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "POPIA Privacy Notice | EC Rentals",
  description: "How EC Rentals collects, uses and stores personal information under POPIA.",
};

export default function Privacy() {
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <div className="rule" />
          <p className="eyebrow" style={{ marginBottom: 14 }}>Legal</p>
          <h1>POPIA privacy notice</h1>
          <p className="pagehead__lede">
            How we collect, use and store personal information under the Protection of Personal
            Information Act, 2013.
          </p>
        </div>
      </section>

      <section className="g-black">
        <div className="wrap legal">
          <h2>What we collect</h2>
          <p>
            When you submit an enquiry we collect your name, company, email address, telephone
            number, delivery site or town, and any notes you provide. We also record the items on
            your enquiry, the date and time of submission, and the IP address it was sent from.
          </p>

          <h2>Why we collect it</h2>
          <p>
            Solely to respond to your enquiry, prepare a quotation and, if you proceed, arrange
            hire. We do not sell personal information, and we do not use it for marketing unless
            you separately ask us to.
          </p>

          <h2>Who sees it</h2>
          <p>
            Your enquiry is sent to our general and sales inboxes and stored in our systems.
            Access is limited to EC Rentals staff who need it in order to respond. Our website and
            database are hosted by third-party providers who process data on our instruction.
          </p>

          <h2>How long we keep it</h2>
          <p>
            Enquiry records are retained for as long as needed to respond and to meet our legal
            and accounting obligations. Where an enquiry does not proceed, records are reviewed
            and removed once they no longer serve a purpose.
          </p>

          <h2>Your rights</h2>
          <p>
            You may ask what personal information we hold about you, ask us to correct it, or ask
            us to delete it where we have no legal reason to keep it. Write to{" "}
            <a href="mailto:info@ecrentals.co.za">info@ecrentals.co.za</a>.
          </p>

          <h2>Security</h2>
          <p>
            Enquiry data is stored in a database that is not publicly readable. Submissions are
            validated and written server-side, and access is restricted.
          </p>

          <p className="legal__note">
            <b>Draft for legal review.</b> This notice is written from how the site actually
            works. EC Rentals should have it reviewed, and the company registration and
            Information Officer details added, before launch.
          </p>
        </div>
      </section>
    </>
  );
}
