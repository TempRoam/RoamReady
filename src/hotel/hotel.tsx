export default function hotelpage() {
    return (
        <main>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=search" />
            <section className = "hotel">
                <div className = "hotel-title">
                    <h1 className = "roam"> RoamReady </h1>
                    <button type = "button"> Flights </button>
                    <button type = "button"> Hotel </button>
                    <form>
                        <div className = "search">
                            <span className= "search-icon material-symbols-outlined"> search </span>
                            <input className = "search-input" type = "search" placeholder = "Search"/>
                        </div>
                    </form>
                    <p>Not sure where to start? Here are popular Hotels...</p>
                </div>
                <div className = "hotel-japan">
                    {/* Add an image here */}
                    <h1>Hotels in Japan </h1>
                    <p></p>
                    <button type = "button"> More Details </button>
                    
                </div>
            </section>
        </main>
    ) 

}
