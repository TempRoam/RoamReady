"use client" // for useState and onClick
import { useState } from "react"

type View = "list" | "calendar";
const YEAR = 2027
const MONTH = 4 //month 4 would be may, javascript months start at 0 so Jan is 0
const TRIP_START = "2027-05-12"
const TRIP_END = "2027-05-16"
const WEEKDAYS = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];

//for the calendar it has the date, time, title and category for each of the activities
// the activities given in calendar events

const calendarEvents = [
    { id: "senso-ji", date: "2027-05-12", time: "9:00am", title: "Senso-ji Temple", category: "culture" },
    { id: "tsukiji", date: "2027-05-12", time: "1:00pm", title: "Lunch date at Tsukiji", category: "food" },
    { id: "shibuya", date: "2027-05-12", time: "3:00pm", title: "Explore Shibuya", category: "sightseeing" },
];

// Converts a number into a two-digit string.
// If the number is only one digit, it adds a 0 at the beginning.
// Example: 5 becomes "05" and 12 stays "12".
function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function DailyItinerary() {
  // Stores which calendar view the user is currently viewing.
  // The default view is "list".
  const [view, setView] = useState<View>("list");

  // Gets the weekday of the first day of the month.
  // JavaScript uses 0 for Sunday, 1 for Monday, and so on.
  const firstWeekday = new Date(YEAR, MONTH, 1).getDay();

  // Gets the total number of days in the selected month.
  const daysInMonth = new Date(YEAR, MONTH + 1, 0).getDate();

  // Creates an array for the calendar.
  // First, it adds empty spaces (null) for the days before the 1st.
  // Then, it adds all the actual dates of the month (1, 2, 3, etc.).
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Adds empty spaces at the end of the calendar if needed.
  // This makes sure the calendar always has complete rows of 7 days.
  while (cells.length % 7 !== 0) cells.push(null);

               { /* This is what was moved from page.tsx */ }

                           { /* ORIGINAL FROM PAGE.TSX 
                            
                            <h2 id="daily-title">Wednesday, May 12</h2> 

                            <div className="itinerary-actions">
                                <div className="view-options">
                                    <button type="button" className="view-button selected" aria-pressed="true" disabled>
                                        List
                                    </button>
                                    <button type="button" className="view-button" aria-pressed="false" disabled>
                                        Calendar 
                                    </button>
                                </div>
                                <button type="button" className="add-activity-button" disabled>
                                    + Add activity
                                </button>
                            </div>
                        </div> */ }

                         return (
                    <section className="daily-itinerary">
                        <div className="itinerary-toolbar">
                            <h2 id="daily-title">{view === "list" ? "Wednesday, May 12" : "May 2027"}</h2>

                            <div className="itinerary-actions">
                                <div className="view-options">
                                    <button type="button" className={`view-button${view === "list" ? " selected" : ""}`} aria-pressed={view === "list"} onClick={() => setView("list")}>
                                        List
                                    </button>
                                    <button type="button" className={`view-button${view === "calendar" ? " selected" : ""}`} aria-pressed={view === "calendar"} onClick={() => setView("calendar")}>
                                        Calendar 
                                    </button>
                                </div>
                                <button type="button" className="add-activity-button" disabled>
                                    + Add activity
                                </button>
                            </div>
                        </div>

                        {view === "list" ? (
                        <ol className="activity-timeline">
                            
                           { /* Activity 1 */ }

                           { /*}
                            <li className="timeline-item">
                                <time className="activity-time" dateTime="2027-05-12T09:00">9:00 AM</time>
                                <span className="timeline-maker" aria-hidden="true"/>

                                <article className="activity-card">
                                    <img className="activity-image" src="/images/senso-ji.jpg" alt="Senso-ji Temple"/>
                                    <div className="activity-details">
                                        <h3>Senso-ji Temple</h3>
                                        <p className="activity-location">Asakusa</p>
                                        <p className="activity-description">Explore Tokyo's oldest and most famous temple, with its historic streets and vibrant atmosphere.</p>
                                    </div>

                                    <span className="activity-category culture">Culture</span>
                                </article>
                            </li> */ }

                              <li className="timeline-item">
                                <time className="activity-time" dateTime="2027-05-12T09:00">9:00 AM</time>
                                <span className="timeline-maker" aria-hidden="true"/>

                                <article className="activity-card">
                                    <img className="activity-image" src="/images/senso-ji.jpg" alt="Senso-ji Temple"/>
                                    <div className="activity-details">
                                        <h3>Senso-ji Temple</h3>
                                        <p className="activity-location">Asakusa</p>
                                        <p className="activity-description">Explore Tokyo's oldest and most famous temple, with its historic streets and vibrant atmosphere.</p>
                                    </div>

                                    <span className="activity-category culture">Culture</span>
                                </article>
                            </li>
                            
                            { /* Activity 2 */ }
                            { /*
                            <li className="timeline-item">
                                <time className="activity-time" dateTime="2027-05-12T12:00">12:00 PM</time>
                                <span className="timeline-maker" aria-hidden="true"/>

                                <article className="activity-card">
                                    <img className="activity-image" src="/images/tsukiji-market.jpg" alt="Tsukiji-market"/>
                                    <div className="activity-details">
                                        <h3>Lunch at Tsukiji</h3>
                                        <p className="activity-location">Tsukiji Outer Maket</p>
                                        <p className="activity-description">Enjoy fresh seafood and local favorites at Tokyo's iconic market.</p>
                                    </div>

                                    <span className="activity-category food">Food</span>
                                </article>
                            </li> */ }

                               <li className="timeline-item">
                                <time className="activity-time" dateTime="2027-05-12T12:00">12:00 PM</time>
                                <span className="timeline-maker" aria-hidden="true"/>

                                <article className="activity-card">
                                    <img className="activity-image" src="/images/tsukiji-market.jpg" alt="Tsukiji-market"/>
                                    <div className="activity-details">
                                        <h3>Lunch at Tsukiji</h3>
                                        <p className="activity-location">Tsukiji Outer Maket</p>
                                        <p className="activity-description">Enjoy fresh seafood and local favorites at Tokyo's iconic market.</p>
                                    </div>

                                    <span className="activity-category food">Food</span>
                                </article>
                            </li>
                            
                            { /* Activity 3 */ }

                            { /*
                            <li className="timeline-item">
                                <time className="activity-time" dateTime="2027-05-12T15:00">3:00 PM</time>
                                <span className="timeline-maker" aria-hidden="true"/>

                                <article className="activity-card">
                                    <img className="activity-image" src="/images/Shibuya.jpg" alt="Shibuya Crossing"/>
                                    <div className="activity-details">
                                        <h3>Explore Shibuya</h3>
                                        <p className="activity-location">Shibuya Crossing</p>
                                        <p className="activity-description">Experience Tokyo's most famous intersection and vibrant shopping district.</p>
                                    </div>

                                    <span className="activity-category sightseeing">Sightseeing</span>
                                </article>
                            </li>
                        </ol>
                    </section>
            </div> 

            */ }

             <li className="timeline-item">
                                <time className="activity-time" dateTime="2027-05-12T15:00">3:00 PM</time>
                                <span className="timeline-maker" aria-hidden="true"/>

                                <article className="activity-card">
                                    <img className="activity-image" src="/images/Shibuya.jpg" alt="Shibuya Crossing"/>
                                    <div className="activity-details">
                                        <h3>Explore Shibuya</h3>
                                        <p className="activity-location">Shibuya Crossing</p>
                                        <p className="activity-description">Experience Tokyo's most famous intersection and vibrant shopping district.</p>
                                    </div>

                                    <span className="activity-category sightseeing">Sightseeing</span>
                                </article>
                            </li>
                        </ol>

            { /* END OF WHAT WAS MOVED FROM PAGE.TSX */ }

             
                        ) : (
                        <div className="calendar">
                            <div className="calendar-weekdays">
                                {WEEKDAYS.map((d) => (
                                    <span key={d}>{d}</span>
                                ))}
                            </div>

                            <div className="calendar-grid">
                                {cells.map((day, i) => {
                                    if (day === null) {
                                        return <div key={i} className="calendar-cell empty" />;
                                    }

                                    // Compare dates as text (not new Date()) so time zones can't shift the day
                                    const key = `${YEAR}-${pad(MONTH + 1)}-${pad(day)}`;
                                    const inTrip = key >= TRIP_START && key <= TRIP_END;
                                    const events = calendarEvents.filter((e) => e.date === key);

                                    return (
                                        <div key={i} className={`calendar-cell${inTrip ? " in-trip" : ""}`}>
                                            <span className="calendar-day">{day}</span>
                                            {events.map((e) => (
                                                <span key={e.id} className={`calendar-event ${e.category}`}>
                                                    {e.time} {e.title}
                                                </span>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        )}
                    </section>
  );
}
