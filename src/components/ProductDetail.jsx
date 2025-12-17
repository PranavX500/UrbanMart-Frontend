import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ProductDetail.css";

export default function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  // -------------------------
  // Generate random requestId
  // -------------------------
  function generateRequestId() {
    return Math.random().toString(36).substring(2, 10);
  }

  // -------------------------
  // BUY NOW (SINGLE PRODUCT)
  // -------------------------
  async function handleBuyNow() {
    if (!product) return;

    const requestId = generateRequestId();

    // ✅ NEW BACKEND CONTRACT
    const body = {
      items: [
        {
          id: product.productId,
          quantity: 1, // Buy Now = 1
        },
      ],
      requestId,
    };

    try {
      const res = await fetch("http://localhost:8080/Order/Order-Summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Order-Summary failed");
      }

      await res.text(); // backend returns text (not needed further)

      // ✅ NAVIGATE WITH STATE (NO CART FETCH)
      navigate(
        "/order-summary",
        {
          state: {
            requestId,
            cartItems: [
              {
                productId: product.productId,
                productName: product.productName,
                price: Number(product.price),
                brand: product.brand,
                categories: product.categories,
                quantity: 1,
                imageUrl: product.imageUrl,
              },
            ],
          },
        },
        { replace: true }
      );
    } catch (err) {
      console.error("Buy Now failed:", err);
      alert("Error placing order");
    }
  }

  // -------------------------
  // LOAD PRODUCT DETAILS
  // -------------------------
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(
          `http://localhost:8080/Product/products/${id}`,
          { credentials: "include" }
        );

        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error("Product fetch failed:", error);
      }
    }

    fetchProduct();
  }, [id]);

  // -------------------------
  // UI
  // -------------------------
  if (!product) {
    return (
      <p style={{ padding: "30px", fontSize: "18px" }}>
        Loading product...
      </p>
    );
  }

  return (
    <div className="pd-wrapper">
      <p className="pd-breadcrumb">
        Home / {product.categories} / {product.productName}
      </p>

      <div className="pd-container">
        {/* LEFT */}
        <div className="pd-left">
          <div className="pd-thumbnails">
            {[1, 2, 3].map((thumb) => (
              <img
                key={thumb}
                className="pd-thumb"
                src={product.imageUrl || "/fallback.png"}
                alt="thumb"
              />
            ))}
          </div>

          <div className="pd-main-image">
            <img
              src={product.imageUrl || "/fallback.png"}
              alt={product.productName}
            />
          </div>

          <div className="pd-action-row">
            <button className="pd-btn-cart">Add to Cart</button>

            <button className="pd-btn-buy" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="pd-right">
          <h2 className="pd-title">{product.productName}</h2>

          <div className="pd-price-box">
            <h2 className="pd-price">₹{product.price}</h2>
            <span className="pd-tag">Free Delivery</span>
          </div>

          <div className="pd-meta">
            <p><strong>Brand:</strong> {product.brand}</p>
            <p><strong>Category:</strong> {product.categories}</p>
            <p><strong>Quantity Left:</strong> {product.quantity}</p>
          </div>

          <h3 className="pd-sec-title">Product Description</h3>
          <p className="pd-desc">{product.description}</p>

          <h3 className="pd-sec-title">Product Highlights</h3>
          <ul className="pd-highlights">
            <li>High Quality Product</li>
            <li>Best Value for Money</li>
            <li>Trusted Brand</li>
            <li>Fast & Safe Delivery</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
