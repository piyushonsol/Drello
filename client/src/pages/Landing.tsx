import "./Landing.css";

function Landing() {
  return (
    <main className="landing">
      <section className="hero">
        <nav className="navbar">
          <div className="logo">DRELLO</div>

          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="/login">Login</a>
          </div>

          <button className="nav-button">Get Started</button>
        </nav>

        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-label">A DIFFERENT KIND OF TODO</p>

            <h1>
              BUILT FOR PLANS.
              <br />
              DESIGNED FOR
              <br />
              PROGRESS.
            </h1>

            <p className="hero-description">
              Because apparently writing "Learn JavaScript" on a white rectangle
              was supposed to change your life.
            </p>

            <button className="hero-button">Get Started</button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Landing;
