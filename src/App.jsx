import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const theme = {
  bg: '#0f172a',
  card: '#1e293b',
  accent: '#38bdf8',
  text: 'white',
  success: '#2ecc71',
  danger: '#ef4444',
  warning: '#f1c40f'
};

const styles = {
  page: { backgroundColor: theme.bg, color: theme.text, minHeight: '100vh', fontFamily: 'sans-serif' },
  nav: { display: 'flex', justifyContent: 'space-between', padding: '15px 50px', background: theme.card, borderBottom: '1px solid #334155' },
  navLink: { color: 'white', textDecoration: 'none' },
  logoutBtn: { background: theme.danger, color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' },
  card: { backgroundColor: theme.card, padding: '25px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
  dashboardGrid: { display: 'flex', gap: '20px', padding: '40px', justifyContent: 'center', flexWrap: 'wrap' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '10px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' },
  btn: { padding: '12px', borderRadius: '8px', border: 'none', background: theme.accent, color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' },
  item: { padding: '15px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
};

function Navbar() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const logout = () => { localStorage.clear(); navigate('/login'); };
  return (
    <nav style={styles.nav}>
      <h2 style={{ margin: 0, color: theme.accent, cursor: 'pointer' }} onClick={() => navigate('/')}>JobPortal Pro</h2>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={styles.navLink}>Home</Link>
        {user ? (
          <>
            <Link to={user.role === 'employer' ? '/employer' : '/seeker'} style={styles.navLink}>Dashboard</Link>
            {user.role === 'jobseeker' && <Link to="/profile" style={styles.navLink}>Profile</Link>}
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <Link to="/login" style={styles.navLink}>Login</Link>
        )}
      </div>
    </nav>
  );
}

function Home() {
  return (
    <div style={{...styles.page, textAlign: 'center', paddingTop: '100px'}}>
      <Navbar />
      <h1>Find Your <span style={{color: theme.accent}}>Dream Job</span></h1>
      <p style={{color: '#94a3b8'}}>Secure, Cloud-Connected Recruitment.</p>
      <Link to="/signup" style={{...styles.btn, textDecoration: 'none', display: 'inline-block', width: '150px', marginTop: '20px'}}>Get Started</Link>
    </div>
  );
}

function Profile() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [prof, setProf] = useState({ email: user?.email, skills: '', resumeLink: '', phone: '' });
  const navigate = useNavigate();
  useEffect(() => { if(user) axios.get(`http://localhost:5002/api/profiles/${user.email}`).then(res => setProf(res.data)); }, []);
  const handleSave = async () => { await axios.post('http://localhost:5002/api/profiles', prof); alert("Saved!"); navigate('/seeker'); };
  return (
    <div style={styles.page}><Navbar />
      <div style={{...styles.card, margin: '50px auto', width: '350px'}}>
        <h2 style={{color: theme.accent}}>My Profile</h2>
        <input type="text" placeholder="Skills" value={prof.skills} style={styles.input} onChange={e => setProf({...prof, skills: e.target.value})} />
        <input type="text" placeholder="Resume Link" value={prof.resumeLink} style={styles.input} onChange={e => setProf({...prof, resumeLink: e.target.value})} />
        <button onClick={handleSave} style={{...styles.btn, marginTop: '10px', width: '100%'}}>Save Profile</button>
      </div>
    </div>
  );
}

function SeekerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [search, setSearch] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  useEffect(() => {
    axios.get('http://localhost:5002/api/jobs').then(res => setJobs(res.data));
    axios.get('http://localhost:5002/api/applications').then(res => setMyApps(res.data.filter(a => a.seekerEmail === user.email)));
  }, []);
  const handleApply = async (title) => {
    await axios.post('http://localhost:5002/api/applications', { jobId: title, seekerName: user.name, seekerEmail: user.email });
    alert("Applied!"); window.location.reload();
  };
  return (
    <div style={styles.page}><Navbar />
      <div style={styles.dashboardGrid}>
        <div style={{...styles.card, width: '400px'}}>
          <h3>Find Jobs</h3>
          <input type="text" placeholder="Search..." style={{...styles.input, marginBottom: '10px', width: '90%'}} onChange={e => setSearch(e.target.value)} />
          {jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase())).map(j => (
            <div key={j._id} style={styles.item}>
              <div><b>{j.title}</b><br/><small>{j.salary}</small></div>
              <button onClick={() => handleApply(j.title)} style={{...styles.btn, padding: '5px 10px'}}>Apply</button>
            </div>
          ))}
        </div>
        <div style={{...styles.card, width: '300px'}}>
          <h3>My Status</h3>
          {myApps.map(a => (
            <div key={a._id} style={styles.item}>
              <span>{a.jobId}</span>
              <b style={{color: a.status === 'Accepted' ? theme.success : theme.accent}}>{a.status}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmployerDashboard() {
  const [job, setJob] = useState({ title: '', salary: '', company: '' });
  const [applicants, setApplicants] = useState([]);
  useEffect(() => { axios.get('http://localhost:5002/api/applications').then(res => setApplicants(res.data)); }, []);
  const handleStatus = async (id, s) => { await axios.put(`http://localhost:5002/api/applications/${id}`, { status: s }); alert("Updated!"); window.location.reload(); };
  const postJob = async (e) => { e.preventDefault(); await axios.post('http://localhost:5002/api/jobs', job); alert("Posted!"); setJob({ title: '', salary: '', company: '' }); };
  return (
    <div style={styles.page}><Navbar />
      <div style={styles.dashboardGrid}>
        <div style={{...styles.card, width: '300px'}}>
          <h3>Post Job</h3>
          <form onSubmit={postJob} style={styles.form}>
            <input type="text" placeholder="Title" value={job.title} style={styles.input} onChange={e => setJob({...job, title: e.target.value})} required />
            <input type="text" placeholder="Salary" value={job.salary} style={styles.input} onChange={e => setJob({...job, salary: e.target.value})} required />
            <button type="submit" style={{...styles.btn, background: theme.success, width: '100%'}}>Post</button>
          </form>
        </div>
        <div style={{...styles.card, width: '500px'}}>
          <h3>Applicants</h3>
          {applicants.map(a => (
            <div key={a._id} style={styles.item}>
              <div><b>{a.seekerName}</b><br/><small>{a.jobId}</small></div>
              <div>
                <button onClick={() => handleStatus(a._id, 'Accepted')} style={{background: theme.success, color: 'white', border: 'none', padding: '5px', borderRadius: '3px', marginRight: '5px'}}>✔</button>
                <button onClick={() => handleStatus(a._id, 'Rejected')} style={{background: theme.danger, color: 'white', border: 'none', padding: '5px', borderRadius: '3px'}}>✘</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5002/api/auth/login', form);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate(res.data.user.role === 'employer' ? '/employer' : '/seeker');
    } catch (err) { alert("Error"); }
  };
  return (
    <div style={styles.page}><Navbar />
      <div style={{...styles.card, margin: '80px auto', width: '300px'}}>
        <h2>Login</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input type="email" placeholder="Email" style={styles.input} onChange={e => setForm({...form, email: e.target.value})} required />
          <input type="password" placeholder="Password" style={styles.input} onChange={e => setForm({...form, password: e.target.value})} required />
          <button type="submit" style={{...styles.btn, width: '100%'}}>Login</button>
        </form>
      </div>
    </div>
  );
}

function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'jobseeker' });
  const navigate = useNavigate();
  const handleSignup = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5002/api/auth/register', form);
    alert("Success!"); navigate('/login');
  };
  return (
    <div style={styles.page}><Navbar />
      <div style={{...styles.card, margin: '80px auto', width: '300px'}}>
        <h2>Signup</h2>
        <form onSubmit={handleSignup} style={styles.form}>
          <input type="text" placeholder="Name" style={styles.input} onChange={e => setForm({...form, name: e.target.value})} required />
          <input type="email" placeholder="Email" style={styles.input} onChange={e => setForm({...form, email: e.target.value})} required />
          <input type="password" placeholder="Password" style={styles.input} onChange={e => setForm({...form, password: e.target.value})} required />
          <select style={styles.input} onChange={e => setForm({...form, role: e.target.value})}>
            <option value="jobseeker">Seeker</option>
            <option value="employer">Employer</option>
          </select>
          <button type="submit" style={{...styles.btn, width: '100%'}}>Register</button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/seeker" element={<SeekerDashboard />} />
        <Route path="/employer" element={<EmployerDashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}