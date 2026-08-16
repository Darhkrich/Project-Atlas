export type AtlasServiceStatus =
  | "available"
  | "temporarily_unavailable"
  | "coming_soon";

export type AtlasService = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  status: AtlasServiceStatus;
  available: boolean;
  popular?: boolean;
  href: string;
};

export const atlasServices: AtlasService[] = [
  {
    id: "airtime",
    name: "Airtime",
    slug: "airtime",
    description: "Top up any supported mobile number quickly and securely.",
    icon: "airtime",
    category: "Mobile",
    status: "available",
    available: true,
    popular: true,
    href: "/services/airtime",
  },
  {
    id: "data",
    name: "Data",
    slug: "data",
    description: "Choose a data bundle that fits your needs.",
    icon: "data",
    category: "Mobile",
    status: "available",
    available: true,
    popular: true,
    href: "/services/data",
  },
  {
    id: "electricity",
    name: "Electricity",
    slug: "electricity",
    description: "Purchase electricity credit and keep track of your transaction.",
    icon: "electricity",
    category: "Utilities",
    status: "available",
    available: true,
    popular: true,
    href: "/services/electricity",
  },
  {
    id: "tv",
    name: "TV Subscriptions",
    slug: "tv",
    description: "Manage your supported TV subscription with ease.",
    icon: "tv",
    category: "Entertainment",
    status: "available",
    available: true,
    href: "/services/tv",
  },
  {
    id: "results",
    name: "Results Checker",
    slug: "results",
    description: "Purchase and use examination result checker services.",
    icon: "results",
    category: "Education",
    status: "available",
    available: true,
    href: "/services/results",
  },
];