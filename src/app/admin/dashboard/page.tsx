import { TotalRevenueCard } from "@/components/admin/dashboard/total-revenue-card";
import { TodayRevenueCard } from "@/components/admin/dashboard/today-revenue-card";
import { ActiveUsersCard } from "@/components/admin/dashboard/active-users-card";
import { TotalUsersCard } from "@/components/admin/dashboard/total-users-card";
import { TransactionsCard } from "@/components/admin/dashboard/transactions-card";
import { CyberAttackCard } from "@/components/admin/dashboard/cyber-attack-card";
import { ServerHealthCard } from "@/components/admin/dashboard/server-health-card";
import { LiveStoresCard } from "@/components/admin/dashboard/live-stores-card";
import { PendingRefundsCard } from "@/components/admin/dashboard/pending-refunds-card";
import { SupportTicketsCard } from "@/components/admin/dashboard/support-tickets-card";
import { ServicePerformanceCard } from "@/components/admin/dashboard/service-performance-card";
import { WalletBalanceCard } from "@/components/admin/dashboard/wallet-balance-card";
import { RevenueByPaymentMethodCard } from "@/components/admin/dashboard/revenue-by-payment-method-card";
import { TopPerformersCard } from "@/components/admin/dashboard/top-performers-card";
import { QuickActionsCard } from "@/components/admin/dashboard/quick-actions-card";
import { RecentEventsCard } from "@/components/admin/dashboard/recent-events-card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Row 1 */}
        <TotalRevenueCard />
        <TodayRevenueCard />
        <ActiveUsersCard />
        {/* Row 2 */}
        <TotalUsersCard />
        <TransactionsCard />
        <CyberAttackCard />
        {/* Row 3 */}
        <ServerHealthCard />
        <LiveStoresCard />
        <PendingRefundsCard />
        {/* Row 4 */}
        <SupportTicketsCard />
        <ServicePerformanceCard />
        <WalletBalanceCard />
        {/* Row 5 */}
        <RevenueByPaymentMethodCard />
        <TopPerformersCard />
        <QuickActionsCard />
        {/* Row 6 */}
        <RecentEventsCard />
      </div>
    </div>
  );
}