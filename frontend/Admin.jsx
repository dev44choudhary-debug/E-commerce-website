import React, { useEffect, useState } from 'react';

export default function Admin({ API, token }) {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [stock, setStock] = useState(1);

  useEffect(() => {
    if (!token) return;
    fetch(API + '/api/admin/orders', { headers: { 'Authorization': 'Bearer ' + token } }).then(r=>r.json()).then(setOrders);
    fetch(API + '/api/admin/customers', { headers: { 'Authorization': 'Bearer ' + token } }).then(r=>r.json()).then(setCustomers);
  }, [API, token]);

  const addProduct = async () => {
    const res = await fetch(API + '/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ title, description: desc, price, stock })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || 'Error');
    alert('Product added');
    setTitle(''); setDesc(''); setPrice(''); setStock(1);
  };

  if (!token) return <div>Login as admin to access this page.</div>;
  return (
    <>
      <h2>Admin Dashboard</h2>
      <div className="card">
        <h3>Add Product</h3>
        <div className="form-row"><label>Title</label><input value={title} onChange={e=>setTitle(e.target.value)} /></div>
        <div className="form-row"><label>Description</label><input value={desc} onChange={e=>setDesc(e.target.value)} /></div>
        <div className="form-row"><label>Price</label><input value={price} onChange={e=>setPrice(e.target.value)} /></div>
        <div className="form-row"><label>Stock</label><input value={stock} onChange={e=>setStock(Number(e.target.value))} /></div>
        <button className="btn" onClick={addProduct}>Add Product</button>
      </div>

      <div className="card" style={{marginTop:12}}>
        <h3>Orders</h3>
        {orders.length===0 ? <p>No orders</p> : (
          <table className="table"><thead><tr><th>ID</th><th>User</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>{orders.map(o=>(
              <tr key={o.id}><td>{o.id}</td><td>{o.userId}</td><td>₹{o.total}</td><td>{o.status}</td></tr>
            ))}</tbody></table>
        )}
      </div>

      <div className="card" style={{marginTop:12}}>
        <h3>Customers</h3>
        {customers.length === 0 ? <p>No customers</p> : (
          <table className="table"><thead><tr><th>ID</th><th>Name</th><th>Email</th></tr></thead>
            <tbody>{customers.map(c=>(
              <tr key={c.id}><td>{c.id}</td><td>{c.name}</td><td>{c.email}</td></tr>
            ))}</tbody></table>
        )}
      </div>
    </>
  );
}
