// // // Hero.js
// // import { Container, Row, Col } from 'react-bootstrap';
// // import './Hero.css';
// // import heroImg from './images/cd.jpg';
// // import portrait from './images/portrait.png';
// // import './shared-styling.css';

// // export default function Hero({ onAuthClick }) {
// //   return (
// //     <div
// //       style={{
// //         backgroundImage: `url(${heroImg})`,
// //         backgroundSize: 'cover',
// //         backgroundPosition: 'center top',
// //         backgroundRepeat: 'no-repeat',
// //         minHeight: '93vh',
// //         padding: '0px',
// //         display: 'flex',
// //         color: 'white',
// //         justifyContent: 'center',
// //       }}
// //     >
// //       <Container fluid>
// //         <Row>
// //           <Col className="hero-styling d-flex flex-column justify-content-center basic">
// //             <h1 style={{ fontWeight: 'bold', marginTop: '290px', marginLeft: '8vw' }} className="align-items-end">
// //               Concert Match.
// //             </h1>

// //             <p className="justify-content-center" style={{ marginBottom: '30px', marginLeft: '15vw' }}>
// //               The best music site. Designed by Julia
// //             </p>

// //             <div className="hero-buttons justify-content-center" style={{ marginLeft: '5vw' }}>
// //               <button className="slider-btn" onClick={() => onAuthClick('signup')}>
// //                 Sign Up
// //               </button>
// //               <button className="slider-btn outline" onClick={() => onAuthClick('login')}>
// //                 Log In
// //               </button>
// //             </div>
// //           </Col>

// //           <Col>
// //             <div style={{ flexShrink: 0 }} className="hero-img-container">
// //               {/* <img src={portrait} alt="Portrait" className="hero-img" /> */}
// //             </div>
// //           </Col>
// //         </Row>
// //       </Container>
// //     </div>
// //   );
// // }
// // Hero.js
// import { Container, Row, Col } from 'react-bootstrap';
// import './Hero.css';
// import heroImg from './images/cd.jpg';
// import portrait from './images/portrait.png';
// import './shared-styling.css';

// export default function Hero({ onAuthClick }) {
//   return (
//     <div
//       style={{
//         backgroundImage: `url(${heroImg})`,
//         backgroundSize: 'cover',
//         backgroundPosition: 'center top',
//         backgroundRepeat: 'no-repeat',
//         minHeight: '93vh',
//         padding: '0px',
//         display: 'flex',
//         color: 'white',
//         justifyContent: 'center',
//       }}
//     >
//       <Container fluid>
//         <Row>
//           <Col className="hero-styling d-flex flex-column justify-content-center basic">
//             <h1 style={{ fontWeight: 'bold', marginTop: '290px', marginLeft: '8vw' }} className="align-items-end">
//               Concert Match.
//             </h1>

//             <p className="justify-content-center" style={{ marginBottom: '30px', marginLeft: '15vw' }}>
//               The best music site. Designed by Julia
//             </p>

//             <div className="hero-buttons justify-content-center" style={{ marginLeft: '5vw' }}>
//               <button className="slider-btn" onClick={() => onAuthClick('signup')}>
//                 Sign Up
//               </button>
//               <button className="slider-btn outline" onClick={() => onAuthClick('login')}>
//                 Log In
//               </button>
//             </div>
//           </Col>

//           <Col>
//             <div style={{ flexShrink: 0 }} className="hero-img-container">
//               {/* <img src={portrait} alt="Portrait" className="hero-img" /> */}
//             </div>
//           </Col>
//         </Row>
//       </Container>
//     </div>
//   );
// }
// Hero.js
import { Container, Row, Col } from 'react-bootstrap';
import './Hero.css';
import heroImg from './images/cd.jpg';
import portrait from './images/portrait.png';
import './shared-styling.css';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function Hero({ onAuthClick }) {
  // track logged-in user so we can swap buttons in HERO
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // user state will update via onAuthStateChange
  };

  return (
    <div
      style={{
        backgroundImage: `url(${heroImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        minHeight: '93vh',
        padding: '0px',
        display: 'flex',
        color: 'white',
        justifyContent: 'center',
      }}
    >
      <Container fluid>
        <Row>
          <Col className="hero-styling d-flex flex-column justify-content-center basic">
            <h1 style={{ fontWeight: 'bold', marginTop: '290px', marginLeft: '8vw' }} className="align-items-end">
              Concert Match.
            </h1>

            <p className="justify-content-center" style={{ marginBottom: '30px', marginLeft: '15vw' }}>
              The best music site. <br></br>Designed by Julia, Vena, Harini, Name.
            </p>

            <div className="hero-buttons justify-content-center" style={{ marginLeft: '5vw' }}>
              {user ? (
                <button className="slider-btn" onClick={handleLogout}>
                  Log Out
                </button>
              ) : (
                <>
                  <button className="slider-btn" onClick={() => onAuthClick('signup')}>
                    Sign Up
                  </button>
                  <button className="slider-btn outline" onClick={() => onAuthClick('login')}>
                    Log In
                  </button>
                </>
              )}
            </div>
          </Col>

          <Col>
            <div style={{ flexShrink: 0 }} className="hero-img-container">
              {/* <img src={portrait} alt="Portrait" className="hero-img" /> */}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
