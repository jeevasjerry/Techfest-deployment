# TechFest 2026 React Experiment 3 - automatic setup
# Requirements: Node.js LTS + npm + PowerShell/Windows Terminal
# Run this script from the folder where you want the project created.

$ErrorActionPreference = "Stop"

$project = "techfest2026-react"

if (Test-Path $project) {
    Write-Host "ERROR: $project already exists." -ForegroundColor Red
    Write-Host "Delete/rename it first, or change `$project in this script."
    exit 1
}

Write-Host "Creating Vite React project..."
npm create vite@latest $project -- --template react

Set-Location $project

Write-Host "Installing dependencies..."
npm install
npm install react-router-dom axios

# Create required folders
New-Item -ItemType Directory -Force -Path "src\data" | Out-Null
New-Item -ItemType Directory -Force -Path "src\context" | Out-Null
New-Item -ItemType Directory -Force -Path "src\components" | Out-Null
New-Item -ItemType Directory -Force -Path "src\pages" | Out-Null

# ---------- src/data/events.js ----------
@'
const events = [
  { id: 1, name: "Coding Contest", category: "Technical", fee: 100, seats: 50 },
  { id: 2, name: "Web Dev Workshop", category: "Workshop", fee: 300, seats: 60 },
  { id: 3, name: "Robotics Challenge", category: "Technical", fee: 700, seats: 25 },
  { id: 4, name: "Cultural Night", category: "Cultural", fee: 0, seats: 200 },
  { id: 5, name: "Football Tournament", category: "Sports", fee: 150, seats: 80 }
];

export default events;
'@ | Set-Content -Encoding UTF8 "src\data\events.js"

# ---------- src/context/ThemeContext.jsx ----------
@'
import { createContext, useState, useContext } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  function toggleTheme() {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
'@ | Set-Content -Encoding UTF8 "src\context\ThemeContext.jsx"

# ---------- src/components/Navbar.jsx ----------
@'
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <h2>TechFest 2026</h2>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/register">Register</Link>
        <Link to="/gallery">Gallery</Link>
        <Link to="/contact">Contact</Link>
      </div>
      <button onClick={toggleTheme}>
        {theme === "light" ? "Switch to Dark" : "Switch to Light"}
      </button>
    </nav>
  );
}

export default Navbar;
'@ | Set-Content -Encoding UTF8 "src\components\Navbar.jsx"

# ---------- src/components/EventCard.jsx ----------
@'
import { useState } from "react";

function EventCard({ event }) {
  const [seatsLeft, setSeatsLeft] = useState(event.seats);

  function handleRegister() {
    if (seatsLeft > 0) {
      setSeatsLeft(seatsLeft - 1);
    }
  }

  return (
    <div className="event-card">
      <h3>{event.name}</h3>
      <p>Category: {event.category}</p>
      <p>Fee: {event.fee === 0 ? "Free" : `Rs. ${event.fee}`}</p>
      <p>Seats left: {seatsLeft}</p>
      {seatsLeft === 0 ? (
        <button disabled>SOLD OUT</button>
      ) : (
        <button onClick={handleRegister}>Register</button>
      )}
    </div>
  );
}

export default EventCard;
'@ | Set-Content -Encoding UTF8 "src\components\EventCard.jsx"

# ---------- src/components/EventList.jsx ----------
@'
import EventCard from "./EventCard";

function EventList({ events }) {
  if (events.length === 0) {
    return <p>No events found.</p>;
  }

  return (
    <div className="event-grid">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export default EventList;
'@ | Set-Content -Encoding UTF8 "src\components\EventList.jsx"

# ---------- src/pages/Home.jsx ----------
@'
import { useState, useEffect } from "react";

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts?_limit=3")
      .then((response) => response.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load announcements");
        setLoading(false);
      });
  }, []);

  return (
    <div className="page">
      <h1>Welcome to TechFest 2026</h1>
      <p>Three days of hackathons, workshops and competitions.</p>
      <h2>Announcements</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error-msg">{error}</p>}
      {!loading && !error && (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Home;
'@ | Set-Content -Encoding UTF8 "src\pages\Home.jsx"

# ---------- src/pages/Events.jsx ----------
@'
import { useState } from "react";
import EventList from "../components/EventList";
import events from "../data/events";

function Events() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredEvents = events.filter((event) => {
    const nameMatches = event.name.toLowerCase().includes(search.toLowerCase());
    const categoryMatches =
      category === "All" || event.category === category;
    return nameMatches && categoryMatches;
  });

  return (
    <div className="page">
      <h1>Events</h1>
      <input
        type="text"
        placeholder="Search events..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="All">All</option>
        <option value="Technical">Technical</option>
        <option value="Workshop">Workshop</option>
        <option value="Cultural">Cultural</option>
        <option value="Sports">Sports</option>
      </select>
      <EventList events={filteredEvents} />
    </div>
  );
}

export default Events;
'@ | Set-Content -Encoding UTF8 "src\pages\Events.jsx"

# ---------- src/pages/Registration.jsx ----------
@'
import { useState } from "react";

function Registration() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};

    if (name.trim() === "") {
      newErrors.name = "Name is required";
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="page">
        <h1>Thank you, {name}!</h1>
        <p>You have been registered successfully.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Registration</h1>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        {errors.name && <p className="error-msg">{errors.name}</p>}

        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        {errors.email && <p className="error-msg">{errors.email}</p>}

        <label>Mobile Number</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        {errors.phone && <p className="error-msg">{errors.phone}</p>}

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Registration;
'@ | Set-Content -Encoding UTF8 "src\pages\Registration.jsx"

# ---------- src/pages/Gallery.jsx ----------
@'
function Gallery() {
  const images = [
    "https://picsum.photos/seed/techfest1/300/200",
    "https://picsum.photos/seed/techfest2/300/200",
    "https://picsum.photos/seed/techfest3/300/200"
  ];

  return (
    <div className="page">
      <h1>Gallery</h1>
      <div className="gallery-grid">
        {images.map((src, index) => (
          <img key={index} src={src} alt="TechFest" />
        ))}
      </div>
    </div>
  );
}

export default Gallery;
'@ | Set-Content -Encoding UTF8 "src\pages\Gallery.jsx"

# ---------- src/pages/Contact.jsx ----------
@'
function Contact() {
  return (
    <div className="page">
      <h1>Contact Us</h1>
      <p>Email: techfest2026@mbcet.ac.in</p>
      <p>Phone: +91 98765 43210</p>
      <p>Venue: MBCET Campus, Thiruvananthapuram</p>
    </div>
  );
}

export default Contact;
'@ | Set-Content -Encoding UTF8 "src\pages\Contact.jsx"

# ---------- src/pages/NotFound.jsx ----------
@'
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="page">
      <h1>404 - Page Not Found</h1>
      <Link to="/">Go back Home</Link>
    </div>
  );
}

export default NotFound;
'@ | Set-Content -Encoding UTF8 "src\pages\NotFound.jsx"

# ---------- src/App.jsx ----------
@'
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Registration from "./pages/Registration";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { useTheme } from "./context/ThemeContext";

function App() {
  const { theme } = useTheme();

  return (
    <div className={theme}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
'@ | Set-Content -Encoding UTF8 "src\App.jsx"

# ---------- src/main.jsx ----------
@'
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
'@ | Set-Content -Encoding UTF8 "src\main.jsx"

# ---------- src/index.css ----------
@'
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
}

.light {
  background: #f5f7fa;
  color: #1a1a1a;
  min-height: 100vh;
}

.dark {
  background: #121212;
  color: #f5f5f5;
  min-height: 100vh;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #2b2d42;
  color: white;
  flex-wrap: wrap;
}

.nav-links a {
  color: white;
  margin-right: 16px;
  text-decoration: none;
}

.nav-links a:hover {
  text-decoration: underline;
}

.page {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.event-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
}

.error-msg {
  color: #d90429;
}

form label {
  display: block;
  margin-top: 12px;
}

form input {
  width: 100%;
  padding: 8px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.gallery-grid img {
  width: 100%;
  border-radius: 8px;
}
'@ | Set-Content -Encoding UTF8 "src\index.css"

Write-Host ""
Write-Host "Setup complete. Starting the development server..." -ForegroundColor Green
Write-Host "Open http://localhost:5173 in Chrome."
Write-Host ""
npm run dev
