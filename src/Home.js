// // Home.js
// import { Container, Row, Col } from 'react-bootstrap';
// import './Home.css';
// import './shared-styling.css';
// import { useEffect, useState } from 'react';
// import { supabase } from './supabaseClient';

// // (Keeping your other imports as-is)
// import img1 from './images/wakesurfing.jpg';
// import img2 from './images/time.jpg';
// import img3 from './images/cs-building.jpg';
// import neurodexphoto from './images/lavender_ai_photo.avif';
// import traveldiaryphoto from './images/previewimage_traveldiary.png';
// import pasteltree from './images/pastel_tree.jpg';
// import ProjectCarousel from './ProjectCarousel';

// export default function Home({ authRef, authMode }) {
//   const [name, setName] = useState(''); // used for signup input + display
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const [status, setStatus] = useState('');
//   const [loading, setLoading] = useState(false);

//   // track logged-in user (so we can swap to logout UI)
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     // Get initial session/user
//     supabase.auth.getUser().then(({ data }) => {
//       const u = data?.user ?? null;
//       setUser(u);

//       if (u) {
//         const existingName = u.user_metadata?.name;
//         if (existingName) setName(existingName);
//         else if (u.email) setName(u.email);
//       }
//     });

//     // Listen for auth changes
//     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//       const nextUser = session?.user ?? null;
//       setUser(nextUser);

//       if (nextUser) {
//         const existingName = nextUser.user_metadata?.name;
//         if (existingName) setName(existingName);
//         else if (nextUser.email) setName(nextUser.email);
//       }
//     });

//     return () => {
//       listener.subscription.unsubscribe();
//     };
//   }, []);

//   const resetFields = () => {
//     setName('');
//     setEmail('');
//     setPassword('');
//     setStatus('');
//     setLoading(false);
//   };

//   const handleLogout = async () => {
//     setStatus('');
//     setLoading(true);
//     try {
//       const { error } = await supabase.auth.signOut();
//       if (error) throw error;

//       // reset UI fields + state so signup/login shows again
//       setUser(null);
//       resetFields();
//       setStatus('Logged out!');
//     } catch (err) {
//       setStatus(err?.message || 'Logout failed.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault(); // prevents page refresh
//     setStatus('');
//     setLoading(true);

//     try {
//       if (!email || !password) {
//         setStatus('Please enter an email and password.');
//         return;
//       }
//       if (authMode === 'signup' && !name.trim()) {
//         setStatus('Please enter your name.');
//         return;
//       }

//       if (authMode === 'signup') {
//         const { error } = await supabase.auth.signUp({
//           email,
//           password,
//           options: {
//             data: { name: name.trim() },
//           },
//         });

//         if (error) throw error;

//         setStatus('Account created! Check your email if confirmation is enabled.');
//       } else {
//         const { error } = await supabase.auth.signInWithPassword({
//           email,
//           password,
//         });

//         if (error) throw error;

//         setStatus('Logged in!');
//       }

//       setPassword('');
//     } catch (err) {
//       setStatus(err?.message || 'Something went wrong.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       {/* Auth section (scroll target) */}
//       <Container fluid className="showcase-section basic" ref={authRef}>
//         <Row className="g-0 justify-content-center" style={{ paddingTop: '10vh' }}>
//           <Col md={4}>
//             {/* after logged in: show message + Log Out button */}
//             {user ? (
//               <div>
//                 <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>
//                   {name}, you&apos;re logged in!
//                 </h2>

//                 <button
//                   type="button"
//                   className="btn btn-light w-100"
//                   onClick={handleLogout}
//                   disabled={loading}
//                 >
//                   {loading ? 'Please wait...' : 'Log Out'}
//                 </button>

//                 {status && (
//                   <div style={{ marginTop: '12px', color: 'white' }}>
//                     {status}
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <>
//                 <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>
//                   {authMode === 'login' ? 'Login' : 'Sign Up'}
//                 </h2>

//                 <form onSubmit={handleSubmit}>
//                   {authMode === 'signup' && (
//                     <div className="mb-3">
//                       <label className="form-label" style={{ color: 'white' }}>
//                         Name
//                       </label>
//                       <input
//                         type="text"
//                         className="form-control"
//                         placeholder="Enter name"
//                         value={name}
//                         onChange={(e) => setName(e.target.value)}
//                       />
//                     </div>
//                   )}

//                   <div className="mb-3">
//                     <label className="form-label" style={{ color: 'white' }}>
//                       Email
//                     </label>
//                     <input
//                       type="email"
//                       className="form-control"
//                       placeholder="Enter email address"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       autoComplete="email"
//                       required
//                     />
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label" style={{ color: 'white' }}>
//                       Password
//                     </label>
//                     <input
//                       type="password"
//                       className="form-control"
//                       placeholder="Enter password"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
//                       required
//                     />
//                   </div>

//                   <button type="submit" className="btn btn-light w-100" disabled={loading}>
//                     {loading
//                       ? 'Please wait...'
//                       : authMode === 'login'
//                       ? 'Log In'
//                       : 'Create Account'}
//                   </button>

//                   {status && (
//                     <div style={{ marginTop: '12px', color: 'white' }}>
//                       {status}
//                     </div>
//                   )}
//                 </form>
//               </>
//             )}
//           </Col>
//         </Row>
//       </Container>

//       {/* Keep your lower section(s) as-is */}
//       <Container
//         fluid
//         className="contact-section basic"
//         style={{ padding: '4rem 2rem', backgroundColor: '#1f2227', color: 'white' }}
//       >
//         {/* your content */}
//       </Container>
//     </>
//   );
// }
// Home.js
import { Container, Row, Col } from 'react-bootstrap';
import './Home.css';
import './shared-styling.css';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

// (Keeping your other imports as-is)
import img1 from './images/wakesurfing.jpg';
import img2 from './images/time.jpg';
import img3 from './images/cs-building.jpg';
import neurodexphoto from './images/lavender_ai_photo.avif';
import traveldiaryphoto from './images/previewimage_traveldiary.png';
import pasteltree from './images/pastel_tree.jpg';
import ProjectCarousel from './ProjectCarousel';

export default function Home({ authRef, authMode }) {
  const [name, setName] = useState(''); // used for signup input + display
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // track logged-in user (so we can hide form + show "you're logged in")
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data }) => {
      const u = data?.user ?? null;
      setUser(u);

      if (u) {
        const existingName = u.user_metadata?.name;
        if (existingName) setName(existingName);
        else if (u.email) setName(u.email);
      }
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (nextUser) {
        const existingName = nextUser.user_metadata?.name;
        if (existingName) setName(existingName);
        else if (nextUser.email) setName(nextUser.email);
      } else {
        // If logged out (from Hero), reset fields + messages
        setName('');
        setEmail('');
        setPassword('');
        setStatus('');
        setLoading(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevents page refresh
    setStatus('');
    setLoading(true);

    try {
      if (!email || !password) {
        setStatus('Please enter an email and password.');
        return;
      }
      if (authMode === 'signup' && !name.trim()) {
        setStatus('Please enter your name.');
        return;
      }

      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name.trim() },
          },
        });

        if (error) throw error;

        setStatus('Account created! Check your email if confirmation is enabled.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setStatus('Logged in!');
      }

      setPassword('');
    } catch (err) {
      setStatus(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Bigger header as requested previously
  const headerStyle = {
    color: 'white',
    marginBottom: '1.5rem',
    fontSize: '2.4rem',
    fontWeight: 700,
  };

  return (
    <>
      {/* Auth section (scroll target) */}
      <Container fluid className="showcase-section basic" ref={authRef}>
        <Row className="g-0 justify-content-center" style={{ paddingTop: '10vh' }}>
          <Col md={4}>
            {user ? (
              <div>
                <h2 style={headerStyle}>
                  {name}, you&apos;re logged in!
                </h2>

                {status && (
                  <div style={{ marginTop: '12px', color: 'white' }}>
                    {status}
                  </div>
                )}
              </div>
            ) : (
              <>
                <h2 style={headerStyle}>
                  {authMode === 'login' ? 'Login' : 'Sign Up'}
                </h2>

                <form onSubmit={handleSubmit}>
                  {authMode === 'signup' && (
                    <div className="mb-3">
                      <label className="form-label" style={{ color: 'white' }}>
                        Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label" style={{ color: 'white' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{ color: 'white' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-light w-100" disabled={loading}>
                    {loading
                      ? 'Please wait...'
                      : authMode === 'login'
                      ? 'Log In'
                      : 'Create Account'}
                  </button>

                  {status && (
                    <div style={{ marginTop: '12px', color: 'white' }}>
                      {status}
                    </div>
                  )}
                </form>
              </>
            )}
          </Col>
        </Row>
      </Container>

      {/* Keep your lower section(s) as-is */}
      <Container
        fluid
        className="contact-section basic"
        style={{ padding: '4rem 2rem', backgroundColor: '#1f2227', color: 'white' }}
      >
        {/* your content */}
      </Container>
    </>
  );
}
