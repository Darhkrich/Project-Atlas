export function HeroResellerCard() {
  return (
    <div className="absolute -right-2 bottom-16 z-30 w-[240px] rounded-xl bg-[#003D2E] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
      <h3 className="text-sm font-semibold text-white">Earn More as a Reseller</h3>
      <p className="mt-1 text-xs text-green-100">
        Start your digital services business and earn on every transaction.
      </p>
      <button className="mt-3 rounded-md bg-[#EAF3EF] px-3 py-1.5 text-xs font-medium text-[#003D2E]">
        Create Free Account
      </button>
      {/* Small storefront illustration */}
      <div className="absolute bottom-2 right-2 opacity-20">
        <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l1-5h16l1 5M3 9h18M5 9v10a2 2 0 002 2h10a2 2 0 002-2V9M9 21v-6h6v6" />
        </svg>
      </div>
    </div>
  );
}