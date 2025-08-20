import React, { useEffect, useMemo, useState } from 'react';
import { CartIcon } from './Homes';
import { Link, useLocation, useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/CartSlice';

const ProductPage = () => {
const { pathname, search } = useLocation();
const dispatch = useDispatch();
const { sampleProducts } = useSelector((s) => s.cart);
const { id } = useParams();

// convert id to number safely
const pid = useMemo(() => {
const n = Number(id);
return Number.isNaN(n) ? null : n;
}, [id]);

useEffect(() => {
window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
}, [pathname, search]);

const [qty, setQty] = useState(1);

// Fallback data (in case sampleProducts is empty). You can remove this if you always read from store.
const localProducts = [
{
id: 1,
name: 'Sweet Mango Pickle',
price: 249,
originalPrice: 299,
description:
'Our traditional sweet mango pickle is made with carefully selected raw mangoes and a perfect blend of spices. This family recipe has been passed down for generations, preserving the authentic flavors of Indian pickling traditions.',
image:
'https://www.jhajistore.com/cdn/shop/files/6_0db5b18c-a729-4a12-8f33-414be086ce24_500x.jpg?v=1703232511',
category: 'Pickles',
weight: '500g',
ingredients:
'Raw mangoes, mustard oil, fenugreek, fennel, turmeric, red chili powder, salt, spices',
shelfLife: '12 months',
benefits: 'No preservatives - Vegan - Gluten-free - Handcrafted in small batches',
},
// ...baaki items yaha add kar sakte ho
];

// Source of truth: sampleProducts if available, else localProducts
const allProducts = (sampleProducts && sampleProducts.length ? sampleProducts : localProducts);

// Pick product by route id
const product = useMemo(() => {
if (pid == null) return null;
return allProducts.find((p) => String(p.id) === String(pid)) || null;
}, [allProducts, pid]);

// Recommended products: koi simple filter ya static list
const recommendedProducts = useMemo(() => {
return allProducts.filter((p) => product && p.id !== product.id).slice(0, 4);
}, [allProducts, product]);

const addMainToCart = () => {
if (!product) return;
dispatch(addToCart({
id: product.id,
name: product.name,
price: product.price,
image: product.image,
weight: product.weight,
qty: qty,
}));
};

const addRecommended = (rp) => {
dispatch(addToCart({
id: rp.id,
name: rp.name,
price: rp.price,
image: rp.image,
weight: rp.weight,
qty: 1,
}));
};

if (pid == null) {
return <div className="min-h-screen flex items-center justify-center">Invalid product id</div>;
}

if (!product) {
return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
}

return (
<div className="min-h-screen bg-amber-50">
<div className="container mx-auto px-4 py-8 md:py-12">
<div className="bg-white rounded-xl shadow-lg overflow-hidden">
<div className="md:flex">
<div className="md:w-1/2 p-4 md:p-8">
<div className="aspect-square overflow-hidden rounded-lg bg-amber-100">
<img src={product.image} alt={product.name} className="w-full h-full object-cover" />
</div>
</div>

        <div className="md:w-1/2 p-4 md:p-8">
          <div className="mb-2">
            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
              {product.category}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-amber-900 font-serif mb-3">
            {product.name}
          </h1>

          <div className="mb-6">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-amber-700">₹{product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="ml-2 text-gray-500 line-through">₹{product.originalPrice}</span>
                  <span className="ml-2 text-sm bg-amber-200 text-amber-800 px-2 py-0.5 rounded">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
            <span className="text-sm text-gray-600">({product.weight} jar)</span>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-4">{product.description}</p>

            <div className="space-y-3 text-sm">
              {product.ingredients && (
                <div className="flex">
                  <span className="font-medium text-gray-800 w-28">Ingredients:</span>
                  <span className="text-gray-700">{product.ingredients}</span>
                </div>
              )}
              {product.shelfLife && (
                <div className="flex">
                  <span className="font-medium text-gray-800 w-28">Shelf Life:</span>
                  <span className="text-gray-700">{product.shelfLife}</span>
                </div>
              )}
              {product.benefits && (
                <div className="flex">
                  <span className="font-medium text-gray-800 w-28">Benefits:</span>
                  <span className="text-gray-700">{product.benefits}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex items-center border border-amber-300 rounded-lg overflow-hidden">
              <button className="px-3 py-2 bg-amber-100 text-amber-800 hover:bg-amber-200" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
              <span className="px-4 py-2 text-black">{qty}</span>
              <button className="px-3 py-2 bg-amber-100 text-amber-800 hover:bg-amber-200" onClick={() => setQty((q) => q + 1)}>+</button>
            </div>

            <button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors" onClick={addMainToCart}>
              <CartIcon className="w-5 h-5 mr-2" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>

    <div className="mt-12">
      <h2 className="text-2xl font-bold text-amber-900 mb-6 font-serif text-center">You May Also Like</h2>

      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {recommendedProducts.map((rp) => (
          <Link key={rp.id} to={`/product/${rp.id}`}>
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-amber-100">
              <div className="relative aspect-square overflow-hidden">
                <img src={rp.image} alt={rp.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold text-amber-900 line-clamp-1">{rp.name}</h3>
                  {rp.weight && (
                    <span className="bg-amber-100 text-amber-800 text-xs px-1 py-0.5 rounded-full ml-2">
                      {rp.weight}
                    </span>
                  )}
                </div>

                {rp.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{rp.description}</p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-700">₹{rp.price}</span>
                  <button className="bg-amber-600 hover:bg-amber-700 text-white p-1.5 rounded-full text-xs" onClick={(e) => { e.preventDefault(); addRecommended(rp); }} title="Add to Cart">
                    <CartIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </div>
</div>
);
};

export default ProductPage;