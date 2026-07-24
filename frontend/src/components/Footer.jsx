import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer" data-testid="site-footer">
      <div className="container footer-manifest">
        <span className="eyebrow">Manifesto · Chapter Four</span>
        <h2>
          For the ones<br />who make <em>ordinary</em><br />moments count.
        </h2>
      </div>

      <div className="container footer-grid">
        <div className="footer-brand">
          <span className="brand-mark">Radha<em>.</em></span>
          <p>
            An editorial archive of imitation heirlooms — kundan, temple &amp;
            meenakari, engineered to be worn, not locked away.
          </p>
        </div>

        <div className="footer-col">
          <h4>Archive</h4>
          <Link to="/shop/necklaces" data-testid="footer-necklaces">Necklaces</Link>
          <Link to="/shop/earrings" data-testid="footer-earrings">Earrings</Link>
          <Link to="/shop/bangles-bracelets" data-testid="footer-bangles">Bangles</Link>
          <Link to="/shop?bestseller=true" data-testid="footer-bestsellers">Bestsellers</Link>
        </div>

        <div className="footer-col">
          <h4>Studio</h4>
          <a href="#!">Shipping</a>
          <a href="#!">Care Guide</a>
          <a href="#!">Track Order</a>
          <a href="#!">Contact</a>
        </div>

        <div className="footer-col footer-newsletter">
          <h4>Correspondence</h4>
          <p>Field notes, next drops, private pre-sales. One dispatch a fortnight.</p>
          <form className="footer-form" onSubmit={(e) => e.preventDefault()} data-testid="footer-newsletter-form">
            <input type="email" placeholder="Your email address" required data-testid="footer-newsletter-input" />
            <button type="submit" data-testid="footer-newsletter-submit">Subscribe →</button>
          </form>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Radha Imitation Jewellery</span>
        <div className="footer-index">
          <span className="footer-index-num">RJ / 001</span>
          <span>Made with care.</span>
        </div>
      </div>
    </footer>
  );
}
