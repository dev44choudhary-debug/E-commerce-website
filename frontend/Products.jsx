import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function Product({ API, addToCart }) {
  const { id } = useParams();
  const [p, setP] = useState(null);
  useEffect(() => {
    fetch(API + '/api/products/' + id).then(r=>r.ok ? r.json() : null).then(setP);
  }, [API, id]);
  const [qty, setQty] = useState(1);

  if (!p) return <div>Loading...</div>;
  return (
    <>
      <h2>{p.title}</h2>
      <div className="card">
        <p>{p.description}</p>
        <p>Price: ₹{p.price}</p>
        <p>Stock: {p.stock}</p>
        <div className="form-row">
          <label>Qty</label>
          <input type="number" min="1" value={qty} onChange={e=>setQty(Number(e.target.value))} />
        </div>
        <button className="btn" onClick={()=>addToCart(p, qty)}>Add to cart</button>
      </div>
    </>
  );
}
