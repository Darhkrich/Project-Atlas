/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { AtlasNavbar } from "@/components/landing/AtlasNavbar";
import {
  AtlasContainer,
  AtlasSection,
  AtlasGrid,
} from "@/components/atlas";
import { AtlasFooter } from "@/components/atlas/atlas-footer";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";

const contactOptions: {
  title: string;
  description: string;
  icon: AtlasIconName;
}[] = [
  {
    title: "Customer Support",
    description: "For help with your account, payments, orders or services.",
    icon: "headphones",
  },
  {
    title: "Business & Partnerships",
    description: "For businesses interested in working with Atlas.",
    icon: "bank",
  },
  {
    title: "Reseller Support",
    description: "For Atlas resellers and storefront owners.",
    icon: "store",
  },
  {
    title: "E-commerce / Store Owner",
    description: "For help with your white-label online store.",
    icon: "bag",
  },
  {
    title: "Developer / API",
    description: "For technical and API-related enquiries.",
    icon: "code",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    reason: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!form.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!form.email.trim()) newErrors.email = "Email address is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = "Enter a valid email address.";
    if (!form.subject.trim()) newErrors.subject = "Subject is required.";
    if (!form.reason) newErrors.reason = "Please select a reason.";
    if (!form.message.trim()) newErrors.message = "Message is required.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setForm({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        reason: "",
        message: "",
      });
    }, 1000);
  };

  return (
    <>
      <AtlasNavbar />

      {/* Hero with world-map pattern */}
      <section className="relative overflow-hidden bg-white py-16 md:py-20 dark:bg-neutral-950">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <svg className="h-full w-full" viewBox="0 0 100 100" fill="none">
            <circle cx="10" cy="10" r="1" fill="currentColor" />
            <circle cx="50" cy="30" r="1" fill="currentColor" />
            <circle cx="90" cy="50" r="1" fill="currentColor" />
            <circle cx="20" cy="80" r="1" fill="currentColor" />
            <circle cx="70" cy="20" r="1" fill="currentColor" />
          </svg>
        </div>

        <AtlasContainer className="relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 md:text-5xl">
                Let’s talk.
              </h1>
              <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
                Have a question about Atlas, need help with a service, or want to work with us? We’re here to help.
              </p>

              {/* Contact options */}
              <AtlasGrid cols={2} gap={4} className="mt-10">
                {contactOptions.map((option) => (
                  <div
                    key={option.title}
                    className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                      <AtlasIcon name={option.icon} className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      {option.title}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {option.description}
                    </p>
                  </div>
                ))}
              </AtlasGrid>
            </div>

            {/* Form */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-800 dark:bg-neutral-900">
              {success ? (
                <div className="text-center">
                  <AtlasIcon name="check" className="mx-auto h-12 w-12 text-success-600 dark:text-success-400" />
                  <h2 className="mt-4 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                    Message received.
                  </h2>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    Thanks for contacting Atlas. Our team will review your message and get back to you.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <AtlasInput
                    label="Full Name"
                    type="text"
                    name="fullName"
                    placeholder="John Doe"
                    value={form.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                  />
                  <AtlasInput
                    label="Email Address"
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                  />
                  <AtlasInput
                    label="Phone Number (optional)"
                    type="tel"
                    name="phone"
                    placeholder="024 XXX XXXX"
                    value={form.phone}
                    onChange={handleChange}
                  />
                  <AtlasInput
                    label="Subject"
                    type="text"
                    name="subject"
                    placeholder="Brief summary"
                    value={form.subject}
                    onChange={handleChange}
                    error={errors.subject}
                  />
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Reason for Contact
                    </label>
                    <select
                      name="reason"
                      value={form.reason}
                      onChange={handleChange}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    >
                      <option value="" disabled>
                        Select a reason
                      </option>
                      {[
                        "General enquiry",
                        "Account support",
                        "Payment issue",
                        "Service/order issue",
                        "Reseller enquiry",
                        "E-commerce enquiry",
                        "Business enquiry",
                        "Developer/API enquiry",
                        "Other",
                      ].map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                    {errors.reason && (
                      <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                        {errors.reason}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Message
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="How can we help?"
                      value={form.message}
                      onChange={handleChange}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                        {errors.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" size="lg" loading={loading}>
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </AtlasContainer>
      </section>

      <AtlasFooter />
    </>
  );
}