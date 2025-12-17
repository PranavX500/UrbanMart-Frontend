import { Link } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  return (
    <header className="dash-wrapper">
      <div className="dash-left">
        <div className="dash-brand">UrbanMart</div>

        <Link className="dash-link" to="/">Home</Link>
        <Link className="dash-link" to="/categories">Categories</Link>
        <Link className="dash-link" to="/trending">Trending</Link>
        <Link className="dash-link" to="/orders">Orders</Link>
        <Link className="dash-link" to="/account">Account</Link>
        <Link className="dash-link" to="/cart">Cart</Link>
        <Link to="/orders">Orders</Link>

      </div>

      <div className="dash-search">
        <input placeholder="Search products, brands and more" />
        <button>🔍</button>
      </div>
    </header>
  );
}
