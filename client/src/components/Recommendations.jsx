import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

function Recommendations() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recommendations/personalized`, { credentials: 'include' })
      .then(res => {
        if (res.status === 401) {
          return { recommendations: [] };
        }
        return res.json();
      })
      .then(data => {
        setProducts(data.recommendations || []);
        setLoading(false);
      })
      .catch(error => {
        console.error("Fetch error:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading recommendations...</div>;

  // Only render the section if there are recommended products
  if (products.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-medium mb-6">Recommended for you</h2>
      <div className="flex flex-wrap gap-4">
        {products.map(prod => (
          <ProductCard key={prod._id} product={prod} />
        ))}
      </div>
    </div>
  );
}

export default Recommendations;
