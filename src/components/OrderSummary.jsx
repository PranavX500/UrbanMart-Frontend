import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OrderSummary.css";

export default function OrderSummary() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // -------------------------------
  // SOURCE OF TRUTH = NAVIGATION STATE
  // -------------------------------
  const initialCart = Array.isArray(state?.cartItems) ? state.cartItems : [];
  const initialRequestId = state?.requestId || "";

  const [cartItems, setCartItems] = useState(initialCart);
  const [requestId] = useState(initialRequestId);
  const [loading, setLoading] = useState(false);

  // -------------------------------
  // SAFETY CHECK
  // -------------------------------
  useEffect(() => {
    if (!initialCart.length || !initialRequestId) {
      console.warn("Invalid OrderSummary entry → redirecting home");
      navigate("/", { replace: true });
    }
  }, [initialCart, initialRequestId, navigate]);

  // -------------------------------
  // SUBTOTAL (quantity aware)
  // -------------------------------
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return sum + price * qty;
    }, 0);
  }, [cartItems]);

  // -------------------------------
  // LOAD RAZORPAY SCRIPT
  // -------------------------------
  function loadRazorpayScript() {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-sdk")) return resolve(true);

      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // -------------------------------
  // CONFIRM ORDER
  // -------------------------------
  async function handleConfirmOrder() {
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) return alert("Razorpay failed to load");

      // Fetch Razorpay order from backend
      const res = await fetch(
        `http://localhost:8080/Order/pay-result/${requestId}`,
        { credentials: "include" }
      );

      if (!res.ok) {
        alert("Failed to initialize payment");
        return;
      }

      const orderData = await res.json();

      const options = {
        key: "rzp_test_RkKXQKUjFhu4mv",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "UrbanMart Payments",
        description: `Order Total: ₹${subtotal}`,
        order_id: orderData.razorpayOrderId,

        handler: async function (response) {
          try {
            const formData = new URLSearchParams();
            formData.append("razorpay_order_id", response.razorpay_order_id);
            formData.append("razorpay_payment_id", response.razorpay_payment_id);
            formData.append("razorpay_signature", response.razorpay_signature);

            // VERIFY PAYMENT
            const verifyRes = await fetch(
              "http://localhost:8080/payment/verify",
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData.toString(),
              }
            );

            const verifyText = await verifyRes.text();
            alert("Payment Status: " + verifyText);

            const verified =
              verifyText.toLowerCase().includes("verified") ||
              verifyText.toLowerCase().includes("success");

            if (verified) {
              // CLEAR CART (safe even for Buy Now)
              await fetch(
                "http://localhost:8080/Cart/All/deleteAllByUserId",
                {
                  method: "DELETE",
                  credentials: "include",
                  headers: {
                    "X-UserId": localStorage.getItem("userId"),
                  },
                }
              );

              navigate("/", { replace: true });
            }
          } catch (err) {
            console.error("Verification failed:", err);
            alert("Payment verification failed");
          }
        },

        theme: { color: "#00a86b" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error("Payment start error:", err);
      alert("Payment failed");
    }
  }

  // -------------------------------
  // UI
  // -------------------------------
  if (loading) return <p style={{ padding: 20 }}>Loading order...</p>;
  if (!cartItems.length)
    return <h2 style={{ padding: 20 }}>No items in order</h2>;

  return (
    <div className="os-wrapper">
      <h2 className="os-title">Order Summary</h2>

      <div className="os-grid">
        <div className="os-left-list">
          {cartItems.map((item) => (
            <div className="os-item" key={item.productId}>
              <img
                src={item.imageUrl || "/fallback.png"}
                alt={item.productName}
              />

              <div className="os-item-info">
                <h3>{item.productName}</h3>
                <p className="os-price-small">
                  ₹{Number(item.price).toLocaleString()}
                </p>
                <p className="os-meta">Qty: {item.quantity}</p>
                <p className="os-meta">Category: {item.categories}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="os-summary-box">
          <p className="os-subtotal">
            Subtotal ({cartItems.length} items):{" "}
            <strong>₹{subtotal.toLocaleString()}</strong>
          </p>

          <p className="os-small">Request ID: {requestId}</p>

          <button className="os-confirm-btn" onClick={handleConfirmOrder}>
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
}
