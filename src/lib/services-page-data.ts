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
};

export type PlanCategory = {
  name: string;
  plans: Plan[];
};

export type ServiceCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  comingSoon?: boolean;
  filterGroup: "all" | "airtime" | "data" | "tv" | "bills" | "more";
  networkOptions?: string[];
  formConfig?: {
    fields: FormFieldConfig[];
    plans?: Plan[];
    planCategories?: PlanCategory[];
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
    icon: "📱",
    available: true,
    filterGroup: "airtime",
    networkOptions: ["MTN", "Vodafone", "AirtelTigo"],
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
      // Amount suggestions
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
    icon: "🌐",
    available: true,
    filterGroup: "data",
    networkOptions: ["MTN", "Vodafone", "AirtelTigo"],
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
      planCategories: [
        {
          name: "All",
          plans: [
            { id: "mtn-250mb-1d", name: "250MB", description: "Valid for 1 day", price: 2 },
            { id: "mtn-500mb-1d", name: "500MB", description: "Valid for 1 day", price: 3 },
            { id: "mtn-1gb-7d", name: "1GB", description: "Valid for 7 days", price: 6 },
            { id: "mtn-2gb-7d", name: "2GB", description: "Valid for 7 days", price: 11 },
            { id: "mtn-5gb-30d", name: "5GB", description: "Valid for 30 days", price: 25 },
            { id: "mtn-10gb-30d", name: "10GB", description: "Valid for 30 days", price: 45 },
            { id: "mtn-20gb-30d", name: "20GB", description: "Valid for 30 days", price: 80 },
          ],
        },
        {
          name: "Unlimited",
          plans: [
            { id: "mtn-unlimited-1d", name: "Unlimited 1 Day", description: "Unlimited data for 1 day", price: 10 },
            { id: "mtn-unlimited-7d", name: "Unlimited 7 Days", description: "Unlimited data for 7 days", price: 40 },
            { id: "mtn-unlimited-30d", name: "Unlimited 30 Days", description: "Unlimited data for 30 days", price: 100 },
          ],
        },
        {
          name: "Non-Expiry",
          plans: [
            { id: "mtn-non-1gb", name: "1GB", description: "No expiry", price: 15 },
            { id: "mtn-non-3gb", name: "3GB", description: "No expiry", price: 40 },
            { id: "mtn-non-5gb", name: "5GB", description: "No expiry", price: 60 },
          ],
        },
        {
          name: "Just4U",
          plans: [
            { id: "mtn-just4u-1gb", name: "1GB", description: "Special offer", price: 5 },
            { id: "mtn-just4u-2gb", name: "2GB", description: "Special offer", price: 9 },
            { id: "mtn-just4u-5gb", name: "5GB", description: "Special offer", price: 20 },
          ],
        },
      ],
    },
  },
  {
    id: "cabletv",
    name: "Cable TV",
    description: "Pay TV subscription",
    icon: "📺",
    available: true,
    filterGroup: "tv",
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
        { id: "premium", name: "Premium", description: "30 days", price: 300 },
        { id: "compact", name: "Compact", description: "30 days", price: 150 },
        { id: "max", name: "Max", description: "30 days", price: 80 },
      ],
    },
  },
  {
    id: "electricity",
    name: "Electricity",
    description: "Pay electricity bills",
    icon: "⚡",
    available: true,
    filterGroup: "bills",
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
        { id: "50", name: "GHS 50", price: 50 },
        { id: "100", name: "GHS 100", price: 100 },
        { id: "200", name: "GHS 200", price: 200 },
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
    icon: "📶",
    available: false,
    comingSoon: true,
    filterGroup: "more",
    networkOptions: ["MTN", "Vodafone", "Surfline"],
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
        { id: "5gb", name: "5GB", price: 25 },
        { id: "10gb", name: "10GB", price: 45 },
        { id: "unlimited", name: "Unlimited", price: 100 },
      ],
    },
  },
  {
    id: "billpayments",
    name: "Bill Payments",
    description: "Pay other bills",
    icon: "🧾",
    available: false,
    comingSoon: true,
    filterGroup: "bills",
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
        { id: "50", name: "GHS 50", price: 50 },
        { id: "100", name: "GHS 100", price: 100 },
        { id: "200", name: "GHS 200", price: 200 },
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
    icon: "🎓",
    available: true,
    filterGroup: "more",
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
    },
  },
  {
    id: "giftcards",
    name: "Gift Cards",
    description: "Purchase digital gift cards",
    icon: "🎁",
    available: false,
    comingSoon: true,
    filterGroup: "more",
  },
];

export const examPinUnitPrice = 20;