import Image from "next/image";
import { AtlasContainer } from "@/components/atlas/atlas-container";

const partners = [
  { name: "Airtel", color: "#ED1C24", initials: "A", src: "/airteltigo2.jpg" },
  { name: "MTN", color: "#FFCB05", initials: "M", src: "/mtn4.jpg" },
  { name: "Telecel", color: "#00A651", initials: "T", src: "/telecel3.jpg" },
  { name: "DSTV", color: "#001E60", initials: "D", src: "/dstv1.jpg" },
  { name: "GOtv", color: "#E30613", initials: "G", src: "/gotv4.jpeg" },
  { name: "StarTimes", color: "#005BAC", initials: "S", src: "/startimes3.jpg" },
  { name: "ECG", color: "#0072BC", initials: "E", src: "/ECG1.webp" },
  { name: "WAEC", color: "#00713D", initials: "W", src: "/waec3.jpg" },
 
];

export function TrustMockupSection() {
  return (
    <section className="py-16 md:py-20 bg-neutral-50 dark:bg-neutral-900">
      <AtlasContainer>
        <div>
          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            Trusted by leading networks and partners
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="group flex h-16 w-28 items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
                title={partner.name}
              >
                {partner.src ? (
                  <Image
                    src={partner.src}
                    alt={`${partner.name} logo`}
                    width={80}
                    height={40}
                    className="object-contain"
                  />
                ) : (
                  <>
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: partner.color }}
                    >
                      {partner.initials}
                    </div>
                    <span className="ml-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {partner.name}
                    </span>
                  </>
                )}
              </div>
            ))}
            <span className="text-sm text-neutral-400 dark:text-neutral-500">
              And more...
            </span>
          </div>
        </div>
      </AtlasContainer>
    </section>
  );
}