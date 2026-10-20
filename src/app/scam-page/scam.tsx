import Link from "next/link";
export default function scam() {
    return (
        <main>
            {/* Title */ }
            <section className="scam">
                <h1> RoamReady</h1>
                {/* User account icon maybe */ }
            </section>

            {/* Map */ }
            <div className="scam-map">
                {/* Add map content here */}
            </div>

            {/* Scam Information */ }
            <div className="scam-info">
                {/* Add an image here */}
                <h1>Common Tourist Scams</h1>
                <p>What the most common tourist scams may involve.</p>
                <button type="button">Call to action</button>
            </div>

            {/* Scam Alerts */ }
            <div className="scam-alerts">
                {/* Add an image here */}
                <h1>Recent Scam Alerts</h1>
                <p>Recent Alerts that have been reported in your area.</p>
                <button type="button">Call to action</button>
            </div>

            {/* Scam Detection Assistant */ }
            <div className="Scam-assistant">
                <h1>Scam detection Assistant</h1>
                <button className = "describe situation" type="button">Describe situation</button>
                <button className = "Paste a message" type="button">Paste a message</button>
                <form>
                    <textarea id="situation-description" name="text" rows={4} cols={50}>Tell us what happened or suspicious messages</textarea>
                </form>
            </div>

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