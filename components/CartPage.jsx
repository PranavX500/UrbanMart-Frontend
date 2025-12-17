import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  // -------------------------
  // LOAD CART
  // -------------------------
  async function loadCart() {
    try {
      const res = await fetch("http://localhost:8080/Cart/getCart", {
        credentials: "include",
      });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load cart:", err);
    }
    setLoading(false);
  }

  // -------------------------
  // UPDATE QUANTITY (LOCAL)
  // -------------------------
  function handleQtyChange(cartId, qty) {
    setItems((prev) =>
      prev.map((item) =>
        item.cartId === cartId
          ? { ...item, quantity: Number(qty) }
          : item
      )
    );
  }

  // -------------------------
  // DELETE CART ITEM
  // -------------------------
  async function handleDelete(cartId) {
    try {
      await fetch(
        `http://localhost:8080/Cart/delete?cartId=${cartId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "X-UserId": localStorage.getItem("userId"),
          },
        }
      );

      setItems((prev) => prev.filter((i) => i.cartId !== cartId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  // -------------------------
  // SUBTOTAL
  // -------------------------
  function calculateSubtotal() {
    return items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  // -------------------------
  // REQUEST ID
  // -------------------------
  function generateRequestId() {
    return Math.random().toString(36).substring(2, 10);
  }

  // -------------------------
  // PROCEED TO BUY (🔥 FIXED)
  // -------------------------
  async function handleBuy() {
    if (!items.length) {
      alert("Cart is empty");
      return;
    }

    const requestId = generateRequestId();

    // ✅ NEW BACKEND FORMAT
    const body = {
      requestId,
      items: items.map((item) => ({
        id: item.productId,      // 🔥 IMPORTANT
        quantity: item.quantity // 🔥 USER SELECTED
      })),
    };

    try {
      const res = await fetch(
        "http://localhost:8080/Order/Order-Summary",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        }
      );

      const responseText = await res.text();

      navigate("/order-summary", {
        state: {
          requestId,
          cartItems: items,
          responseId: responseText,
        },
      });

    } catch (err) {
      console.error("Order error:", err);
      alert("Order failed");
    }
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="cart-wrapper">
      <div className="cart-container">

        <div className="cart-items">
          <h2>Shopping Cart</h2>

          {loading ? (
            <p>Loading...</p>
          ) : items.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            items.map((item) => (
              <div className="cart-item" key={item.cartId}>
                <img
                  src={item.imageUrl || "/placeholder.png"}
                  alt={item.productName}
                />

                <div className="cart-details">
                  <h3>{item.productName}</h3>
                  <p className="cart-price">₹{item.price}</p>

                  <div className="cart-qty">
                    <span>Qty:</span>
                    <select
                      value={item.quantity}
                      onChange={(e) =>
                        handleQtyChange(item.cartId, e.target.value)
                      }
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    className="cart-delete"
                    onClick={() => handleDelete(item.cartId)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-summary">
          <p>
            Subtotal ({items.length} items):
            <strong> ₹{calculateSubtotal()}</strong>
          </p>

          <button className="cart-checkout-btn" onClick={handleBuy}>
            Proceed to Buy
          </button>
        </div>
      </div>
    </div>
  );
}
