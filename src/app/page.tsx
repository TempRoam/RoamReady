"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/* Module 
   A. Module Name: RoamReady HomePage 
   B. Date Created:  September           Date Last Modified: November 13th
   C. Programmer: Gisselle Francisco 
   D. Brief Description of Module
      Displays the RoamReady landing page with a rotating destination image, three trip-planning steps, eight feature cards, a signup call to action, and footer links. 
        
      This module consists of two files.
      src/app/itinerary/page.tsx
      src/app/itinerary/global.css

   E. Important Functions and Components
      Home() takes no props and returns the JSX for the landing page. A useEffect callback starts a timer that advances the image  every three seconds. The state updater takes the previous image index and returns the next index. The effect returns a cleanup function that clears the timer when the component unmounts.
   F. Important Data Structures
       heroImages is an array of four local image paths. currentImage is a zero-based index stored in React state and initialized to 0. The image element reads its source from heroImages[currentImage].
   G. Briefly describe any algorithm that you may have used and why did you select it upon other algorithms where more than one option exists. 
      The slideshow calculates the next index using (previousImage + 1) % heroImages.length. With four images, the index cycles through 0, 1, 2, and 3, then returns to 0. I chose modulo because it handles the wraparound in one expression and uses the array length to determine when to loop.
    
*/
const heroImages = [
  "/images/tokyo-hero.jpg",
  "/images/mountain.jpg",
  "/images/outdoor.jpg",
  "/images/roam.jpg",
];

export default function Home() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const imageInterval = setInterval(() => {
      setCurrentImage(
        (previousImage) => (previousImage + 1) % heroImages.length
      );
    }, 3000);

    return () => clearInterval(imageInterval);
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <h1>
            Dream it.
            <br />
            Plan it.
            <br />
            <span>Roam.</span>
          </h1>

          <p>
            From your first idea to your final itinerary, RoamReady keeps your
            trip organized in one place.
          </p>

          <div className="hero-actions">
            <Link href="/signup" className="start-button">
              Start Planning
            </Link>

            <Link href="#why-roamready" className="explore-button">
              Explore Features
            </Link>
          </div>
        </div>

        <div className="hero-image">
          <img
            src={heroImages[currentImage]}
            alt="Travel destination"
            className="hero-image-photo"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <h2>How it works:</h2>
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
      <section className="why-roamready" id="why-roamready">
        <h2>Why RoamReady?</h2>
        <p>Everything you need for a smoother, safer trip.</p>

        <div className="feature-grid">
          {/* Flights */}
          <article className="feature-card">
            <img
              src="/images/flight.jpg"
              alt="Airplane above the clouds"
            />

            <div className="feature-content">
              <h3>Flights</h3>
              <p>Find and compare travel options.</p>
              <Link href="/flights">Explore Flights →</Link>
            </div>
          </article>

          {/* Hotels */}
          <article className="feature-card">
            <img
              src="/images/hotel.jpg"
              alt="Hotel with a swimming pool"
            />

            <div className="feature-content">
              <h3>Hotels</h3>
              <p>Find stays that fit your destination.</p>
              <Link href="/hotel">Explore Hotels →</Link>
            </div>
          </article>

          {/* Transportation */}
          <article className="feature-card">
            <img
              src="/images/transportation.jpg"
              alt="City train"
            />

            <div className="feature-content">
              <h3>Transportation</h3>
              <p>Explore ways to get around your destination.</p>
              <Link href="/transportation">
                Explore Transportation →
              </Link>
            </div>
          </article>

          {/* Packages */}
          <article className="feature-card">
            <img
              src="/images/packages.jpg"
              alt="Vacation destinations"
            />

            <div className="feature-content">
              <h3>Packages</h3>
              <p>Explore packages for your next adventure.</p>
              <Link href="/packages">Explore Packages →</Link>
            </div>
          </article>

          {/* Budget */}
          <article className="feature-card">
            <img
              src="/images/budget.jpg"
              alt="Notebook for planning travel expenses"
            />

            <div className="feature-content">
              <h3>Budget</h3>
              <p>Track your spending and stay within your trip budget.</p>
              <Link href="/budget">Manage Budget →</Link>
            </div>
          </article>

          {/* Itinerary */}
          <article className="feature-card">
            <img
              src="/images/itinerary.jpg"
              alt="Map used to plan trips"
            />

            <div className="feature-content">
              <h3>Itinerary</h3>
              <p>Keep activities and plans organized.</p>
              <Link href="/itinerary">View Itinerary →</Link>
            </div>
          </article>

          {/* Packing */}
          <article className="feature-card">
            <img
              src="/images/packing.jpg"
              alt="Packing travel essentials"
            />

            <div className="feature-content">
              <h3>Packing</h3>
              <p>Build packing lists for every trip.</p>
              <Link href="/packing">Build a Packing List →</Link>
            </div>
          </article>

          {/* Safety */}
          <article className="feature-card">
            <img
              src="/images/safety.jpg"
              alt="Travel safety"
            />

            <div className="feature-content">
              <h3>Safety</h3>
              <p>
                Stay informed about safety concerns and common scams.
              </p>
              <Link href="/safety">Explore Safety →</Link>
            </div>
          </article>
        </div>
      </section>

      {/* Ready to start your adventure */}
      <section className="ready-start" id="ready-start">
        <h2>Ready to start your adventure?</h2>
        <p>
          Join RoamReady and turn your travel plans into real memories.
        </p>

        <div className="create-account">
          <Link href="/signup" className="signup-button">
            Create Your Free Account
          </Link>
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
