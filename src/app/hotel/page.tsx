/*
a) Module Hotel page
b) Date of Code created: October 9th 2026 Last Updated: Today
c) Luis Larios
d) The Hotel page will allow the user to search the hotel they want to use and if the user doesn’t know where to start, 
    the website will tell them the 4 hotels that are trending. These 4 hotels will have 3 hotel cards each and when they 
    click on them, it will send them to the hotel where they can book them. The hotel page also has a flight button so 
    they can go back and forward on each page

e) The Hotelpage() function takes no inputs and returns the markup that displays Hotel page. 
The four destination cards render in the order they appear in JSK because the preview displays a fixed set of examples.
The input valus are the search input and link buttons for flight and hotel. The output for the link button will make the 
user go to the flight page or hotel page

f) The article Class displays the hotel cards with images, text, and more details button.

g) This module doesn't have any algorithm.

*/



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
                           
                            {/*GRID FOR HOTEL RECOMMENDATIONS*/}
                            <section className="hotelrecommendation">
                            <h2>Hotel Recommendations:</h2>
                           
                            <article className="recommendation-grid">
                                <img src="/images/JapanHotel1.jpg" alt="Hotel 1" />
                                <div className="recommendation-content">
                                    <h3>Hotel 1</h3>
                                </div>
                               
                                <img src="/images/JapanHotel2.jpg" alt="Hotel 2" />
                                <div className="recommendation-content">
                                    <h3>Hotel 2</h3>
                                </div>


                                <img src="/images/JapanHotel3.jpg" alt="Hotel 3" />
                                <div className="recommendation-content">
                                    <h3>Hotel 3</h3>
                                </div>
                            </article>


                        </section>
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