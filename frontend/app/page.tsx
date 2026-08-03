import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DeviceSummary } from "@/components/dashboard/DeviceSummary";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentTransfers } from "@/components/dashboard/RecentTransfers";
import { TransferStatistics } from "@/components/dashboard/TransferStatistics";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader />

      <QuickActions />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DeviceSummary />
        <RecentTransfers />
      </section>

      <TransferStatistics />
    </div>
  );
}