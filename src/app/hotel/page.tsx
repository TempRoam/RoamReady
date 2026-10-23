import Link from "next/link";
export default function hotelpage() {
    return (
       <main>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=search" />
            
            {/* Title */ }
            <section className = "hotel">
                <div className = "hotel-title">
                <form className = "form">
                    <div className = "search">
                        <span className= "search-icon material-symbols-outlined"> search </span>
                        <input className = "search-input" type = "search" placeholder = "Search"/>
                    </div>
                </form>
                    { /* <h1 className = "roam"> RoamReady </h1> */}
                    <Link href="/flights" className="flights-button">Flights</Link>
                    <Link href="/hotel" className="hotel-button">Hotel</Link>
                    { /* <button type = "button"> Flights </button> 
                      <button type = "button"> Hotel </button> */}
                </div>           

                <div className = "discover">
                    <p>Not sure where to start? Here are popular Hotels...</p>
                </div>
            </section>

            <section className = "hotel-list">
                <div className = "hotel-grid">

                    {/* Japan Hotel */}
                    <article className = "hotel-card">
                        <img src="/images/JapanHotel.jpg" alt = "Japan Hotel" />
                        <div className="hotel-content">
                            <h1>Hotels in Japan </h1>
                            <p>Features tatami mats, sliding doors, low tables and 
                            includes onsen (hot spring) and multi-course kaiseki dining.
                            Features 2 bedrooms, great dining, and exceptional service.</p>
                            <button type = "button"> More Details </button>
                        </div>
                    </article>

                    {/* France Hotel */}
                    <article className = "hotel-card">
                        <img src="/images/FranceHotel.jpg" alt = "France Hotel" />
                        <div className="hotel-content">
                            <h1>Hotels in France </h1>
                            <p>Features 2 bedrooms, great dining, and exceptional service.</p>
                            <button type = "button"> More Details </button>
                        </div>
                    </article>

                    {/* Italy Hotel */}
                    <article className = "hotel-card">
                        <img src="/images/ItalyHotel.jpg" alt = "Italy Hotel" />
                        <div className="hotel-content">
                            <h1>Hotels in Italy </h1>
                            <p>Features 3 bedrooms, has great views, and best food service.</p>
                            <button type = "button"> More Details </button>
                        </div>
                    </article>

                    {/* Mexico Hotel */}
                    <article className = "hotel-card">
                        <img src="/images/MexicoHotel.jpg" alt = "Mexico Hotel" />
                        <div className="hotel-content">
                            <h1>Hotels in Mexico </h1>
                            <p>Features 4 bedrooms, has a private pool, and is located near the beach.</p>
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