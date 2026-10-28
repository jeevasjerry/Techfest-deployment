import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
function Navbar(){
 const {theme,toggleTheme}=useTheme(); const [open,setOpen]=useState(false);
 const linkClass=({isActive})=>isActive?"active":"";
 return <nav className="navbar">
  <Link className="brand" to="/" onClick={()=>setOpen(false)}><span className="brand-mark">✳</span><span>TechFest 2026<small>Ideas meet impact</small></span></Link>
  <button className="menu-toggle" onClick={()=>setOpen(!open)} aria-label="Toggle navigation">☰</button>
  <div className={`nav-links ${open?"open":""}`}>
   <NavLink className={linkClass} to="/" onClick={()=>setOpen(false)}>Home</NavLink><NavLink className={linkClass} to="/events" onClick={()=>setOpen(false)}>Events</NavLink><NavLink className={linkClass} to="/register" onClick={()=>setOpen(false)}>Register</NavLink><NavLink className={linkClass} to="/gallery" onClick={()=>setOpen(false)}>Gallery</NavLink><NavLink className={linkClass} to="/contact" onClick={()=>setOpen(false)}>Contact</NavLink>
  </div><div className="nav-actions"><button className="theme-toggle" onClick={toggleTheme}>{theme==="light"?"☾ Dark mode":"☀ Light mode"}</button></div>
 </nav>
}
export default Navbar;
