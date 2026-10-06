import "./Landing.css";

function Landing() {
  return (
    <main className="landing">
      {/* HERO */}
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

      {/* REALITY SECTION */}
      <section className="reality-section" id="features">
        <div className="reality-intro">
          <p className="section-label">THE PROBLEM</p>

          <h2>
            YOUR PLAN LOOKED
            <br />
            GREAT ON DAY ONE.
          </h2>

          <p className="reality-description">
            You create a task. Give it a deadline. Feel productive. Then reality
            happens.
          </p>
        </div>

        <div className="reality-content">
          <div className="reality-copy">
            <p className="reality-statement">
              Because apparently writing
              <br />
              <strong>"Learn JavaScript"</strong>
              <br />
              on a white rectangle was supposed to change your life.
            </p>

            <p className="reality-small-text">
              Traditional todo apps are great at telling you what needs to be
              done. But they rarely tell you what happened when the original
              plan stopped making sense.
            </p>
          </div>

          <div className="comparison">
            <div className="todo-example traditional">
              <div className="example-header">
                <span>TRADITIONAL TODO</span>
                <span>01</span>
              </div>

              <div className="todo-card">
                <p className="card-title">Learn JavaScript</p>

                <div className="card-status">
                  <span className="checkbox"></span>
                  <span>Pending</span>
                </div>
              </div>
            </div>

            <div className="todo-example drello-example">
              <div className="example-header">
                <span>DRELLO</span>
                <span>02</span>
              </div>

              <div className="todo-card">
                <p className="card-title">Learn JavaScript</p>

                <div className="card-status">
                  <span className="status-dot"></span>
                  <span>Dismissed</span>
                </div>

                <div className="card-history">
                  <span>3 changes</span>
                  <span>12 days</span>
                </div>

                <div className="card-reason">
                  Course wasn't helping anymore.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHANGE SECTION */}
      <section className="change-section" id="about">
        <div className="change-header">
          <div>
            <p className="section-label">WHEN PLANS CHANGE</p>

            <h2>
              THE PLAN
              <br />
              ISN'T THE STORY.
            </h2>
          </div>

          <p className="change-intro">
            A task can move, change, get postponed, or disappear completely.
            Drello keeps track of those decisions instead of pretending they
            never happened.
          </p>
        </div>

        <div className="change-content">
          <div className="change-card">
            <div className="change-card-top">
              <span>01 — ORIGINAL PLAN</span>
              <span>DAY 01</span>
            </div>

            <h3>Learn JavaScript</h3>

            <div className="change-card-status">
              <span className="change-dot"></span>
              To Do
            </div>
          </div>

          <div className="change-line">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="change-card">
            <div className="change-card-top">
              <span>02 — MODIFIED</span>
              <span>DAY 07</span>
            </div>

            <h3>Learn JavaScript properly</h3>

            <div className="change-card-status">
              <span className="change-dot"></span>
              In Progress
            </div>

            <p className="change-note">
              Changed the approach after realizing the original course wasn't
              working.
            </p>
          </div>

          <div className="change-line">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="change-card final-change">
            <div className="change-card-top">
              <span>03 — DECISION</span>
              <span>DAY 12</span>
            </div>

            <h3>Dismissed</h3>

            <div className="change-card-status">
              <span className="change-dot"></span>
              Closed
            </div>

            <p className="change-note">
              The approach wasn't helping anymore. Moving on to something
              better.
            </p>
          </div>
        </div>

        <div className="history-caption">
          <span>3 CHANGES</span>
          <span>12 DAYS</span>
          <span>1 DECISION</span>
        </div>
      </section>

      {/* PHILOSOPHY SECTION */}
      <section className="philosophy-section">
        <div className="philosophy-content">
          <p className="section-label">THE DRELLO APPROACH</p>

          <h2>
            NOT MADE FOR
            <br />
            PERFECT PLANS.
          </h2>

          <div className="philosophy-divider"></div>

          <h3>
            MADE FOR THE
            <br />
            PLANS THAT
            <br />
            ACTUALLY WORK OUT.
          </h3>

          <p className="philosophy-description">
            Your first plan doesn't have to be the right one. Change it. Move
            it. Question it. Drop it. Then keep moving.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Landing;
