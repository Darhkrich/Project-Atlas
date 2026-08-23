import { AtlasContainer } from "@/components/atlas/atlas-container";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

const stats: {
  value: string;
  label: string;
  icon: AtlasIconName;
}[] = [
  { value: "50K+", label: "Happy Customers", icon: "users" },
  { value: "10K+", label: "Active Resellers", icon: "store" },
  { value: "99.9%", label: "Service Uptime", icon: "clock" },
  { value: "1M+", label: "Transactions Completed", icon: "check" },
  { value: "24/7", label: "Customer Support", icon: "headphones" },
];

export function TrustStats() {
  return (
    <section className="py-16 md:py-20">
      <AtlasContainer>
        <div className="rounded-xl bg-[#003D2E] px-6 py-12 md:px-10 md:py-14">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Trusted by thousands across the country
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-green-200">
                  <AtlasIcon name={stat.icon} className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-xs text-green-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </AtlasContainer>
    </section>
  );
}