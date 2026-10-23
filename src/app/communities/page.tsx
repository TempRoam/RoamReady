import Link from "next/link";
export default function communities() {
    return (
        <main> 
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=search" />
            
            {/* Title */ }
            <section className = "communities">
                <div className = "communities-title">
                <form className = "communities-form">
                    <div className = "communities-search">
                        <span className= "search-icon material-symbols-outlined"> search </span>
                        <input className = "search-input" type = "search" placeholder = "Search"/>
                    </div>
                </form>
                    <Link href="/communities" className="communities-button">Home</Link>
                </div>           
            </section>

            <section className = "communities-list">
                <div className = "communities-grid">

                    {/* Community Cards */}
                    <article className = "communities-card">
                        <div className="communities-content">
                            <h1>Post 1</h1>
                            <p>Japan is a beautiful country with a rich culture and stunning landscapes and I got some
                                great tips for traveling there. First, make sure to try the local cuisine, especially sushi and ramen. Second, visit the temples and shrines to 
                                experience the traditional side of Japan. Finally, don't forget to explore the bustling cities like 
                                Tokyo and Osaka for a modern twist on Japanese culture.
                            </p>                       
                        </div>
                    </article>

                    <article className = "communities-card">
                        <div className="communities-content">
                            <h1>Post 2</h1>
                            <p>France is a country that offers a unique blend of history, art, and cuisine. 
                                If you're planning a trip to France, be sure to visit the iconic landmarks like the Eiffel Tower 
                                and the Louvre Museum. Additionally, take some time to explore the charming streets of Paris and 
                                indulge in the local pastries and wines. Don't forget to also venture out to the countryside to 
                                experience the picturesque villages and vineyards.
                            </p>                       
                        </div>
                    </article>

                    <article className = "communities-card">
                        <div className="communities-content">
                            <h1>Post 3</h1>
                            <p>Italy is a country that is rich in history, art, and culture. When visiting Italy, be sure to explore 
                                the ancient ruins of Rome, including the Colosseum and the Roman Forum. Additionally, take a trip to Florence 
                                to admire the Renaissance art and architecture. Don't forget to indulge in the delicious Italian cuisine, from 
                                pasta and pizza to gelato and espresso. Finally, make sure to visit the beautiful coastal towns of Amalfi and 
                                Cinque Terre for breathtaking views and charming streets.
                            </p>                       
                        </div>
                    </article>

                    <article className = "communities-card">
                        <div className="communities-content">
                            <h1>Post 4</h1>
                            <p>Spain is a country that is known for its vibrant culture, stunning architecture, and delicious cuisine. 
                                When visiting Spain, be sure to explore the historic cities of Madrid and Barcelona, where you can admire 
                                the works of famous artists like Picasso and Gaudi. Additionally, take a trip to the southern region of 
                                Andalusia to experience the flamenco music and dance. Don't forget to indulge in the local tapas and paella, 
                                and make sure to visit the beautiful beaches along the Mediterranean coast.
                            </p>                       
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
            
