import LegalPage from "@/components/legal/legalPage";

export const metadata = {
  title: "Privacy Policy — Atlas",
  description: "How Atlas collects, uses and protects your information.",
};

const sections = [
  {
    title: "Introduction",
    content:
      "Atlas is committed to protecting your privacy and handling your personal information responsibly. This Privacy Policy explains what information we collect, how we use it, and the choices you have regarding your data. This policy applies to all Atlas services, including the Atlas customer platform, reseller storefronts, and white-label e-commerce websites.",
  },
  {
    title: "Information We Collect",
    content:
      "We collect information that you provide directly, such as your name, email address, phone number, and payment details when you create an account or complete a transaction. For e-commerce store owners, we also collect information about the products you list, store settings, and customer interactions. We may also collect technical information such as device type, browser, and usage data to improve the platform.",
  },
  {
    title: "How We Use Your Information",
    content:
      "We use your information to provide and improve Atlas services, process transactions, send important updates, personalise your experience, and ensure platform security. For e-commerce services, we use your information to host your store, manage orders, process payments, and provide store analytics. We do not sell your personal information to third parties.",
  },
  {
    title: "Sharing Your Information",
    content:
      "We may share information with trusted service providers who assist with payment processing, service fulfillment, and platform operations. For e-commerce websites, this may include hosting providers, payment processors, and analytics services. These providers are only authorised to use your information as necessary to perform services on our behalf.",
  },
  {
    title: "E-commerce Services",
    content:
      "When you create a white-label e-commerce store on Atlas, you are responsible for the content and products you upload. Atlas processes customer data related to orders placed through your store in accordance with this policy and applicable law. You must ensure that your use of the e-commerce service complies with privacy and data protection requirements.",
  },
  {
    title: "Data Security",
    content:
      "We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, loss, or misuse. However, no system can guarantee absolute security.",
  },
  {
    title: "Your Rights",
    content:
      "You may request access, correction, or deletion of your personal information by contacting our support team. We will respond to reasonable requests in accordance with applicable laws.",
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. If we make significant changes, we will notify you through the Atlas platform or other appropriate channels.",
  },
  {
    title: "Contact Us",
    content:
      "If you have questions about this Privacy Policy or how your data is handled, please contact us at support@atlas.com or through the Atlas support page.",
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How Atlas collects, uses and protects your information."
      updatedDate="June 1, 2025"
      sections={sections}
    />
  );
}