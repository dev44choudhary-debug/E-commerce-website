import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ API, onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();
  const login = async () => {
    const res = await fetch(API + '/api/login', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email,password})
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || 'Error');
    onAuth(data.user, data.token);
    nav('/');
  };
  return (
    <>
      <h2>Login</h2>
      <div className="card">
        <div className="form-row"><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div className="form-row"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <button className="btn" onClick={login}>Login</button>
      </div>
    </>
  );
}
