import { useState } from 'react';
import axios from 'axios';
import './App.css'; 

function App() {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState(''); 
  const [passwordInput, setPasswordInput] = useState('');
  
  // NEW: Switch between Login and Signup
  const [isLoginMode, setIsLoginMode] = useState(true); 

  const [sessions, setSessions] = useState([]);
  const [subject, setSubject] = useState('');
  const [hours, setHours] = useState('');

  // --- ACTION 1: LOGIN ---
  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/login', {
        username: usernameInput,
        password: passwordInput
      });
      if (res.data.success) {
        setUser(res.data.user);
        fetchSessions(res.data.user);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // --- NEW ACTION: SIGN UP ---
  const handleSignup = async () => {
    try {
      const res = await axios.post('http://localhost:5000/signup', {
        username: usernameInput,
        password: passwordInput
      });
      if (res.data.success) {
        alert(res.data.message); // "Account created!"
        setIsLoginMode(true);    // Switch back to login mode automatically
      } else {
        alert(res.data.message); // "Username taken"
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // --- ACTION 2: GET DATA ---
  const fetchSessions = async (theUser) => {
    try {
      const res = await axios.get(`http://localhost:5000/my-sessions/${theUser}`);
      setSessions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // --- ACTION 3: ADD DATA ---
  const handleAddSession = async () => {
    try {
      await axios.post('http://localhost:5000/add-session', {
        username: user,
        subject: subject,
        hours: hours
      });
      setSubject('');
      setHours('');
      fetchSessions(user); 
    } catch (err) {
      console.error(err);
    }
  };

  // --- ACTION 4: DELETE DATA ---
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/delete-session/${id}`);
      fetchSessions(user);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSessions([]);
    setUsernameInput('');
    setPasswordInput('');
  };

  // --- THE VIEW ---
  return (
    <div className="container">
      <h1>📚 My Study Tracker</h1>

      {!user ? (
        <div className="card">
          {/* DYNAMIC TITLE */}
          <h2>{isLoginMode ? "Login" : "Sign Up"}</h2>
          
          <input 
            placeholder="Username" 
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)} 
          />

          {/* DYNAMIC BUTTON ACTION */}
          <button onClick={isLoginMode ? handleLogin : handleSignup}>
            {isLoginMode ? "Login" : "Create Account"}
          </button>

          {/* TOGGLE SWITCH */}
          <p style={{marginTop: '15px', fontSize: '0.9rem'}}>
            {isLoginMode ? "New here? " : "Already have an account? "}
            <span 
              onClick={() => setIsLoginMode(!isLoginMode)}
              style={{color: '#007bff', cursor: 'pointer', textDecoration: 'underline'}}
            >
              {isLoginMode ? "Create an account" : "Login here"}
            </span>
          </p>
        </div>
      ) : (
        /* DASHBOARD (Logged In) */
        <div className="dashboard">
          <p>Welcome, <b>{user}</b>! <button onClick={handleLogout} className="logout-btn">Logout</button></p>
          
          <div className="card add-form">
            <h3>Add Study Session</h3>
            <input 
              placeholder="Subject" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)} 
            />
            <input 
              type="number" 
              placeholder="Hours" 
              value={hours}
              onChange={(e) => setHours(e.target.value)} 
            />
            <button onClick={handleAddSession}>Add</button>
          </div>

          <div className="list">
            <h3>Your History:</h3>
            {sessions.map((s) => (
              <div key={s.id} className="item">
                <span>📖 {s.subject}</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <span>⏳ {s.hours} hours</span>
                  <button 
                    onClick={() => handleDelete(s.id)} 
                    style={{backgroundColor: '#dc3545', padding: '5px 10px', fontSize: '12px', marginLeft: '10px'}}
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;