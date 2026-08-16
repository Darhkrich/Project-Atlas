export type ServiceProductField = {
  name: string;
  label: string;
  type: "text" | "tel" | "number" | "select";
  required: boolean;
  placeholder?: string;
  options?: string[];
};

export type ServiceProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  provider?: string;
  network?: string;
  validity?: string;
  metadata?: Record<string, string>;
  status: "available" | "unavailable" | "coming_soon";
  available: boolean;
};

export type ServiceCatalog = {
  slug: string;
  name: string;
  shortDescription: string;
  icon: string;
  productHeading: string;
  fields: ServiceProductField[];
  products: ServiceProduct[];
  allowCustomAmount?: boolean;
  customAmountLabel?: string;
  customAmountMin?: number;
  customAmountMax?: number;
};

export const serviceCatalogs: Record<string, ServiceCatalog> = {
  airtime: {
    slug: "airtime",
    name: "Airtime",
    shortDescription: "Top up your mobile number with ease.",
    icon: "airtime",
    productHeading: "Available Airtime",
    allowCustomAmount: true,
    customAmountLabel: "Custom Airtime Amount",
    customAmountMin: 1,
    customAmountMax: 1000,
    fields: [
      {
        name: "phoneNumber",
        label: "Phone Number",
        type: "tel",
        required: true,
        placeholder: "024 XXX XXXX",
      },
    ],
    products: [
      {
        id: "mtn-5",
        name: "GHS 5 Airtime",
        description: "MTN airtime top-up",
        price: 5,
        currency: "GHS",
        network: "MTN",
        status: "available",
        available: true,
      },
      {
        id: "mtn-10",
        name: "GHS 10 Airtime",
        description: "MTN airtime top-up",
        price: 10,
        currency: "GHS",
        network: "MTN",
        status: "available",
        available: true,
      },
      {
        id: "mtn-20",
        name: "GHS 20 Airtime",
        description: "MTN airtime top-up",
        price: 20,
        currency: "GHS",
        network: "MTN",
        status: "available",
        available: true,
      },
      {
        id: "mtn-50",
        name: "GHS 50 Airtime",
        description: "MTN airtime top-up",
        price: 50,
        currency: "GHS",
        network: "MTN",
        status: "available",
        available: true,
      },
      {
        id: "vodafone-10",
        name: "GHS 10 Airtime",
        description: "Vodafone airtime top-up",
        price: 10,
        currency: "GHS",
        network: "Vodafone",
        status: "available",
        available: true,
      },
      {
        id: "vodafone-20",
        name: "GHS 20 Airtime",
        description: "Vodafone airtime top-up",
        price: 20,
        currency: "GHS",
        network: "Vodafone",
        status: "available",
        available: true,
      },
      {
        id: "telecel-10",
        name: "GHS 10 Airtime",
        description: "Telecel airtime top-up",
        price: 10,
        currency: "GHS",
        network: "Telecel",
        status: "available",
        available: true,
      },
      {
        id: "telecel-20",
        name: "GHS 20 Airtime",
        description: "Telecel airtime top-up",
        price: 20,
        currency: "GHS",
        network: "Telecel",
        status: "available",
        available: true,
      },
    ],
  },
  data: {
    slug: "data",
    name: "Data",
    shortDescription: "Choose a data bundle that works for you.",
    icon: "data",
    productHeading: "Available Data Bundles",
    fields: [
      {
        name: "phoneNumber",
        label: "Phone Number",
        type: "tel",
        required: true,
        placeholder: "024 XXX XXXX",
      },
    ],
    products: [
      {
        id: "mtn-250mb-24h",
        name: "250MB",
        description: "MTN data bundle",
        price: 2,
        currency: "GHS",
        network: "MTN",
        validity: "24 hours",
        status: "available",
        available: true,
      },
      {
        id: "mtn-500mb-24h",
        name: "500MB",
        description: "MTN data bundle",
        price: 3,
        currency: "GHS",
        network: "MTN",
        validity: "24 hours",
        status: "available",
        available: true,
      },
      {
        id: "mtn-1gb-24h",
        name: "1GB",
        description: "MTN data bundle",
        price: 6,
        currency: "GHS",
        network: "MTN",
        validity: "24 hours",
        status: "available",
        available: true,
      },
      {
        id: "mtn-2gb-3d",
        name: "2GB",
        description: "MTN data bundle",
        price: 11,
        currency: "GHS",
        network: "MTN",
        validity: "3 days",
        status: "available",
        available: true,
      },
      {
        id: "mtn-5gb-30d",
        name: "5GB",
        description: "MTN data bundle",
        price: 25,
        currency: "GHS",
        network: "MTN",
        validity: "30 days",
        status: "available",
        available: true,
      },
      {
        id: "mtn-10gb-30d",
        name: "10GB",
        description: "MTN data bundle",
        price: 45,
        currency: "GHS",
        network: "MTN",
        validity: "30 days",
        status: "available",
        available: true,
      },
      {
        id: "telecel-1gb-24h",
        name: "1GB",
        description: "Telecel data bundle",
        price: 5.5,
        currency: "GHS",
        network: "Telecel",
        validity: "24 hours",
        status: "available",
        available: true,
      },
      {
        id: "telecel-2gb-3d",
        name: "2GB",
        description: "Telecel data bundle",
        price: 10,
        currency: "GHS",
        network: "Telecel",
        validity: "3 days",
        status: "available",
        available: true,
      },
      {
        id: "at-1gb-24h",
        name: "1GB",
        description: "AirtelTigo data bundle",
        price: 5.5,
        currency: "GHS",
        network: "AirtelTigo",
        validity: "24 hours",
        status: "available",
        available: true,
      },
      {
        id: "at-2gb-3d",
        name: "2GB",
        description: "AirtelTigo data bundle",
        price: 10,
        currency: "GHS",
        network: "AirtelTigo",
        validity: "3 days",
        status: "available",
        available: true,
      },
    ],
  },
  electricity: {
    slug: "electricity",
    name: "Electricity",
    shortDescription: "Purchase electricity credit with ease.",
    icon: "electricity",
    productHeading: "Available Electricity Options",
    allowCustomAmount: true,
    customAmountLabel: "Custom Electricity Amount",
    customAmountMin: 1,
    customAmountMax: 5000,
    fields: [
      {
        name: "meterNumber",
        label: "Meter Number",
        type: "text",
        required: true,
        placeholder: "1234567890",
      },
      {
        name: "meterType",
        label: "Meter Type",
        type: "select",
        required: true,
        options: ["Prepaid", "Postpaid"],
      },
    ],
    products: [
      {
        id: "ecg-20",
        name: "GHS 20",
        description: "ECG prepaid electricity credit",
        price: 20,
        currency: "GHS",
        provider: "ECG",
        status: "available",
        available: true,
      },
      {
        id: "ecg-50",
        name: "GHS 50",
        description: "ECG prepaid electricity credit",
        price: 50,
        currency: "GHS",
        provider: "ECG",
        status: "available",
        available: true,
      },
      {
        id: "ecg-100",
        name: "GHS 100",
        description: "ECG prepaid electricity credit",
        price: 100,
        currency: "GHS",
        provider: "ECG",
        status: "available",
        available: true,
      },
      {
        id: "ecg-200",
        name: "GHS 200",
        description: "ECG prepaid electricity credit",
        price: 200,
        currency: "GHS",
        provider: "ECG",
        status: "available",
        available: true,
      },
    ],
  },
  tv: {
    slug: "tv",
    name: "TV Subscriptions",
    shortDescription: "Manage your TV subscription with ease.",
    icon: "tv",
    productHeading: "Available Packages",
    fields: [
      {
        name: "smartCardNumber",
        label: "Smart Card / Decoder Number",
        type: "text",
        required: true,
        placeholder: "1234567890",
      },
    ],
    products: [
      {
        id: "dstv-premium-monthly",
        name: "Premium",
        description: "DSTV package",
        price: 300,
        currency: "GHS",
        provider: "DSTV",
        validity: "30 days",
        status: "available",
        available: true,
      },
      {
        id: "dstv-compact-monthly",
        name: "Compact",
        description: "DSTV package",
        price: 150,
        currency: "GHS",
        provider: "DSTV",
        validity: "30 days",
        status: "available",
        available: true,
      },
      {
        id: "gotv-max-monthly",
        name: "Max",
        description: "GOtv package",
        price: 80,
        currency: "GHS",
        provider: "GOtv",
        validity: "30 days",
        status: "available",
        available: true,
      },
    ],
  },
  results: {
    slug: "results",
    name: "Results Checker",
    shortDescription: "Check your results securely.",
    icon: "results",
    productHeading: "Available Result Checker Options",
    fields: [
      {
        name: "candidateNumber",
        label: "Candidate / Index Number",
        type: "text",
        required: true,
        placeholder: "1234567890",
      },
    ],
    products: [
      {
        id: "waec-2025",
        name: "WASSCE 2025",
        description: "WAEC result checker",
        price: 20,
        currency: "GHS",
        provider: "WAEC",
        status: "available",
        available: true,
      },
      {
        id: "waec-2024",
        name: "WASSCE 2024",
        description: "WAEC result checker",
        price: 20,
        currency: "GHS",
        provider: "WAEC",
        status: "available",
        available: true,
      },
    ],
  },
};

export const serviceCatalogSlugs = Object.keys(serviceCatalogs);

export function getServiceCatalog(
  slug: string,
): ServiceCatalog | undefined {
  return serviceCatalogs[slug];
}