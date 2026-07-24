import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src={logo} alt="Radha Imitation Jewellery" />
          <p>
            Handcrafted imitation jewellery designed for every celebration —
            kundan, temple, meenakari and more, made to be worn and loved.
          </p>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/shop/necklaces">Necklaces &amp; Sets</Link>
          <Link to="/shop/earrings">Earrings</Link>
          <Link to="/shop/bangles-bracelets">Bangles &amp; Bracelets</Link>
          <Link to="/shop?bestseller=true">Bestsellers</Link>
        </div>

        <div className="footer-col">
          <h4>Help</h4>
          <a href="#!">Shipping &amp; Returns</a>
          <a href="#!">Care Guide</a>
          <a href="#!">Track Your Order</a>
          <a href="#!">Contact Us</a>
        </div>

        <div className="footer-col footer-newsletter">
          <h4>Stay in the loop</h4>
          <p>Sign up for early access to new drops and festive offers.</p>
          <form className="footer-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email address" required />
            <button className="btn btn-primary btn-small" type="submit">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom container">
        <span>© {new Date().getFullYear()} Radha Imitation Jewellery. All rights reserved.</span>
        <span>Made with care, for every occasion.</span>
      </div>
    </footer>
  );
}
