import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="hero">
        {/* Hero content */}
        <div className="hero-content">
          <h1>Dream it.
            <br/>
            Plan it.
            <br/>
            <span>Roam.</span>
          </h1>

          <p>From your first idea to your final itinerary, RoamReady keeps your trip organized in one place. </p>
          
          <div className="hero-actions" >
            <Link href="/signup" className="start-button">Start Planning</Link>
            <Link href="/features" className="explore-button">Explore Features</Link>
          </div>
        </div>          {/* End of Hero content */}

        <div className="hero-image"> 
          {/* Add image for hero content*/}
          <img src="/images/hero.jpg" alt="hero image"></img>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
       <h2> How it works:</h2>
        <p>Plan your trip in three easy steps.</p>

        <div className="steps">
          <div className="step">
            <span className="step-one">1</span>
            <h3>Create a trip.</h3>
            <p>Choose your destination and travel dates.</p>
          </div>
          <div className="step">
            <span className="step-two">2</span>
            <h3>Build your plan.</h3>
            <p>Organize your itinerary, budget, and packing lists.</p>
          </div>
          <div className="step">
            <span className="step-three">3</span>
            <h3>Roam.</h3>
            <p>Keep your plans together wherever you go.</p>
          </div>
        </div>
      </section>

      {/* Why RoamReady */}
      <section className="why-roamready">
        <h2>Why RoamReady?</h2>
        <p> Everything you need for a smoother, safer trip.</p>
        
        <div className="feature-grid">
          <article className="feature-card">
            <img src="/images/flight.jpg" alt="Airplane above the clouds"></img>
            {/*flights not fights lol */}
            <div className="feature-content">
              <h3>Flights</h3>
              <p>Find and compare travel options.</p>
              <Link href="/flights">Explore Flights →</Link>
            </div>
          </article>

        {/*Hotels*/}
        <article className="feature-card">
            <img src="/images/hotel.jpg" alt="Hotel with a swimming pool"/>
            <div className="feature-content">
              <h3>Hotels</h3>
              <p>Find stays that fit your destination.</p>
              <Link href="/hotel">Explore Hotels  →</Link>
            </div>
          </article>
          
        {/*Transportation*/}
        <article className="feature-card">
            <img src="/images/transportation.jpg" alt="City train"/>
            <div className="feature-content">
              <h3>Transportation</h3>
              <p>Explore ways to get around your destination.</p>
              <Link href="/transportation">Explore Transportation  →</Link>
            </div>
          </article>

        {/*Packages*/}
        <article className="feature-card">
            <img src="/images/packages.jpg" alt="Vacation destinations"/>
            <div className="feature-content">
              <h3>Packages</h3>
              <p>Explore packages for your next adventure.</p>
              <Link href="/packages">Explore Packages  →</Link>
            </div>
          </article>

        {/*Budget*/}
        <article className="feature-card">
            <img src="/images/budget.jpg" alt="MNotebook for planning travel expenses"/>
            <div className="feature-content">
              <h3>Budget</h3>
              <p>Track your spending and stay within your trip budget.</p>
              <Link href="/budget">Manage Budget →</Link>
            </div>
          </article>

        {/*Itinerary*/}
        <article className="feature-card">
            <img src="/images/itinerary.jpg" alt="Map used to plan trips"/>
            <div className="feature-content">
              <h3>Itinerary</h3>
              <p>Keep activities and plans organized.</p>
              <Link href="/itinerary">View Itinerary →</Link>
            </div>
          </article>

        {/*Packing*/}
        <article className="feature-card">
            <img src="/images/packing.jpg" alt="Packing travel essentials"/>
            <div className="feature-content">
              <h3>Packing</h3>
              <p>Build packing lists for every trip.</p>
              <Link href="">Build a Packing List →</Link>
            </div>
          </article>

        {/*Safety*/}
        <article className="feature-card">
            <img src="/images/safety.jpg" alt="Safety image"/>
            <div className="feature-content">
              <h3>Safety</h3>
              <p>Stay informed about safety concerns and common scams.</p>
              <Link href="">Explore Safety →</Link>
            </div>
          </article>

        </div>
      </section> 

      {/* Ready to Start your adventure */}
      <section className="ready-start" id="ready-start">
        <h2>Ready to start your adventure?</h2>
        <p>Join RoamReady and turn your travel plans into real memories.</p>
        <div className="create-account">
          <Link href="/signup" className="signup-button">Create Your Free Account</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>Plan smarter. Travel safer.</p>
         <p>Copyright 2026 RoamReady. All rights reserved.</p>

         <div className="footer-links">
          <Link href="/about">About</Link>
          <Link href="/features">Features</Link>
         </div>

      </footer>


    </main>
    
  );
}
