import React, { useEffect, useState } from 'react';

export default function Orders({ API, token }) {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    if (!token) return;
    fetch(API + '/api/myorders', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(r=>r.json()).then(setOrders);
  }, [API, token]);

  if (!token) return <div>Please login to view your orders.</div>;
  return (
    <>
      <h2>My Orders</h2>
      <div className="card">
        {orders.length === 0 ? <p>No orders yet</p> : (
          <table className="table">
            <thead><tr><th>ID</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {orders.map(o=>(
                <tr key={o.id}><td>{o.id}</td><td>₹{o.total}</td><td>{o.status}</td><td>{new Date(o.createdAt).toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
