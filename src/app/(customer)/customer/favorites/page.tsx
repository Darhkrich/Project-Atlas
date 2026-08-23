import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { FavoritesList } from "@/components/customer/favorites-list";

export default function FavoritesPage() {
  return (
    <>
      <CustomerPageHeader
        title="Favorites"
        description="Save your most-used details for faster checkouts."
      />
      <FavoritesList />
    </>
  );
}