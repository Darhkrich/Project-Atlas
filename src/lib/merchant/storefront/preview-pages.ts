export type PreviewPage =
  | "home"
  | "products"
  | "product_detail"
  | "about"
  | "contact"
  | "cart"
  | "checkout"
  | "login"
  | "custom_page";

export interface PreviewPageOption {
  value: PreviewPage;
  label: string;
  // Only set for custom_page
  customPageSlug?: string;
}

export const STATIC_PREVIEW_PAGES: PreviewPageOption[] = [
  { value: "home", label: "Home" },
  { value: "products", label: "Products" },
  { value: "product_detail", label: "Product detail" },
  { value: "about", label: "About" },
  { value: "contact", label: "Contact" },
  { value: "cart", label: "Cart" },
  { value: "checkout", label: "Checkout" },
  { value: "login", label: "Sign in" },
];