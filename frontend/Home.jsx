import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home({ API, addToCart }) {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch(API + '/api/products').then(r=>r.json()).then(setProducts);
  }, [API]);

  return (
    <>
      <h2>Products</h2>
      <div className="product-grid">
        {products.map(p => (
          <div className="card" key={p.id}>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <p>₹{p.price}</p>
            <div>
              <Link to={`/product/${p.id}`} className="btn small">View</Link>{' '}
              <button className="btn small" onClick={()=>addToCart(p,1)}>Add to cart</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
