import Link from "next/link";
import "./itinerary.css";

export default function ItineraryPage() {
    return (
        <main className="itinerary-page">
        {/*Trip Heading*/}
        <section className="trip-hero">
            <div className="trip-content">
                <p className="trip-destination">TOKYO, JAPAN</p>
                
                <h1 id="trip-title">Your Tokyo itinerary</h1>  

                <p className="trip-tagline">Enjoy your adventure.</p>

                <div className="trip-meta">
                    <span>May 12-16, 2027</span>
                    <span>Tokyo, Japan</span>
                </div>
            </div>
        </section>
        </main>
    );
}