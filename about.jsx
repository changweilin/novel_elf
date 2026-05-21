(function () {
  "use strict";

  const links = [
    {
      label: "GitHub",
      href: "https://github.com/changweilin",
      icon: "https://www.google.com/s2/favicons?sz=64&domain_url=https://github.com/changweilin"
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/wei-lin-chang-ba38049a/",
      icon: "https://www.google.com/s2/favicons?sz=64&domain_url=https://www.linkedin.com/in/wei-lin-chang-ba38049a/"
    },
    {
      label: "Demo Link",
      href: "https://changweilin.github.io/demo_link/",
      icon: "https://www.google.com/s2/favicons?sz=64&domain_url=https://changweilin.github.io/demo_link/"
    }
  ];

  function AevenAboutMe({ compact = false } = {}) {
    return (
      <section className={`about-folio ${compact ? "is-compact" : ""}`} aria-labelledby="about-me-title">
        <div className="about-shell">
          <div className="about-heading">
            <p className="about-kicker">About Me</p>
            <h2 id="about-me-title">Chang Wei Lin</h2>
          </div>

          <div className="about-copy">
            <p className="about-motto">我愛星空至深，無懼黑夜。</p>
            <figure className="about-quote">
              <blockquote>We have loved the stars too fondly to fear the dark.</blockquote>
              <figcaption>&mdash; &lt;The Old Astronomer&gt; Sarah Williams</figcaption>
            </figure>
          </div>

          <nav className="about-links" aria-label="Chang Wei Lin links">
            {links.map((link) => (
              <a key={link.href} className="about-link" href={link.href} target="_blank" rel="noopener noreferrer">
                <img src={link.icon} alt="" aria-hidden="true" loading="lazy" referrerPolicy="no-referrer" />
                <span>{link.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </section>
    );
  }

  window.AevenAboutMe = AevenAboutMe;
})();
