import Link from "next/link";
export default function flights() {
    return (
        <main>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=search" />
            
            {/* Title */ }
            <section className = "flight">
                <div className = "flight-title">
                <form className = "flight-form">
                    <div className = "flight-search">
                        <span className= "search-icon material-symbols-outlined"> search </span>
                        <input className = "search-input" type = "search" placeholder = "Search"/>
                    </div>
                </form>
                    { /* <h1 className = "roam"> RoamReady </h1> */}
                    <Link href="/flights" className="flightTwo-button">Flights</Link>
                    <Link href="/hotel" className="hotelTwo-button">Hotel</Link>
                    { /* <button type = "button"> Flights </button> 
                      <button type = "button"> Hotel </button> */}
                </div>           

                <div className = "Area">
                    <p>Not sure where to start? Here are popular Flights...</p>
                </div>
            </section>

            <section className = "flight-list">
                <div className = "flight-grid">

                    {/* Japan Flight */}
                    <article className = "flight-card">
                        <img src="/images/Japan.jpg" alt = "Japan Flight" />
                        <div className="flight-content">
                            <h1>Flights to Japan </h1>
                            <p>Want to go to an awesome adventure in Japan? 
                               You can see cool scenery like Mount Fuji and 
                               pink cherry blossoms trees. </p>
                            <button type = "button"> More Details </button>
                        </div>
                    </article>

                    {/* France Flight */}
                    <article className = "flight-card">
                        <img src="/images/France.jpg" alt = "France Flight" />
                        <div className="flight-content">
                            <h1>Flights to France </h1>
                            <p>Want to go to an awesome adventure in France? 
                                You can see cool scenery like Eiffel tower and Louvre Museum.</p>
                            <button type = "button"> More Details </button>
                        </div>
                    </article>

                    {/* Italy Flight */}
                    <article className = "flight-card">
                        <img src="/images/Italy.jpg" alt = "Italy Flight" />
                        <div className="flight-content">
                            <h1>Flights to Italy </h1>
                            <p>Want to go to an awesome adventure in Italy? 
                                You can see cool scenery like the Colosseum and 
                                the Leaning Tower of Pisa.</p>
                            <button type = "button"> More Details </button>
                        </div>
                    </article>

                    {/* Mexico Flight */}
                    <article className = "flight-card">
                        <img src="/images/Mexico.jpg" alt = "Mexico Flight" />
                        <div className="flight-content">
                            <h1>Flights to Mexico </h1>
                            <p>Want to go to an awesome adventure in Mexico? 
                               You can see cool scenery like the Pyramids of Giza 
                               and the beaches of Cancun.</p>
                            <button type = "button"> More Details </button>
                        </div>
                    </article>
                </div>
            </section>

            {/* footer */ }
            <footer className="footer">
                <p>Copyright 2026 RoamReady. All rights reserved.</p>
                <div className="footer-links">
                    <Link href="/about">About</Link>
                    <Link href="/features">Features</Link>
                </div>
            </footer>
        </main>
    )
}
