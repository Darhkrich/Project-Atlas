export type AtlasServiceStatus =
  | "available"
  | "temporarily_unavailable"
  | "coming_soon";

export type ServiceStep = {
  title: string;
  description: string;
};

export type ServiceOptionGroup = {
  title: string;
  items: string[];
};

export type ServicePricing = {
  type: "fixed" | "variable";
  baseLabel?: string;
  baseAmount?: string;
  feeLabel?: string;
  feeAmount?: string;
  totalLabel?: string;
  totalAmount?: string;
  note?: string;
};

export type AtlasServiceDetails = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  shortDescription: string;
  heroTitle: string;
  heroDescription: string;
  heroCta: string;
  overview: string;
  steps: ServiceStep[];
  requirements: string[];
  options: ServiceOptionGroup[];
  pricing: ServicePricing;
  importantInformation: string[];
  purchaseRoute: string;
  status: AtlasServiceStatus;
  available: boolean;
  icon: string;
};

export const serviceDetails: Record<string, AtlasServiceDetails> = {
  airtime: {
    id: "airtime",
    slug: "airtime",
    name: "Airtime",
    category: "Mobile",
    tagline: "Top up your mobile number with ease.",
    shortDescription:
      "Purchase airtime quickly and securely through Atlas.",
    heroTitle: "Top up your mobile number with ease.",
    heroDescription:
      "Purchase airtime quickly and securely through Atlas.",
    heroCta: "Buy Airtime",
    overview:
      "Purchase airtime for a supported mobile number by selecting the amount and confirming your transaction.",
    steps: [
      {
        title: "Choose your network",
        description: "Select the supported mobile network.",
      },
      {
        title: "Enter the mobile number",
        description: "Provide the number you want to top up.",
      },
      {
        title: "Select the amount",
        description: "Choose the airtime amount.",
      },
      {
        title: "Review and pay",
        description: "Confirm your details and complete payment.",
      },
    ],
    requirements: [
      "Supported mobile network",
      "Recipient phone number",
      "Preferred airtime amount",
    ],
    options: [
      {
        title: "Supported networks",
        items: ["MTN", "Telecel", "AirtelTigo"],
      },
      {
        title: "Popular amounts",
        items: ["GHS 5", "GHS 10", "GHS 20", "GHS 50"],
      },
    ],
    pricing: {
      type: "variable",
      feeLabel: "Atlas fee",
      feeAmount: "GHS 0.00",
      note: "Final amount depends on your selection.",
    },
    importantInformation: [
      "Please confirm that the mobile number is correct before payment.",
      "Completed airtime transactions may not be reversible.",
    ],
    purchaseRoute: "/services/airtime/purchase",
    status: "available",
    available: true,
    icon: "airtime",
  },
  data: {
    id: "data",
    slug: "data",
    name: "Data",
    category: "Mobile",
    tagline: "Stay connected with the right data bundle.",
    shortDescription:
      "Choose a data bundle that fits your needs and purchase it through Atlas.",
    heroTitle: "Stay connected with the right data bundle.",
    heroDescription:
      "Choose a data bundle that fits your needs and purchase it through Atlas.",
    heroCta: "Buy Data",
    overview:
      "Atlas allows you to purchase supported mobile data bundles from one simple interface. Select your network, choose a bundle and complete your purchase.",
    steps: [
      {
        title: "Choose your network",
        description: "Select the supported mobile network.",
      },
      {
        title: "Choose your bundle",
        description: "Pick the data bundle you need.",
      },
      {
        title: "Enter the recipient number",
        description: "Provide the number that should receive the bundle.",
      },
      {
        title: "Review and pay",
        description: "Confirm the details and complete payment.",
      },
    ],
    requirements: [
      "Supported mobile network",
      "Recipient phone number",
      "Preferred data bundle",
    ],
    options: [
      {
        title: "Supported networks",
        items: ["MTN", "Telecel", "AirtelTigo"],
      },
      {
        title: "Bundle categories",
        items: ["Daily", "Weekly", "Monthly", "Non-expiry"],
      },
    ],
    pricing: {
      type: "variable",
      feeLabel: "Atlas fee",
      feeAmount: "GHS 0.00",
      note: "Final pricing depends on the bundle you select.",
    },
    importantInformation: [
      "Confirm the recipient number before payment.",
      "Data bundle delivery may take a short time depending on the network.",
    ],
    purchaseRoute: "/services/data/purchase",
    status: "available",
    available: true,
    icon: "data",
  },
  electricity: {
    id: "electricity",
    slug: "electricity",
    name: "Electricity",
    category: "Utilities",
    tagline: "Purchase electricity credit with ease.",
    shortDescription:
      "Buy electricity credit by providing the required meter information and completing your payment.",
    heroTitle: "Purchase electricity credit with ease.",
    heroDescription:
      "Buy electricity credit by providing the required meter information and completing your payment.",
    heroCta: "Buy Electricity",
    overview:
      "Purchase electricity credit by providing the required meter information and completing your payment.",
    steps: [
      {
        title: "Enter your meter information",
        description: "Provide the required meter number and type.",
      },
      {
        title: "Enter the amount",
        description: "Specify how much electricity credit you need.",
      },
      {
        title: "Review your details",
        description: "Check the meter information and amount.",
      },
      {
        title: "Confirm payment",
        description: "Complete the payment securely.",
      },
    ],
    requirements: [
      "Meter number",
      "Meter type where applicable",
      "Purchase amount",
    ],
    options: [
      {
        title: "Meter types",
        items: ["Prepaid", "Postpaid"],
      },
      {
        title: "Service areas",
        items: ["ECG region 1", "ECG region 2", "Other supported areas"],
      },
    ],
    pricing: {
      type: "variable",
      feeLabel: "Atlas fee",
      feeAmount: "GHS 0.00",
      note: "Final amount depends on the electricity credit purchased.",
    },
    importantInformation: [
      "Electricity purchases may require a valid meter number.",
      "Please verify your meter information before payment.",
    ],
    purchaseRoute: "/services/electricity/purchase",
    status: "available",
    available: true,
    icon: "electricity",
  },
  tv: {
    id: "tv",
    slug: "tv",
    name: "TV Subscriptions",
    category: "Entertainment",
    tagline: "Manage your TV subscription with ease.",
    shortDescription:
      "Subscribe to supported TV packages and manage your subscription through Atlas.",
    heroTitle: "Manage your TV subscription with ease.",
    heroDescription:
      "Subscribe to supported TV packages and manage your subscription through Atlas.",
    heroCta: "Subscribe",
    overview:
      "Manage your supported TV subscription with ease by choosing your provider, entering your smart-card number and selecting a package.",
    steps: [
      {
        title: "Choose your provider",
        description: "Select the supported TV provider.",
      },
      {
        title: "Enter your smart-card number",
        description: "Provide the decoder or smart-card number.",
      },
      {
        title: "Select your package",
        description: "Choose the subscription package.",
      },
      {
        title: "Review and pay",
        description: "Confirm your details and complete payment.",
      },
    ],
    requirements: [
      "Decoder / smart-card number",
      "TV provider",
      "Preferred package",
    ],
    options: [
      {
        title: "Supported providers",
        items: ["DSTV", "GOtv", "Other supported providers"],
      },
      {
        title: "Package duration",
        items: ["Monthly", "Quarterly", "Yearly"],
      },
    ],
    pricing: {
      type: "variable",
      feeLabel: "Atlas fee",
      feeAmount: "GHS 0.00",
      note: "Final pricing depends on the selected package.",
    },
    importantInformation: [
      "Ensure your smart-card number is correct.",
      "Subscription activation may take a short time after payment.",
    ],
    purchaseRoute: "/services/tv/purchase",
    status: "available",
    available: true,
    icon: "tv",
  },
  results: {
    id: "results",
    slug: "results",
    name: "Results Checker",
    category: "Education",
    tagline: "Check your results securely.",
    shortDescription:
      "Purchase and use examination result checker services through Atlas.",
    heroTitle: "Check your results securely.",
    heroDescription:
      "Purchase and use examination result checker services through Atlas.",
    heroCta: "Check Results",
    overview:
      "Purchase and use examination result checker services. Select the examination, enter the required candidate details and complete your payment.",
    steps: [
      {
        title: "Select examination",
        description: "Choose the examination type and year.",
      },
      {
        title: "Enter candidate details",
        description: "Provide the required candidate information.",
      },
      {
        title: "Review",
        description: "Check the details before payment.",
      },
      {
        title: "Pay and check",
        description: "Complete payment and access the result checker.",
      },
    ],
    requirements: [
      "Examination type",
      "Examination year",
      "Candidate/index number",
      "Result checker PIN (if applicable)",
    ],
    options: [
      {
        title: "Examinations",
        items: ["WAEC", "Other supported examinations"],
      },
      {
        title: "Years",
        items: ["2024", "2023", "2022"],
      },
    ],
    pricing: {
      type: "variable",
      feeLabel: "Atlas fee",
      feeAmount: "GHS 0.00",
      note: "Final pricing depends on the result checker selected.",
    },
    importantInformation: [
      "Result checker purchases may not be reversible.",
      "Please ensure the candidate details are correct.",
    ],
    purchaseRoute: "/services/results/purchase",
    status: "available",
    available: true,
    icon: "results",
  },
};

export const serviceDetailSlugs = Object.keys(serviceDetails);

export function getServiceDetails(
  slug: string,
): AtlasServiceDetails | undefined {
  return serviceDetails[slug];
}