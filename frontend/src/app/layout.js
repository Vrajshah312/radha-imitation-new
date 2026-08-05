import "@/styles/index.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/Breadcrumbs";
import Footer from "@/components/Footer";
import CartToast from "@/components/CartToast";
import SplashScreen from "@/components/SplashScreen";

export const metadata = {
  title: "Radha Imitation Jewellery",
  description: "Kundan, temple, meenakari & everyday-ethnic imitation jewellery.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SplashScreen />
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
