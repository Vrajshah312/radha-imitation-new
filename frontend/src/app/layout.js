import "@/styles/index.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/Breadcrumbs";
import Footer from "@/components/Footer";
import CartToast from "@/components/CartToast";

export const metadata = {
  title: "Radha Imitation Jewellery",
  description: "Kundan, temple, meenakari & everyday-ethnic imitation jewellery.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <Breadcrumbs />
          <main>{children}</main>
          <Footer />
          <CartToast />
        </Providers>
      </body>
    </html>
  );
}
