import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Product from './pages/Product';
import Login from './pages/Login';
import Register from './pages/Register';
import CartPage from './pages/Cart';
import Orders from './pages/Orders';
import Admin from './pages/Admin';

const API = process.env.REACT_APP_API || 'http://localhost:4000';

function Nav({ user, logout, cartCount }) {
  return (
    <nav className="nav">
      <Link to="/">E-Shop</Link>
      <div>
        <Link to="/">Products</Link>
        <Link to="/cart">Cart ({cartCount})</Link>
        {user ? (
          <>
            <Link to="/orders">My Orders</Link>
            {user.isAdmin && <Link to="/admin">Admin</Link>}
            <button onClick={logout} className="btn small">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [cart, setCart] = useState(() => {
    const raw = localStorage.getItem('cart');
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <BrowserRouter>
      <Nav user={user} logout={logout} cartCount={cart.reduce((s,i)=>s+i.qty,0)} />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home API={API} addToCart={(p,qty)=> {
              setCart(prev => {
                const found = prev.find(x=>x.id===p.id);
                if (found) return prev.map(x=>x.id===p.id?{...x,qty:x.qty+qty}:x);
                return [...prev, {...p, qty}];
              });
            }} />} />
          <Route path="/product/:id" element={<Product API={API} addToCart={(p,qty)=> {
              setCart(prev => {
                const found = prev.find(x=>x.id===p.id);
                if (found) return prev.map(x=>x.id===p.id?{...x,qty:x.qty+qty}:x);
                return [...prev, {...p, qty}];
              });
            }} />} />
          <Route path="/login" element={<Login API={API} onAuth={(u,t)=>{ setUser(u); setToken(t); localStorage.setItem('user', JSON.stringify(u)); localStorage.setItem('token', t); }} />} />
          <Route path="/register" element={<Register API={API} onAuth={(u,t)=>{ setUser(u); setToken(t); localStorage.setItem('user', JSON.stringify(u)); localStorage.setItem('token', t); }} />} />
          <Route path="/cart" element={<CartPage API={API} cart={cart} setCart={setCart} token={token} setCartOnOrder={()=>setCart([])} />} />
          <Route path="/orders" element={<Orders API={API} token={token} />} />
          <Route path="/admin" element={<Admin API={API} token={token} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
