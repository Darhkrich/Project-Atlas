import LegalPage from "@/components/legal/legalPage";

export const metadata = {
  title: "Terms of Service — Atlas",
  description: "These terms explain the rules and conditions for using Atlas.",
};

const sections = [
  {
    title: "Acceptance of Terms",
    content:
      "By accessing or using the Atlas platform, you agree to be bound by these Terms of Service and any additional terms that may apply.",
  },
  {
    title: "About Atlas",
    content:
      "Atlas is a digital services platform that enables customers to purchase digital services, resellers to operate their own businesses, store owners to launch white-label e-commerce websites, and developers to integrate Atlas services.",
  },
  {
    title: "Eligibility",
    content:
      "You must be at least 18 years old and capable of forming a legally binding contract to use Atlas.",
  },
  {
    title: "Atlas Account",
    content:
      "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
  },
  {
    title: "Using Atlas Services",
    content:
      "You agree to use Atlas services only for lawful purposes and in accordance with these terms.",
  },
  {
    title: "Orders and Transactions",
    content:
      "All orders placed through Atlas are subject to availability and confirmation. Transaction details will be shown before payment.",
  },
  {
    title: "Payments",
    content:
      "Payments are processed through trusted payment providers. Atlas does not store full card details unless explicitly stated.",
  },
  {
    title: "Wallets and Account Balances",
    content:
      "Wallet balances are maintained for your convenience and may be used to pay for Atlas services. Balances are not bank accounts and do not earn interest.",
  },
  {
    title: "Service Delivery",
    content:
      "Atlas coordinates service fulfillment with providers. Delivery times may vary based on service type and provider.",
  },
  {
    title: "Transaction Errors, Failed Transactions and Refunds",
    content:
      "If a transaction fails or remains pending, Atlas will provide transaction status. Refunds, where applicable, will be processed according to the specific service policy.",
  },
  {
    title: "Reseller Accounts and Storefronts",
    content:
      "Resellers may operate storefronts under their own branding while using Atlas infrastructure. Reseller conduct must comply with these terms.",
  },
  {
    title: "E-commerce Websites and Storefronts",
    content:
      "Atlas provides a white-label e-commerce platform that allows you to create and manage an online store without writing code. You are responsible for the content, products, and services you offer through your store. Atlas hosts the website, processes payments, and provides maintenance, but you must comply with all applicable laws, including consumer protection and data privacy regulations. Atlas is not responsible for the quality, delivery, or legality of the products or services sold through your store unless Atlas is the direct seller.",
  },
  {
    title: "Prohibited Activities",
    content:
      "You may not misuse the platform, attempt to disrupt services, infringe others' rights, or engage in fraudulent activity.",
  },
  {
    title: "Account Suspension or Termination",
    content:
      "Atlas may suspend or terminate accounts that violate these terms or pose a risk to the platform or other users.",
  },
  {
    title: "Intellectual Property",
    content:
      "All content, trademarks, and technology associated with Atlas are the property of Atlas or its licensors.",
  },
  {
    title: "Third-Party Services",
    content:
      "Atlas may integrate with third-party services. Atlas is not responsible for the content or practices of those services.",
  },
  {
    title: "Disclaimers",
    content:
      "Atlas services are provided on an \"as is\" and \"as available\" basis without warranties of any kind, express or implied.",
  },
  {
    title: "Limitation of Liability",
    content:
      "To the maximum extent permitted by law, Atlas shall not be liable for indirect, incidental, or consequential damages arising from use of the platform.",
  },
  {
    title: "Changes to the Service",
    content:
      "Atlas may modify or discontinue any part of the service at any time with or without notice.",
  },
  {
    title: "Changes to These Terms",
    content:
      "We may update these terms from time to time. Continued use after changes constitutes acceptance.",
  },
  {
    title: "Governing Law",
    content:
      "These terms are governed by the laws of the jurisdiction in which Atlas operates. Any disputes shall be resolved in the appropriate courts.",
  },
  {
    title: "Contact Information",
    content:
      "For questions about these Terms of Service, contact us at support@atlas.com or through the Atlas support page.",
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="These terms explain the rules and conditions for using Atlas."
      updatedDate="June 1, 2025"
      sections={sections}
    />
  );
}