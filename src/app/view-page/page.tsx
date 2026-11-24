import Link from "next/link";
import "./view.css";
export default function view() {
    return (
        <main>
            <div className="view-page">
                <div className="view-container">
                    <div className="view-picture">
                        <img src="/images/ProfilePicture.jpg" alt="Profile Picture" id="profilePic" />
                    </div>
                    
                </div>
            </div>
        </main>
    )
}