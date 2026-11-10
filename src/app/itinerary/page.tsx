import Link from "next/link";
import "./itinerary.css";

export default function ItineraryPage() {
    return (
        <main className="itinerary-page">
        {/*Trip Heading and hero image*/}
        <section className="trip-hero">
            <div className="trip-content">
                <p className="trip-destination">TOKYO, JAPAN</p>
                
                <h1 id="trip-title">Your Trip Itinerary</h1>  

                <p className="trip-tagline">Enjoy your adventure!</p> <br/>

                <div className="trip-meta">
                    <span>May 12-16, 2027</span> 
                    <span>Tokyo, Japan</span>
                </div>
            </div>
            
            <img
             className="trip-hero-image"
             src="/images/tokyo-hero.jpg"
             alt="Mount Fuji and a Japanese pagoda"
            /> 
        </section>

        {/*Main content and sidebar */}
        <div className="itinerary-layout">
            <div className="itinerary-main">
                {/*Trip days - preview*/}
                <section className="trip-days" aria-label="Trip dates">
                    <div className="day-tab-current">
                        <span>WED</span>
                        <strong>May 12</strong>
                    </div>

                    <div className="day-tab">
                        <span>THUR</span>
                        <strong>May 13</strong>
                    </div>

                    <div className="day-tab">
                        <span>FRI</span>
                        <strong>May 14</strong>
                    </div>

                    <div className="day-tab">
                        <span>SAT</span>
                        <strong>May 15</strong>
                    </div>
                    
                    <div className="day-tab">
                        <span>SUN</span>
                        <strong>May 16</strong>
                    </div>

                    {/*Daily Itinerary*/}
                    <section className="daily-itinerary">
                        <div className="itinerary-toolbar">
                            <h2 id="daily-title">Wednesday, May 12</h2>

                            <div className="itinerary-actions">
                                <div className="view-options">
                                    <button type="button" className="view-button selected" aria-pressed="true" disabled>
                                        List
                                    </button>
                                    <button type="button" className="view-button" aria-pressed="false" disabled>
                                        Calendar 
                                    </button>
                                </div>
                                <button type="button" className="add-activity-button" disabled>
                                    + Add activity
                                </button>
                            </div>
                        </div>

                        <ol className="activity-timeline">
                            {/*Activity 1*/}
                            <li className="timeline-item">
                                <time className="activity-time" dateTime="2027-05-12T09:00">9:00 AM</time>
                                <span className="timeline-maker" aria-hidden="true"/>

                                <article className="activity-card">
                                    <img className="activity-image" src="/images/senso-ji.jpg" alt="Senso-ji Temple"/>
                                    <div className="activity-details">
                                        <h3>Senso-ji Temple</h3>
                                        <p className="activity-location">Asakusa</p>
                                        <p className="activity description">Explore Tokyo's oldest and most famous temple, with its historic streets and vibrant atmosphere.</p>
                                    </div>

                                    <span className="activity-category culture">Culture</span>
                                </article>
                            </li>
                            
                            {/*Activity 2*/}
                            <li className="timeline-item">
                                <time className="activity-time" dateTime="2027-05-12T09:00">12:00 PM</time>
                                <span className="timeline-maker" aria-hidden="true"/>

                                <article className="activity-card">
                                    <img className="activity-image" src="/images/tsukiji-market.jpg" alt="Tsukiji-market"/>
                                    <div className="activity-details">
                                        <h3>Lunch at Tsukiji</h3>
                                        <p className="activity-location">Tsukiji Outer Maket</p>
                                        <p className="activity description">Enjoy fresh seafood and local favorites at Tokyo's iconic market.</p>
                                    </div>

                                    <span className="activity-category culture">Food</span>
                                </article>
                            </li>
                            {/*Activity 3*/}
                            
                            <li className="timeline-item">
                                <time className="activity-time" dateTime="2027-05-12T09:00">3:00 PM</time>
                                <span className="timeline-maker" aria-hidden="true"/>

                                <article className="activity-card">
                                    <img className="activity-image" src="/images/Shibuya.jpg" alt="Shibuya Crossing"/>
                                    <div className="activity-details">
                                        <h3>Explore Shibuya</h3>
                                        <p className="activity-location">Shibuya Crossing</p>
                                        <p className="activity description">Experience Tokyo's most famous intersection and vibrant shopping district.</p>
                                    </div>

                                    <span className="activity-category culture">Sightseeing</span>
                                </article>
                            </li>
                        </ol>
                    </section>
                </section>
            </div>

            {/*Side bar*/}
            <aside className="itinerary-sidebar" aria-label="Trip information">
                <section className="trip-overview">
                    <h2>Trip Overview</h2>
                    <dl className="overview-details">
                        <div className="overview-item">
                            <span className="overview-icon" aria-hidden="true">
                                ✈
                            </span>
                            <div>
                                <dt>Destination</dt>
                                <dt>Tokyo, Japan</dt>
                            </div>
                        </div>

                        <div className="overview-item">
                            <span className="overview-icon" aria-hidden="true">📅</span>
                            <div>
                                <dt>Dates</dt>
                                <dd>May 12-16, 2027</dd>
                            </div>
                        </div>
                        
                        <div className="overview-item">
                            <span className="overview-icon" aria-hidden="true"></span>
                            <div>
                                <dt>Accomodation</dt>
                                <dd>Hotel Gracery Shinjuku</dd>
                            </div>
                        </div>

                        <div className="overview-item">
                            <span className="overview-icon" aria-hidden="true">$</span>
                            <div>
                                <dt>Total budget</dt>
                                <dd>$1,200 (estimated)</dd>
                            </div>
                        </div>
                    </dl>

                    <Link href="/budget" className="view-budget-link">View Budget <span aria-hidden="true">→</span></Link>
                </section>

                {/*route map placeholder*/}
                <section className="daily-route">
                    <h2>Daily route - May 12</h2>
                    <img className="route-map" src="/images/tokyo-map.jpg"/>
                </section>
            </aside>

        </div>
        </main>
    );
}