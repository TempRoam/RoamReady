import Link from "next/link";
export default function flights() {
    return (
        <main>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=search" />
            <section className = "Flights">
                <div className = "flight-title">
                    <h1 className = "roam"> RoamReady </h1>
                    { /*<button type = "button"> Flights </button>
                    <button type = "button"> Hotel </button> */}
                    <form>
                        <div className = "search">
                            <span className= "search-icon material-symbols-outlined"> search </span>
                            <input className = "search-input" type = "search" placeholder = "Search"/>
                        </div>
                    </form>
                    <p>Not sure where to start? Here are popular countries...</p>
                </div>

                {/* Trip Options */ }
                <div className = "trip-japan">
                    <h1>Trip to Japan </h1>
                    <p>Want to go to an awesome adventure in Japan? 
                        You can see cool scenery like Mount Fuji and pink cherry blossoms trees.</p>
                    <button type = "button"> More Details </button>
                </div>
                <div className = "trip-france">
                    <h1>Trip to France </h1>
                    <p>Want to go to an awesome adventure in France?
                        You can see the Eiffel Tower and the Louvre Museum.</p>
                    <button type = "button"> More Details </button>
                </div>
                <div className = "trip-italy">
                    <h1>Trip to Italy </h1>
                    <p>Want to go to an awesome adventure in Italy? 
                        You can see the Colosseum and the Leaning Tower of Pisa.</p>
                    <button type = "button"> More Details </button>
                </div>
                <div className = "trip-mexico">
                    <h1>Trip to Mexico </h1>
                    <p>Want to go to an awesome adventure in Mexico?
                        You can see the Pyramids of Teotihuacan and the beaches of Cancun.</p>
                     <button type = "button"> More Details </button>
                </div>       
            </section>

            {/* Footer */ }
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