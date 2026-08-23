import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

const serviceItems: {
  label: string;
  icon: AtlasIconName;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    label: "Airtime",
    icon: "phone",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  {
    label: "Data",
    icon: "globe",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    label: "ECG",
    icon: "zap",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
  },
  {
    label: "Results Checker",
    icon: "graduation",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-700",
  },
];

const transactions: {
  name: string;
  amount: string;
  status: string;
  time: string;
  positive: boolean;
  icon: AtlasIconName;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    name: "MTN Airtime",
    amount: "+₵50.00",
    status: "Successful",
    time: "Today, 8:42 AM",
    positive: true,
    icon: "phone",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  {
    name: "Data Bundle 5GB",
    amount: "-₵40.00",
    status: "Successful",
    time: "Today, 8:41 AM",
    positive: false,
    icon: "globe",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    name: "ECG Payment",
    amount: "-₵100.00",
    status: "Successful",
    time: "May 12, 2024",
    positive: false,
    icon: "zap",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
];

export function HeroPhone() {
  return (
    <div className="absolute left-1/3 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
      {/* iPhone outer frame */}
      <div
        className="
          relative
          h-[435px]
          w-[210px]
          rounded-[40px]
          bg-[#111111]
          p-[4px]
          shadow-[0_24px_55px_rgba(0,0,0,0.30)]
        "
      >
        {/* Subtle outer frame highlight */}
        <div className="pointer-events-none absolute inset-[1px] rounded-[39px] border border-white/20" />

        {/* Phone screen */}
        <div
          className="
            relative
            h-full
            w-full
            overflow-hidden
            rounded-[36px]
            bg-white
          "
        >
          {/* =========================================================
              GREEN TOP SECTION
              ========================================================= */}
          <div
            className="
              absolute
              inset-x-0
              top-0
              h-[166px]
              bg-gradient-to-br
              from-[#07503a]
              via-[#06432f]
              to-[#022d21]
            "
          />

          {/* Soft green glow behind wallet */}
          <div
            className="
              pointer-events-none
              absolute
              -right-8
              top-[80px]
              h-[95px]
              w-[95px]
              rounded-full
              bg-emerald-400/10
              blur-2xl
            "
          />

          {/* =========================================================
              DYNAMIC ISLAND / NOTCH
              ========================================================= */}
          <div
            className="
              absolute
              left-1/2
              top-0
              z-30
              h-[20px]
              w-[76px]
              -translate-x-1/2
              rounded-b-[15px]
              bg-black
            "
          >
            <div className="absolute right-[14px] top-[6px] h-[5px] w-[5px] rounded-full bg-[#101b1b]" />
          </div>

          {/* =========================================================
              STATUS BAR
              ========================================================= */}
          <div className="relative z-10 flex items-center justify-between px-[18px] pt-[10px] text-[7px] font-semibold text-white/95">
            <span>13.51</span>

            <div className="flex items-center gap-[4px]">
              {/* Signal */}
              <div className="flex h-[7px] items-end gap-[1px]">
                <span className="h-[2px] w-[1.5px] rounded-full bg-white" />
                <span className="h-[3.5px] w-[1.5px] rounded-full bg-white" />
                <span className="h-[5px] w-[1.5px] rounded-full bg-white" />
                <span className="h-[6.5px] w-[1.5px] rounded-full bg-white" />
              </div>

              {/* WiFi */}
              <svg
                className="h-[7px] w-[7px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M3 8.5C8.2 4.2 15.8 4.2 21 8.5" />
                <path d="M6.5 12C10 9.2 14 9.2 17.5 12" />
                <path d="M10 15.5C11.2 14.5 12.8 14.5 14 15.5" />
              </svg>

              {/* Battery */}
              <div className="relative h-[6px] w-[11px] rounded-[1.5px] border border-white/80 p-[1px]">
                <div className="h-full w-full rounded-[0.5px] bg-white" />
                <span className="absolute -right-[2px] top-[1.5px] h-[2px] w-[1px] rounded-r bg-white/80" />
              </div>
            </div>
          </div>

          {/* =========================================================
              APP HEADER
              ========================================================= */}
          <div className="relative z-10 mt-[14px] flex items-center justify-between px-[15px]">
            {/* Atlas logo */}
            <div className="flex items-center gap-[5px]">
              <div className="flex items-center justify-center">
                <span
                  className="
                    text-[18px]
                    font-medium
                    leading-none
                    tracking-[-1.5px]
                    text-white
                  "
                >
                  A
                </span>
              </div>

              <span className="text-[10px] font-semibold tracking-[0.8px] text-white">
                ATLAS
              </span>
            </div>

            {/* Menu + notification */}
            <div className="flex items-center gap-[12px]">
              <AtlasIcon
                name="menu"
                className="h-[13px] w-[13px] text-white"
              />

              <div className="relative">
                <AtlasIcon
                  name="bell"
                  className="h-[13px] w-[13px] text-white"
                />

                <span
                  className="
                    absolute
                    -right-[2px]
                    -top-[2px]
                    h-[5px]
                    w-[5px]
                    rounded-full
                    bg-orange-400
                    ring-[1px]
                    ring-[#07503a]
                  "
                />
              </div>
            </div>
          </div>

          {/* =========================================================
              GREETING
              ========================================================= */}
          <div className="relative z-10 mt-[17px] px-[15px]">
            <p className="text-[8px] font-normal leading-none text-white/75">
              Good morning,
            </p>

            <p className="mt-[3px] flex items-center gap-[3px] text-[12px] font-bold leading-none text-white">
              Emmanuel
              <span className="text-[9px]">👋</span>
            </p>
          </div>

          {/* =========================================================
              WALLET BALANCE
              ========================================================= */}
          <div
            className="
              relative
              z-20
              mx-[11px]
              mt-[12px]
              rounded-[14px]
              border
              border-white/10
              bg-gradient-to-br
              from-[#10533d]
              to-[#063726]
              px-[12px]
              py-[10px]
              shadow-[0_8px_20px_rgba(0,0,0,0.16)]
            "
          >
            <p className="text-[7px] font-medium text-white/65">
              Wallet Balance
            </p>

            <div className="mt-[2px] flex items-center justify-between">
              <span className="text-[15px] font-semibold tracking-[-0.4px] text-white">
                ₵ 1,250.50
              </span>

              <button
                type="button"
                aria-label="Add money"
                className="
                  flex
                  h-[24px]
                  w-[24px]
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-[17px]
                  font-normal
                  leading-none
                  text-[#174738]
                  shadow-sm
                "
              >
                +
              </button>
            </div>
          </div>

          {/* =========================================================
              MAIN WHITE DASHBOARD AREA
              ========================================================= */}
          <div className="absolute inset-x-0 bottom-0 top-[159px] rounded-t-[18px] bg-[#fafafa]" />

          {/* =========================================================
              SERVICE GRID
              ========================================================= */}
          <div className="relative z-10 mt-[10px] grid grid-cols-2 gap-[8px] px-[11px]">
            {serviceItems.map((service) => (
              <div
                key={service.label}
                className="
                  flex
                  min-h-[49px]
                  items-center
                  gap-[8px]
                  rounded-[11px]
                  border
                  border-black/[0.025]
                  bg-white
                  px-[10px]
                  shadow-[0_2px_8px_rgba(0,0,0,0.035)]
                "
              >
                <div
                  className={`
                    flex
                    h-[27px]
                    w-[27px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    ${service.iconBg}
                    ${service.iconColor}
                  `}
                >
                  <AtlasIcon
                    name={service.icon}
                    className="h-[13px] w-[13px]"
                  />
                </div>

                <span className="text-[8px] font-semibold leading-[1.15] text-[#242424]">
                  {service.label}
                </span>
              </div>
            ))}
          </div>

          {/* =========================================================
              RECENT TRANSACTIONS
              ========================================================= */}
          <div className="relative z-10 mt-[14px] px-[14px]">
            {/* Section header */}
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold text-[#252525]">
                Recent Transactions
              </span>

              <span className="text-[7px] font-medium text-[#52645d]">
                View all
              </span>
            </div>

            {/* Transaction list */}
            <div className="mt-[7px] divide-y divide-[#eeeeee]">
              {transactions.map((tx) => (
                <div
                  key={tx.name}
                  className="
                    flex
                    min-h-[46px]
                    items-center
                    justify-between
                    bg-white
                    py-[6px]
                  "
                >
                  {/* Left side */}
                  <div className="flex min-w-0 items-center gap-[8px]">
                    <div
                      className={`
                        flex
                        h-[24px]
                        w-[24px]
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        ${tx.iconBg}
                        ${tx.iconColor}
                      `}
                    >
                      <AtlasIcon
                        name={tx.icon}
                        className="h-[11px] w-[11px]"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[7.5px] font-semibold text-[#303030]">
                        {tx.name}
                      </p>

                      <p className="mt-[2px] text-[6px] font-normal text-[#a1a1a1]">
                        {tx.status}
                      </p>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="ml-2 shrink-0 text-right">
                    <p
                      className={`
                        text-[7.5px]
                        font-bold
                        ${tx.positive ? "text-[#398a65]" : "text-[#303030]"}
                      `}
                    >
                      {tx.amount}
                    </p>

                    <p className="mt-[2px] text-[6px] font-normal text-[#a1a1a1]">
                      {tx.time}
                    </p>
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