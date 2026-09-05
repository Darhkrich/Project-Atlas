import { CartProvider } from "@/contexts/cart-context";
import { CustomerAuthProvider } from "@/contexts/customer-auth-context";

export default function StorefrontSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <CustomerAuthProvider>{children}</CustomerAuthProvider>
    </CartProvider>
  );
}