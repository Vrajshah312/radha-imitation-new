import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard.jsx";
import "./Shop.css";

export default function Shop() {
  const { categoryId, subcategoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("featured");

  const bestseller = searchParams.get("bestseller");
  const isNew = searchParams.get("isNew");
  const search = searchParams.get("search");

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (categoryId) params.category = categoryId;
    if (subcategoryId) params.subcategory = subcategoryId;
    if (bestseller) params.bestseller = bestseller;
    if (isNew) params.isNew = isNew;
    if (search) params.search = search;

    api
      .get("/products", { params })
      .then((res) => setProducts(res.data.products))
      .finally(() => setLoading(false));
  }, [categoryId, subcategoryId, bestseller, isNew, search]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    return 0;
  });

  const activeCategory = categories.find((c) => c.id === categoryId);
  const activeSub = activeCategory?.subcategories.find((s) => s.id === subcategoryId);

  let title = "The Archive";
  let subtitle = "Every piece we make.";
  if (search) { title = `“${search}”`; subtitle = "Search results"; }
  else if (activeSub) { title = activeSub.name; subtitle = activeCategory.name; }
  else if (activeCategory) { title = activeCategory.name; subtitle = activeCategory.tagline; }
  else if (bestseller) { title = "Bestsellers"; subtitle = "The Canon — repeat offenders."; }
  else if (isNew) { title = "New Arrivals"; subtitle = "Chapter three — fresh editions."; }

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="container">
          <div className="shop-header-top">
            <span>Volume 01</span>
            <em>{subtitle}</em>
            <span>{loading ? "…" : `${sortedProducts.length} pieces`}</span>
          </div>
          <h1 data-testid="shop-title">
            {title.includes(" ") ? (
              <>
                {title.split(" ").slice(0, -1).join(" ")}{" "}
                <em>{title.split(" ").slice(-1)}</em>
              </>
            ) : (
              title
            )}
          </h1>
        </div>
      </div>

      <div className="container shop-layout">
        <aside className="shop-sidebar" data-testid="shop-sidebar">
          <div>
            <h4>Categories</h4>
            <ul className="shop-cat-list">
              <li>
                <Link to="/shop" className={!categoryId ? "is-active" : ""} data-testid="shop-cat-all">
                  All Pieces
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/shop/${cat.id}`}
                    className={categoryId === cat.id && !subcategoryId ? "is-active" : ""}
                    data-testid={`shop-cat-${cat.id}`}
                  >
                    {cat.name}
                  </Link>
                  {categoryId === cat.id && (
                    <ul className="shop-sub-list">
                      {cat.subcategories.map((sub) => (
                        <li key={sub.id}>
                          <Link
                            to={`/shop/${cat.id}/${sub.id}`}
                            className={subcategoryId === sub.id ? "is-active" : ""}
                            data-testid={`shop-sub-${sub.id}`}
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Filters</h4>
            <div className="shop-quick-filters">
              <button
                className={bestseller ? "is-active" : ""}
                onClick={() => setSearchParams(bestseller ? {} : { bestseller: "true" })}
                data-testid="shop-filter-bestseller"
              >
                Bestsellers
              </button>
              <button
                className={isNew ? "is-active" : ""}
                onClick={() => setSearchParams(isNew ? {} : { isNew: "true" })}
                data-testid="shop-filter-new"
              >
                New Arrivals
              </button>
            </div>
          </div>
        </aside>

        <div className="shop-main">
          <div className="shop-toolbar">
            <span>{loading ? "Loading…" : `${sortedProducts.length} pieces`}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} data-testid="shop-sort">
              <option value="featured">Sort — Featured</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="rating">Top rated</option>
            </select>
          </div>

          {loading ? (
            <div className="page-loader">Fetching the archive…</div>
          ) : sortedProducts.length === 0 ? (
            <div className="shop-empty">
              <p>Nothing found in this shelf yet.</p>
              <Link to="/shop" className="btn btn-outline" data-testid="shop-reset-filters">
                <span>Reset filters →</span>
              </Link>
            </div>
          ) : (
            <div className="shop-grid" data-testid="shop-grid">
              {sortedProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
