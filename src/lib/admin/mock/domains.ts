import { mockStorefronts } from "./storefronts";
import type {
  DomainVerificationMethod,
  DomainVerificationStatus,
  StorefrontDomain,
} from "@/lib/admin/types/storefront-domain";
import { generateSlugFromName, generateVerificationToken } from "@/lib/admin/domains/domain-helpers";

interface CustomDomainSeed {
  hostname: string;
  status: DomainVerificationStatus;
  method?: DomainVerificationMethod;
  isPrimary?: boolean;
  failureReason?: string;
}

const CUSTOM_DOMAIN_SEED: Record<string, CustomDomainSeed> = {
  "SF-MER-001": {
    hostname: "techhub.atlas.store",
    status: "verified",
    isPrimary: true,
  },
  "SF-MER-008": {
    hostname: "shop.empiree.com",
    status: "verified",
    isPrimary: true,
  },
  "SF-MER-017": {
    hostname: "wholesale.ghanadirect.com",
    status: "verified",
    isPrimary: false,
  },
  "SF-MER-019": {
    hostname: "shop.healthplus.gh",
    status: "pending",
  },
  "SF-RS-001": {
    hostname: "kwame.digital",
    status: "failed",
    failureReason: "CNAME record not found. DNS propagation may still be underway.",
  },
  "SF-RS-011": {
    hostname: "prince.gh",
    status: "verified",
    isPrimary: true,
  },
};

function buildSeed(): StorefrontDomain[] {
  const now = Date.now();
  const day = 86_400_000;
  const at = (offsetMs: number) => new Date(now + offsetMs).toISOString();

  const usedSlugs = new Set<string>();
  const out: StorefrontDomain[] = [];

  for (const sf of mockStorefronts) {
    const base = generateSlugFromName(sf.storeName);
    let slug = base;
    let suffix = 2;
    while (usedSlugs.has(slug)) {
      slug = base + "-" + suffix;
      suffix += 1;
    }
    usedSlugs.add(slug);

    const customSeed = CUSTOM_DOMAIN_SEED[sf.id];
    const customDomain = customSeed
      ? {
          hostname: customSeed.hostname,
          verificationMethod: customSeed.method ?? "cname",
          verificationToken: generateVerificationToken(),
          verificationStatus: customSeed.status,
          requestedAt: at(-day * 6),
          verifiedAt:
            customSeed.status === "verified" ? at(-day * 5) : undefined,
          failureReason: customSeed.failureReason,
          isPrimary:
            customSeed.isPrimary === true ||
            (customSeed.isPrimary === undefined &&
              customSeed.status === "verified"),
        }
      : undefined;

    out.push({
      storefrontId: sf.id,
      subdomain: {
        slug,
        root: "atlasgh.com",
        isCustomSlug: false,
        createdAt: sf.createdAt,
        updatedAt: sf.createdAt,
      },
      customDomain,
      createdAt: sf.createdAt,
      updatedAt: sf.createdAt,
    });
  }

  return out;
}

export const mockDomains: StorefrontDomain[] = buildSeed();