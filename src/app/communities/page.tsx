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
                            Tokyo and Osaka for a modern twist on Japanese culture.</p>                       
                        </div>
                    </article>
                </div>
            </section>
        </main>
    )
}
            
