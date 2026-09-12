// lib/services-page-data.ts

export type FormFieldConfig = {
  name: string;
  label: string;
  type: "text" | "tel" | "select" | "number";
  placeholder?: string;
  required?: boolean;
  options?: string[];
};

export type Plan = {
  id: string;
  name: string;
  description?: string;
  price: number;
  validity?: string;
  active?: boolean;
  typeTag?: string;
  providerCost?: number;
  providerId?: string;
  statusHistory?: {
    timestamp: string;
    admin: string;
    status: "active" | "inactive";
  }[];
};

export type PlanCategory = {
  name: string;
  plans: Plan[];
};

export type ServiceSection = "digital_services" | "resellers" | "ecommerce";

export type ServiceCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  comingSoon?: boolean;
  comingSoonReason?: string;
  disabledReason?: string;
  filterGroup: "all" | "airtime" | "data" | "tv" | "bills" | "more";
  sections?: ServiceSection[];
  availableToResellers?: boolean;
  providerIds?: string[];
  displayOrder?: number;
  networkOptions?: string[];
  formConfig?: {
    fields: FormFieldConfig[];
    plans?: Plan[];
    planCategories?: PlanCategory[];
    networkPlanCategories?: Record<string, PlanCategory[]>;
    customAmount?: {
      label: string;
      min?: number;
      max?: number;
    };
    selectionType?: "plans" | "amounts";
  };
};

export const servicesCategories: ServiceCategory[] = [
  {
    id: "airtime",
    name: "Airtime",
    description: "Top up anytime",
    icon: "phone",
    available: true,
    filterGroup: "airtime",
    sections: ["digital_services", "resellers"],
    availableToResellers: true,
    displayOrder: 0,
    networkOptions: ["MTN", "Telecel", "AirtelTigo"],
    formConfig: {
      selectionType: "amounts",
      fields: [
        {
          name: "phoneNumber",
          label: "Phone Number",
          type: "tel",
          placeholder: "024 XXX XXXX",
          required: true,
        },
      ],
      plans: [
        { id: "5", name: "GHS 5", price: 5 },
        { id: "10", name: "GHS 10", price: 10 },
        { id: "20", name: "GHS 20", price: 20 },
        { id: "50", name: "GHS 50", price: 50 },
        { id: "100", name: "GHS 100", price: 100 },
      ],
      customAmount: {
        label: "Custom Amount",
        min: 1,
        max: 1000,
      },
    },
  },
  {
    id: "data",
    name: "Data",
    description: "Buy data bundles",
    icon: "globe",
    available: true,
    filterGroup: "data",
    sections: ["digital_services", "resellers"],
    availableToResellers: true,
    displayOrder: 1,
    networkOptions: ["MTN", "Telecel", "AirtelTigo"],
    formConfig: {
      selectionType: "plans",
      fields: [
        {
          name: "phoneNumber",
          label: "Phone Number",
          type: "tel",
          placeholder: "024 XXX XXXX",
          required: true,
        },
      ],
      networkPlanCategories: {
        MTN: [
          {
            name: "All",
            plans: [
              { id: "mtn-250mb-1d", name: "250MB", description: "Valid for 1 day", price: 2, validity: "1 day", active: true, typeTag: "All", providerCost: 1.5 },
              { id: "mtn-500mb-1d", name: "500MB", description: "Valid for 1 day", price: 3, validity: "1 day", active: true, typeTag: "All", providerCost: 2.5 },
              { id: "mtn-1gb-7d", name: "1GB", description: "Valid for 7 days", price: 6, validity: "7 days", active: true, typeTag: "All", providerCost: 5.2 },
              { id: "mtn-2gb-7d", name: "2GB", description: "Valid for 7 days", price: 11, validity: "7 days", active: true, typeTag: "All" },
              { id: "mtn-5gb-30d", name: "5GB", description: "Valid for 30 days", price: 25, validity: "30 days", active: true, typeTag: "All" },
              { id: "mtn-10gb-30d", name: "10GB", description: "Valid for 30 days", price: 45, validity: "30 days", active: true, typeTag: "All" },
              { id: "mtn-20gb-30d", name: "20GB", description: "Valid for 30 days", price: 80, validity: "30 days", active: true, typeTag: "All" },
            ],
          },
          {
            name: "Unlimited",
            plans: [
              { id: "mtn-unlimited-1d", name: "Unlimited 1 Day", description: "Unlimited data for 1 day", price: 10, validity: "1 day", active: true, typeTag: "Unlimited" },
              { id: "mtn-unlimited-7d", name: "Unlimited 7 Days", description: "Unlimited data for 7 days", price: 40, validity: "7 days", active: true, typeTag: "Unlimited" },
              { id: "mtn-unlimited-30d", name: "Unlimited 30 Days", description: "Unlimited data for 30 days", price: 100, validity: "30 days", active: true, typeTag: "Unlimited" },
            ],
          },
          {
            name: "Non-Expiry",
            plans: [
              { id: "mtn-non-1gb", name: "1GB", description: "No expiry", price: 15, validity: "No expiry", active: true, typeTag: "Non-Expiry" },
              { id: "mtn-non-3gb", name: "3GB", description: "No expiry", price: 40, validity: "No expiry", active: true, typeTag: "Non-Expiry" },
              { id: "mtn-non-5gb", name: "5GB", description: "No expiry", price: 60, validity: "No expiry", active: true, typeTag: "Non-Expiry" },
            ],
          },
          {
            name: "Just4U",
            plans: [
              { id: "mtn-just4u-1gb", name: "1GB", description: "Special offer", price: 5, validity: "7 days", active: true, typeTag: "Just4U" },
              { id: "mtn-just4u-2gb", name: "2GB", description: "Special offer", price: 9, validity: "7 days", active: true, typeTag: "Just4U" },
              { id: "mtn-just4u-5gb", name: "5GB", description: "Special offer", price: 20, validity: "7 days", active: true, typeTag: "Just4U" },
            ],
          },
        ],
        Telecel: [
          {
            name: "All",
            plans: [
              { id: "telecel-200mb-1d", name: "200MB", description: "Valid for 1 day", price: 2, validity: "1 day", active: true, typeTag: "All" },
              { id: "telecel-1gb-3d", name: "1GB", description: "Valid for 3 days", price: 5, validity: "3 days", active: true, typeTag: "All" },
              { id: "telecel-3gb-7d", name: "3GB", description: "Valid for 7 days", price: 15, validity: "7 days", active: true, typeTag: "All" },
              { id: "telecel-5gb-30d", name: "5GB", description: "Valid for 30 days", price: 30, validity: "30 days", active: true, typeTag: "All" },
            ],
          },
          {
            name: "Browse & Stream",
            plans: [
              { id: "voda-browse-1gb", name: "1GB Browse", description: "For social and browsing", price: 4, validity: "7 days", active: true, typeTag: "Browse & Stream" },
              { id: "voda-stream-2gb", name: "2GB Stream", description: "For video streaming", price: 8, validity: "7 days", active: true, typeTag: "Browse & Stream" },
            ],
          },
          {
            name: "Non-Expiry",
            plans: [
              { id: "voda-non-2gb", name: "2GB", description: "No expiry", price: 20, validity: "No expiry", active: true, typeTag: "Non-Expiry" },
              { id: "voda-non-5gb", name: "5GB", description: "No expiry", price: 45, validity: "No expiry", active: true, typeTag: "Non-Expiry" },
            ],
          },
          {
            name: "Special",
            plans: [
              { id: "voda-special-1gb", name: "1GB Special", description: "Limited offer", price: 3, validity: "7 days", active: true, typeTag: "Special" },
              { id: "voda-special-3gb", name: "3GB Special", description: "Limited offer", price: 8, validity: "7 days", active: true, typeTag: "Special" },
            ],
          },
        ],
        AirtelTigo: [
          {
            name: "All",
            plans: [
              { id: "at-250mb-1d", name: "250MB", description: "Valid for 1 day", price: 2, validity: "1 day", active: true, typeTag: "All" },
              { id: "at-1gb-7d", name: "1GB", description: "Valid for 7 days", price: 6, validity: "7 days", active: true, typeTag: "All" },
              { id: "at-2gb-7d", name: "2GB", description: "Valid for 7 days", price: 11, validity: "7 days", active: true, typeTag: "All" },
              { id: "at-5gb-30d", name: "5GB", description: "Valid for 30 days", price: 25, validity: "30 days", active: true, typeTag: "All" },
            ],
          },
          {
            name: "Unlimited",
            plans: [
              { id: "at-unlimited-1d", name: "Unlimited 1 Day", description: "Unlimited data for 1 day", price: 10, validity: "1 day", active: true, typeTag: "Unlimited" },
              { id: "at-unlimited-7d", name: "Unlimited 7 Days", description: "Unlimited data for 7 days", price: 40, validity: "7 days", active: true, typeTag: "Unlimited" },
            ],
          },
          {
            name: "Non-Expiry",
            plans: [
              { id: "at-non-1gb", name: "1GB", description: "No expiry", price: 15, validity: "No expiry", active: true, typeTag: "Non-Expiry" },
              { id: "at-non-5gb", name: "5GB", description: "No expiry", price: 60, validity: "No expiry", active: true, typeTag: "Non-Expiry" },
            ],
          },
        ],
      },
    },
  },
  {
    id: "cabletv",
    name: "Cable TV",
    description: "Pay TV subscription",
    icon: "tv",
    available: true,
    filterGroup: "tv",
    sections: ["digital_services", "resellers"],
    availableToResellers: true,
    displayOrder: 2,
    networkOptions: ["DSTV", "GOtv", "StarTimes"],
    formConfig: {
      selectionType: "plans",
      fields: [
        {
          name: "smartCardNumber",
          label: "Smart Card / Decoder Number",
          type: "text",
          placeholder: "Enter smart card number",
          required: true,
        },
      ],
      plans: [
        { id: "premium", name: "Premium", description: "30 days", price: 300, validity: "30 days", active: true },
        { id: "compact", name: "Compact", description: "30 days", price: 150, validity: "30 days", active: true },
        { id: "max", name: "Max", description: "30 days", price: 80, validity: "30 days", active: true },
      ],
    },
  },
  {
    id: "electricity",
    name: "Electricity",
    description: "Pay electricity bills",
    icon: "zap",
    available: true,
    filterGroup: "bills",
    sections: ["digital_services", "resellers"],
    availableToResellers: true,
    displayOrder: 3,
    formConfig: {
      selectionType: "amounts",
      fields: [
        {
          name: "meterNumber",
          label: "Meter Number",
          type: "text",
          placeholder: "Enter meter number",
          required: true,
        },
        {
          name: "meterType",
          label: "Meter Type",
          type: "select",
          required: true,
          options: ["Prepaid", "Postpaid"],
        },
      ],
      plans: [
        { id: "50", name: "GHS 50", price: 50, active: true },
        { id: "100", name: "GHS 100", price: 100, active: true },
        { id: "200", name: "GHS 200", price: 200, active: true },
      ],
      customAmount: {
        label: "Custom Amount",
        min: 1,
        max: 5000,
      },
    },
  },
  {
    id: "internet",
    name: "Internet",
    description: "Buy internet",
    icon: "wifi",
    available: false,
    comingSoon: true,
    comingSoonReason: "Awaiting Surfline partnership contract",
    filterGroup: "more",
    sections: ["digital_services"],
    availableToResellers: false,
    displayOrder: 4,
    networkOptions: ["MTN", "Telecel", "Surfline"],
    formConfig: {
      selectionType: "plans",
      fields: [
        {
          name: "accountNumber",
          label: "Account Number",
          type: "text",
          placeholder: "Enter account number",
          required: true,
        },
      ],
      plans: [
        { id: "5gb", name: "5GB", price: 25, active: true },
        { id: "10gb", name: "10GB", price: 45, active: true },
        { id: "unlimited", name: "Unlimited", price: 100, active: true },
      ],
    },
  },
  {
    id: "billpayments",
    name: "Bill Payments",
    description: "Pay other bills",
    icon: "receipt",
    available: false,
    comingSoon: true,
    comingSoonReason: "Provider integrations in progress",
    filterGroup: "bills",
    sections: ["digital_services"],
    availableToResellers: false,
    displayOrder: 5,
    formConfig: {
      selectionType: "amounts",
      fields: [
        {
          name: "biller",
          label: "Select Biller",
          type: "select",
          required: true,
          options: ["ECG", "Ghana Water", "DSTV"],
        },
        {
          name: "customerId",
          label: "Customer ID",
          type: "text",
          placeholder: "Enter customer ID",
          required: true,
        },
      ],
      plans: [
        { id: "50", name: "GHS 50", price: 50, active: true },
        { id: "100", name: "GHS 100", price: 100, active: true },
        { id: "200", name: "GHS 200", price: 200, active: true },
      ],
      customAmount: {
        label: "Custom Amount",
        min: 1,
        max: 5000,
      },
    },
  },
  {
    id: "exampins",
    name: "Exam Pins",
    description: "WAEC, JAMB, NECO etc.",
    icon: "graduation",
    available: true,
    filterGroup: "more",
    sections: ["digital_services", "resellers"],
    availableToResellers: true,
    displayOrder: 6,
    formConfig: {
      selectionType: "plans",
      fields: [
        {
          name: "examType",
          label: "Examination",
          type: "select",
          required: true,
          options: ["WAEC", "JAMB", "NECO"],
        },
        {
          name: "year",
          label: "Year",
          type: "select",
          required: true,
          options: ["2025", "2024", "2023"],
        },
        {
          name: "quantity",
          label: "Quantity",
          type: "number",
          placeholder: "1",
          required: true,
        },
      ],
      plans: [
        { id: "waec-2025", name: "WAEC 2025", description: "Result checker pin", price: 20, active: true },
        { id: "jamb-2025", name: "JAMB 2025", description: "Registration pin", price: 25, active: true },
        { id: "neco-2025", name: "NECO 2025", description: "Result checker pin", price: 20, active: true },
      ],
    },
  },
  {
    id: "giftcards",
    name: "Gift Cards",
    description: "Purchase digital gift cards",
    icon: "gift",
    available: false,
    comingSoon: true,
    comingSoonReason: "Product catalog and redemption flow under development",
    filterGroup: "more",
    sections: ["digital_services"],
    availableToResellers: false,
    displayOrder: 7,
  },
];

/**
 * @deprecated Prefer reading the price from the exam-pins category's plans
 * via `examPinUnitPriceFrom` in `lib/admin/services/helpers.ts`. Kept as an
 * export for backward compatibility with the customer-facing checkout.
 */
export const examPinUnitPrice = 20;