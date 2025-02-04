import React from 'react';
    import { Routes, Route, Link, Outlet } from 'react-router-dom';
    import Home from './components/Home';
    import Music from './components/Music';
    import About from './components/About';
    import Contact from './components/Contact';
    import './App.css';

    function App() {
      return (
        <div className="app">
          <header className="app-header">
            <h1>Sigma Boy</h1>
            <nav>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/music">Music</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </nav>
          </header>
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/music" element={<Music />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>
          <Outlet />
          <footer>
            <p>© {new Date().getFullYear()} Sigma Boy. All rights reserved.</p>
          </footer>
        </div>
      );
    }

    export default App;
