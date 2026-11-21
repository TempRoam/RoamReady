import Link from "next/link";
import "./profile.css";
export default function profile() {
    return (
        <main>
            <div className="profile-page">
                <form className="profile-form">
                    <div className = "profile-container">
                        <div className="profile-picture">
                            <h1>Edit Profile</h1>
                            <img src="/images/ProfilePicture.jpg" alt="Profile Picture" id="profilePic" />
                            <input type="file" name="profilePicture" id="profilePicture" accept="image/*" />
                        </div>
                        <span className = "Name">Name: </span>
                        <input type="text" placeholder="Enter your name" />
                        <span className = "UserName">Username: </span>  
                        <input type="text" placeholder="Enter your username" />
                        <span className = "AboutYou">About you: </span>  
                        <input type="text" placeholder="Enter your bio" />
                    </div>
                    <div className="profile-buttons">
                        <Link href="/home">
                            <button type="button" className="button">Home</button>
                        </Link>
                        <Link href="/profile">
                            <button type="button" className="button">Edit Profile</button>
                        </Link>
                        <Link href="/publicview">
                            <button type="button" className="button">Public View </button>
                        </Link>
                    </div>
                </form>
            </div>

        </main>
    )
}
