"use client";
import Link from "next/link";
import "@/styles/Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer" data-testid="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src="/logo.png" alt="Radha Imitation Jewellery" className="footer-brand-logo" />
          <p>Handcrafted imitation jewellery — kundan, temple, meenakari and everyday pieces made to be worn and loved.</p>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <Link href="/shop/necklaces" data-testid="footer-necklaces">Necklaces</Link>
          <Link href="/shop/earrings" data-testid="footer-earrings">Earrings</Link>
          <Link href="/shop/bangles-bracelets" data-testid="footer-bangles">Bangles</Link>
          <Link href="/shop?bestseller=true" data-testid="footer-bestsellers">Bestsellers</Link>
        </div>

        <div className="footer-col">
          <h4>Help</h4>
          <a href="#!">Shipping</a>
          <a href="#!">Care Guide</a>
          <a href="#!">Track Order</a>
          <a href="#!">Contact</a>
        </div>

        <div className="footer-col footer-newsletter">
          <h4>Stay In Touch</h4>
          <p>Get early access to new drops and festive offers.</p>
          <form className="footer-form" onSubmit={(e) => e.preventDefault()} data-testid="footer-newsletter-form">
            <input type="email" placeholder="Your email address" required data-testid="footer-newsletter-input" />
            <button type="submit" data-testid="footer-newsletter-submit">Join</button>
          </form>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Radha Imitation Jewellery</span>
        <em>Made with care.</em>
      </div>
    </footer>
  );
}
