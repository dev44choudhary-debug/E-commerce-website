import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CartPage({ API, cart, setCart, token, setCartOnOrder }) {
  const nav = useNavigate();
  const [address, setAddress] = useState('');
  const total = cart.reduce((s,i)=>s + i.price * i.qty, 0);

  const remove = (id) => setCart(prev => prev.filter(x=>x.id!==id));
  const updateQty = (id, qty) => setCart(prev => prev.map(x=>x.id===id?{...x,qty}:x));

  const placeOrder = async () => {
    if (!token) return alert('Login required');
    if (!address) return alert('Enter address');
    const items = cart.map(i=>({ id: i.id, title: i.title, price: i.price, qty: i.qty }));
    const res = await fetch(API + '/api/orders', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ items, address, paymentMethod: 'COD' })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || 'Error placing order');
    alert('Order placed successfully');
    setCart([]);
    setCartOnOrder();
    nav('/orders');
  };

  return (
    <>
      <h2>Cart</h2>
      <div className="card">
        {cart.length === 0 ? <p>No items</p> : (
          <>
            <table className="table">
              <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead>
              <tbody>
                {cart.map(i=>(
                  <tr key={i.id}>
                    <td>{i.title}</td>
                    <td>₹{i.price}</td>
                    <td><input type="number" min="1" value={i.qty} onChange={e=>updateQty(i.id, Number(e.target.value))} /></td>
                    <td>₹{i.price * i.qty}</td>
                    <td><button onClick={()=>remove(i.id)} className="btn small">Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>Total: ₹{total}</p>
            <div className="form-row"><label>Shipping address</label><textarea value={address} onChange={e=>setAddress(e.target.value)} /></div>
            <button className="btn" onClick={placeOrder}>Place Order (Cash on delivery)</button>
          </>
        )}
      </div>
    </>
  );
}
