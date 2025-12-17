import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ProductPage.css";

const PROFILE_ENDPOINT =
  import.meta.env.VITE_PROFILE_ENDPOINT ?? "/api/auth/profile";

export default function ProductPage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    "ELECTRONICS", "FASHION", "HOME_APPLIANCES", "BEAUTY", "HEALTH", "SPORTS",
    "BOOKS", "TOYS", "GROCERIES", "FURNITURE", "AUTOMOTIVE", "JEWELLERY",
    "FOOTWEAR", "STATIONERY", "PET_SUPPLIES", "GARDEN", "MUSIC", "SOFTWARE",
    "MOBILE_ACCESSORIES", "COMPUTER_ACCESSORIES"
  ];

  // -----------------------------
  // LOAD USER PROFILE
  // -----------------------------
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(PROFILE_ENDPOINT, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) setProfile(await response.json());
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadProfile();
  }, []);

  // -----------------------------
  // MAIN PRODUCT LOADER
  // -----------------------------
  async function loadProducts() {
    setLoadingProducts(true);

    try {
      const hasMin = minPrice !== "" && Number(minPrice) >= 0;
      const hasMax = maxPrice !== "" && Number(maxPrice) >= 0;

      let url = "";

      // RULE 1 — NO category, NO price → fetch ALL
      if (!selectedCategory && !hasMin && !hasMax) {
        url = "http://localhost:8080/Product/all";

        const r = await fetch(url, { credentials: "include" });
        const data = await r.json();

        setProducts(data);
        setTotalPages(1);
        setLoadingProducts(false);
        return;
      }

      // RULE 2 — ONLY CATEGORY → fetch category products
      if (selectedCategory && !hasMin && !hasMax) {
        url = `http://localhost:8080/Product/category/${selectedCategory}`;

        const r = await fetch(url, { credentials: "include" });
        const data = await r.json();

        setProducts(data);
        setTotalPages(1);
        setLoadingProducts(false);
        return;
      }

      // RULE 3 — PRICE FILTER (with or without category)
      let min = hasMin ? Number(minPrice) : 0;
      let max = hasMax ? Number(maxPrice) : 99999999;

      url = "http://localhost:8080/Product/BetweenPricePaginated?";
      if (selectedCategory) url += `categories=${selectedCategory}&`;

      url += `minprice=${min}&maxprice=${max}&page=${page}&size=10`;

      const r = await fetch(url, { credentials: "include" });
      const data = await r.json();

      setProducts(data.content || []);
      setTotalPages(data.totalPages || 1);
      setLoadingProducts(false);
      return;

    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts([]);
      setTotalPages(1);
    }

    setLoadingProducts(false);
  }

  // -----------------------------
  // LOAD WHEN FILTERS CHANGE
  // -----------------------------
  useEffect(() => {
    loadProducts();
  }, [selectedCategory, minPrice, maxPrice, page]);

  // -----------------------------
  // CATEGORY TOGGLE
  // -----------------------------
  function toggleCategory(cat) {
    setSelectedCategory(selectedCategory === cat ? null : cat);
    setPage(0);
  }

  // -----------------------------
  // CLEAR ALL FILTERS
  // -----------------------------
  function clearAllFilters() {
    setSelectedCategory(null);
    setMinPrice("");
    setMaxPrice("");
    setPage(0);
  }

  // -----------------------------
  // ADD TO CART HANDLER
  // -----------------------------
  async function addToCart(productId) {
    try {
      await fetch(`http://localhost:8080/Cart/getById/${productId}`, {
        method: "GET",
        credentials: "include"
      });

      alert("Added to Cart!");

      // OPTIONAL: navigate to cart page
      // navigate("/cart");

    } catch (err) {
      console.error("Add to cart failed:", err);
      alert("Failed to add to cart");
    }
  }

  return (
    <div className="pm-wrapper">
      <div className="pm-container">

        {/* LEFT FILTER SIDEBAR */}
        <aside className="pm-filter-sidebar">
          <div className="pm-filter-header">
            <h3>Filters</h3>
            <button className="pm-clear" onClick={clearAllFilters}>
              Clear All
            </button>
          </div>

          {/* CATEGORY FILTER */}
          <div className="pm-filter-block">
            <div className="pm-filter-title">Category</div>

            <div className="pm-category-list">
              {categories.map((cat) => (
                <label key={cat} className="pm-category-option">
                  <input
                    type="checkbox"
                    checked={selectedCategory === cat}
                    onChange={() => toggleCategory(cat)}
                  />
                  <span>{cat.replace(/_/g, " ")}</span>
                </label>
              ))}
            </div>
          </div>

          {/* PRICE FILTER */}
          <div className="pm-filter-block">
            <div className="pm-filter-title">Price</div>
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(0);
              }}
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(0);
              }}
            />

            <button className="pm-btn-primary" onClick={loadProducts}>
              Apply
            </button>
          </div>
        </aside>

        {/* PRODUCT LIST AREA */}
        <main className="pm-main">
          <div className="pm-headerrow">
            <div>
              <p className="pm-eyebrow">NEW COLLECTION</p>
              <h1 className="pm-title">Discover Products</h1>
            </div>
          </div>

          <div className="pm-grid">
            {loadingProducts ? (
              <p>Loading...</p>
            ) : (
              products.map((p) => (
                <article className="pm-card" key={p.productId}>
                  <Link
                    to={`/product/${p.productId}`}
                    className="pm-card-link"
                  >
                    <div className="pm-card-img">
                      <img
                        src={p.imageUrl || "/placeholder.png"}
                        alt={p.productName}
                      />
                    </div>
                  </Link>

                  <div className="pm-card-info">
                    <h3>{p.productName}</h3>
                    <p className="pm-price">₹{p.price}</p>
                    <p className="pm-meta">Brand: {p.brand}</p>
                    <p className="pm-meta">Category: {p.categories}</p>

                    <button
                      className="pm-add"
                      onClick={() => addToCart(p.productId)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 0} onClick={() => setPage(page - 1)}>
                Prev
              </button>

              <span>
                Page {page + 1} of {totalPages}
              </span>

              <button
                disabled={page + 1 === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
