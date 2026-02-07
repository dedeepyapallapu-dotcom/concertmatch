// App.js
import './App.css';
import { Button, Container, Navbar, Nav } from 'react-bootstrap';
import { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Hero from './Hero.js';
import Home from './Home.js';
import Projects from './pages/Projects.js';
import Academics from './pages/Academics.js';
import Webmap from './pages/Webmap.js';
import About from './pages/About.js';
import homeButton from './images/white-transparent.png';
import homeButtonAnimated from './images/dark-home-animated.gif';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './shared-styling.css';
import Footer from './Footer';
import { supabase } from './supabaseClient';

function HoverHome() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <img
      src={isHovered ? homeButtonAnimated : homeButton}
      alt="Home"
      style={{ width: '30px', marginLeft: '1vw' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
}

// Home route wrapper to share state between Hero + Home
function HomeRoute() {
  const authRef = useRef(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  // ✅ track logged-in user once (so Hero can swap buttons)
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const scrollToAuth = (mode) => {
    setAuthMode(mode);
    authRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthMode('login'); // reset to login mode after logout
  };

  const displayName =
    user?.user_metadata?.name ||
    user?.email ||
    '';

  return (
    <>
      <Hero
        onAuthClick={scrollToAuth}
        isLoggedIn={!!user}
        displayName={displayName}
        onLogout={handleLogout}
      />
      <Home authRef={authRef} authMode={authMode} />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="App basic">
        {/* Nav bar */}
        <Navbar className="custom-navbar" style={{ backgroundColor: '#97b1d1' }}>
          <Container fluid>
            <Navbar.Brand as={Link} to="/">
              <HoverHome />
            </Navbar.Brand>
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/about">About</Nav.Link>
              <Nav.Link as={Link} to="/projects">Concerts</Nav.Link>
              <Nav.Link as={Link} to="/academics">Academics</Nav.Link>
              <Nav.Link as={Link} to="/webmap">Webmap</Nav.Link>
            </Nav>
          </Container>
        </Navbar>

        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/webmap" element={<Webmap />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
