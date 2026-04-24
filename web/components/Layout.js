import Navbar from './Navbar';
import CartDrawer from './CartDrawer';

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <CartDrawer />

      <main className="main-content">{children}</main>
    </div>
  );
}
