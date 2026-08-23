import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { NotificationsList } from "@/components/customer/notifications-list";

export default function NotificationsPage() {
  return (
    <>
      <CustomerPageHeader
        title="Notifications"
        description="Stay updated with your latest account activity and alerts."
      />
      <NotificationsList />
    </>
  );
}