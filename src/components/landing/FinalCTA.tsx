import { AtlasContainer } from "@/components/atlas/atlas-container";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

const floatingIcons: {
  icon: AtlasIconName;
  position: string;
  iconClass: string;
}[] = [
  {
    icon: "phone",
    position: "left-[0%] top-[17%]",
    iconClass: "text-[#0d6b4f]",
  },
  {
    icon: "zap",
    position: "right-[16%] top-[11%]",
    iconClass: "text-[#f28a27]",
  },
  {
    icon: "globe",
    position: "left-[3%] bottom-[9%]",
    iconClass: "text-[#168050]",
  },
  {
    icon: "graduation",
    position: "right-[24%] top-[51%]",
    iconClass: "text-[#5033ad]",
  },
];

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#fafafa] py-16 md:py-20 dark:bg-neutral-950">
      <AtlasContainer>
        <div className="relative min-h-[1430px] overflow-hidden rounded-[24px] bg-[#fafafa] dark:bg-neutral-950 md:min-h-[470px]">
          {/* =========================================================
              BACKGROUND RADIAL LINES
              ========================================================= */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="
                absolute
                left-1/2
                top-[45%]
                h-[620px]
                w-[620px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border
                border-neutral-200/70
                dark:border-neutral-800/60
              "
            />

            <div
              className="
                absolute
                left-1/2
                top-[45%]
                h-[500px]
                w-[500px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border
                border-neutral-200/60
                dark:border-neutral-800/50
              "
            />

            <div
              className="
                absolute
                left-1/2
                top-[45%]
                h-[380px]
                w-[380px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border
                border-neutral-200/50
                dark:border-neutral-800/40
              "
            />

            <div
              className="
                absolute
                left-1/2
                top-[45%]
                h-[260px]
                w-[260px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border
                border-neutral-200/40
                dark:border-neutral-800/30
              "
            />

            {/* Very subtle diagonal/radial lines */}
            <div className="absolute left-1/2 top-1/2 h-[700px] w-px -translate-x-1/2 -translate-y-1/2 rotate-[65deg] bg-neutral-200/40 dark:bg-neutral-800/30" />

            <div className="absolute left-1/2 top-1/2 h-[700px] w-px -translate-x-1/2 -translate-y-1/2 rotate-[-65deg] bg-neutral-200/40 dark:bg-neutral-800/30" />
          </div>

          {/* =========================================================
              CTA CONTENT
              ========================================================= */}
          <div className="relative z-10 grid min-h-[430px] items-center gap-10 px-6 py-12 md:min-h-[470px] md:grid-cols-[0.85fr_1.15fr] md:px-10 lg:px-14">
            {/* Text */}
            <div className="relative z-20 max-w-[420px]">
              <h2 className="text-3xl font-bold tracking-[-0.03em] text-neutral-900 md:text-4xl lg:text-[42px] lg:leading-[1.08] dark:text-white">
                Ready to experience
                <br />
                a better way?
              </h2>

              <p className="mt-4 max-w-[390px] text-base leading-7 text-neutral-600 md:text-lg dark:text-neutral-400">
                Join thousands of people and businesses already growing with
                Atlas.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="/sign-up"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-[9px]
                    bg-[#003d2e]
                    px-5
                    py-3
                    text-sm
                    font-medium
                    text-white
                    shadow-sm
                    transition-colors
                    hover:bg-[#004b3b]
                  "
                >
                  Create Free Account
                </a>

                <a
                  href="/contact"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-[9px]
                    border
                    border-neutral-300
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-medium
                    text-neutral-800
                    transition-colors
                    hover:bg-neutral-50
                    dark:border-neutral-700
                    dark:bg-neutral-900
                    dark:text-neutral-100
                    dark:hover:bg-neutral-800
                  "
                >
                  Contact Sales
                </a>
              </div>
            </div>

            {/* =========================================================
                PHONE ILLUSTRATION
                ========================================================= */}
            <div className="relative mx-auto h-[390px] w-full max-w-[500px] md:h-[450px]">
              {/* Subtle glow behind phone */}
              <div
                className="
                  pointer-events-none
                  absolute
                  left-[44%]
                  top-[45%]
                  h-[260px]
                  w-[180px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  bg-[#0b5c44]/[0.06]
                  blur-[50px]
                "
              />

              {/* =====================================================
                  ANGLED PHONE
                  ===================================================== */}
              <div
                className="
                  absolute
                  left-[45%]
                  top-[80%]
                  z-10
                  h-[500px]
                  w-[235px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rotate-[14deg]
                  rounded-[43px]
                  bg-[#202124]
                  p-[5px]
                  shadow-[14px_25px_35px_rgba(0,0,0,0.18)]
                  md:h-[560px]
                  md:w-[265px]
                  md:rounded-[48px]
                "
              >
                {/* Outer metallic highlight */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-[1px]
                    rounded-[41px]
                    border
                    border-white/50
                    md:rounded-[46px]
                  "
                />

                {/* Phone screen */}
                <div
                  className="
                    relative
                    h-full
                    w-full
                    overflow-hidden
                    rounded-[38px]
                    bg-white
                    md:rounded-[43px]
                  "
                >
                  {/* Dynamic Island */}
                  <div
                    className="
                      absolute
                      left-1/2
                      top-0
                      z-20
                      h-[26px]
                      w-[95px]
                      -translate-x-1/2
                      rounded-b-[17px]
                      bg-[#111111]
                      md:h-[29px]
                      md:w-[105px]
                    "
                  >
                    <div className="absolute right-[19px] top-[8px] h-[5px] w-[5px] rounded-full bg-[#252b2b]" />
                  </div>

                  {/* Atlas brand */}
                  <div
                    className="
                      absolute
                      left-1/2
                      top-[39%]
                      flex
                      -translate-x-1/2
                      -translate-y-1/2
                      flex-col
                      items-center
                    "
                  >
                    {/* Atlas A mark */}
                    <svg
                      viewBox="0 0 100 100"
                      className="h-[80px] w-[80px] md:h-[94px] md:w-[94px]"
                      fill="none"
                    >
                      <path
                        d="M49.5 7L17 78H31.5L39 61H61L68.5 78H83L49.5 7Z"
                        fill="#07513B"
                      />

                      <path
                        d="M44.5 50L50 37L55.5 50H44.5Z"
                        fill="white"
                      />
                    </svg>

                    <span
                      className="
                        mt-[2px]
                        text-[21px]
                        font-bold
                        tracking-[3px]
                        text-[#111111]
                        md:text-[24px]
                      "
                    >
                      ATLAS
                    </span>
                  </div>
                </div>
              </div>

              {/* =====================================================
                  FLOATING SERVICE ICONS
                  ===================================================== */}
              {floatingIcons.map((item) => (
                <div
                  key={item.icon}
                  className={`
                    absolute
                    ${item.position}
                    z-20
                    flex
                    h-[64px]
                    w-[64px]
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                    shadow-[0_12px_30px_rgba(0,0,0,0.10)]
                    md:h-[76px]
                    md:w-[76px]
                  `}
                >
                  <div
                    className="
                      flex
                      h-[31px]
                      w-[31px]
                      items-center
                      justify-center
                      md:h-[36px]
                      md:w-[36px]
                    "
                  >
                    <AtlasIcon
                      name={item.icon}
                      className={`h-[28px] w-[28px] md:h-[34px] md:w-[34px] ${item.iconClass}`}
                    />
                  </div>
                </div>
              ))}

              {/* Small decorative dots */}
              <span className="absolute left-[52%] top-[8%] z-0 h-[5px] w-[5px] rounded-full bg-[#77b49e]/40" />
              <span className="absolute right-[18%] bottom-[18%] z-0 h-[4px] w-[4px] rounded-full bg-[#77b49e]/35" />
            </div>
          </div>
        </div>
      </AtlasContainer>
    </section>
  );
}