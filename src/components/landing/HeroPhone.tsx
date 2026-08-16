export function HeroPhone() {
  return (
    <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
      <div className="relative w-[210px] h-[435px] rounded-[36px] bg-neutral-900 p-[6px] shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
        <div className="relative h-full w-full overflow-hidden rounded-[30px] bg-[#003D2E]">
          {/* Dynamic island */}
          <div className="absolute top-0 left-1/2 h-5 w-20 -translate-x-1/2 rounded-b-xl bg-neutral-900" />
          {/* Status bar */}
          <div className="flex items-center justify-between px-4 pt-2 text-[8px] text-white">
            <span>9:31</span>
            <span className="flex items-center gap-1">
              <svg className="h-2 w-2" fill="currentColor" viewBox="0 0 24 24"><path d="M2 22h20v2H2z"/></svg>
              <svg className="h-2 w-2" fill="currentColor" viewBox="0 0 24 24"><path d="M2 16h20v6H2z"/></svg>
              <svg className="h-2 w-2" fill="currentColor" viewBox="0 0 24 24"><path d="M2 10h20v6H2z"/></svg>
              <svg className="h-2 w-2" fill="currentColor" viewBox="0 0 24 24"><path d="M2 4h20v6H2z"/></svg>
            </span>
          </div>

          {/* App header */}
          <div className="flex items-center justify-between px-4 mt-3">
            <span className="text-[10px] font-semibold text-white">ATLAS</span>
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>

          {/* Greeting */}
          <div className="px-4 mt-3">
            <div className="text-[9px] text-white/80">Good morning,</div>
            <div className="text-[13px] font-semibold text-white">Emmanuel 👋</div>
          </div>

          {/* Wallet card */}
          <div className="mx-3 mt-3 rounded-lg bg-[#005542] p-3">
            <div className="text-[8px] text-white/70">Wallet Balance</div>
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-bold text-white">₵ 1,250.50</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white text-[10px]">+</span>
            </div>
          </div>

          {/* Service grid */}
          <div className="grid grid-cols-2 gap-2 px-3 mt-3">
            {[
              { label: "Airtime", icon: "📱", color: "bg-yellow-100" },
              { label: "Data", icon: "🌐", color: "bg-green-100" },
              { label: "ECG", icon: "⚡", color: "bg-orange-100" },
              { label: "Results", icon: "🎓", color: "bg-purple-100" },
            ].map((service) => (
              <div key={service.label} className={`rounded-lg ${service.color} p-2`}>
                <span className="text-[10px]">{service.icon}</span>
                <div className="text-[8px] font-medium text-neutral-800 mt-1">{service.label}</div>
              </div>
            ))}
          </div>

          {/* Transactions */}
          <div className="px-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-semibold text-white">Recent Transactions</span>
              <span className="text-[7px] text-white/60">View all</span>
            </div>
            <div className="mt-2 space-y-1.5">
              {[
                { name: "MTN Airtime", amount: "+₵50.00", status: "Successful", time: "Today, 8:42 AM", positive: true },
                { name: "Data Bundle 5GB", amount: "-₵40.00", status: "Successful", time: "Today, 8:41 AM", positive: false },
                { name: "ECG Payment", amount: "-₵100.00", status: "Successful", time: "May 12, 2024", positive: false },
              ].map((tx) => (
                <div key={tx.name} className="flex items-center justify-between rounded-md bg-white/10 px-2 py-1">
                  <div>
                    <div className="text-[7px] font-medium text-white">{tx.name}</div>
                    <div className="text-[6px] text-white/60">{tx.time}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[7px] font-semibold ${tx.positive ? "text-green-300" : "text-white"}`}>{tx.amount}</div>
                    <div className="text-[6px] text-white/60">{tx.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}