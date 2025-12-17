import { useEffect, useState } from "react";
import "./OrdersPage.css";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // -------------------------
  // FETCH ORDERS FROM BACKEND
  // -------------------------
  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("http://localhost:8080/Order/GetOrder", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        console.log("Orders fetched:", data);

        setOrders(Array.isArray(data) ? data : []);

      } catch (err) {
        console.error("Failed to load orders:", err);
      }

      setLoading(false);
    }

    loadOrders();
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Loading orders...</p>;

  if (orders.length === 0)
    return (
      <h2 style={{ padding: 20 }}>
        You haven't placed any orders yet.
      </h2>
    );

  return (
    <div className="orders-wrapper">
      <h2 className="orders-title">Your Orders</h2>

      <div className="orders-list">
        {orders.map((order, idx) => (
          <div className="order-card" key={idx}>
            
            {/* PRODUCT IMAGE */}
            <div className="order-img-box">
              {/* You can improve this if backend returns real images */}
              <img
                src={"/fallback.png"}
                alt={order.pname}
                className="order-img"
              />
            </div>

            {/* ORDER INFO */}
            <div className="order-info">
              <h3 className="order-name">{order.pname}</h3>
              <p className="order-price">₹{order.price}</p>

              <p className="order-meta">
                Product ID: <strong>{order.productId}</strong>
              </p>

              <p className="order-meta">
                User ID: {order.userId}
              </p>

             
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
