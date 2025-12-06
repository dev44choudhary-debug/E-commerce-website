import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register({ API, onAuth }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();
  const reg = async () => {
    const res = await fetch(API + '/api/register', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name,email,password})
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || 'Error');
    onAuth(data.user, data.token);
    nav('/');
  };
  return (
    <>
      <h2>Register</h2>
      <div className="card">
        <div className="form-row"><label>Name</label><input value={name} onChange={e=>setName(e.target.value)} /></div>
        <div className="form-row"><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div className="form-row"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <button className="btn" onClick={reg}>Register</button>
      </div>
    </>
  );
}
