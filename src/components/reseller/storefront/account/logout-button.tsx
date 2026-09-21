"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/atlas/button";
import { useStorefrontCustomer } from "@/contexts/storefront-customer-context";

interface Props {
  redirectTo?: string;
}

export function LogoutButton({ redirectTo }: Props) {
  const router = useRouter();
  const { logout } = useStorefrontCustomer();

  const handleLogout = () => {
    logout();
    if (redirectTo) router.push(redirectTo);
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      Log out
    </Button>
  );
}