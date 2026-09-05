/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

interface StorefrontContactPageProps {
  store: MerchantStorefrontConfig;
}

export function StorefrontContactPage({ store }: StorefrontContactPageProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate send
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-950 sm:text-4xl">
          Contact Us
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-neutral-600">
          Have a question or need assistance? We're here to help.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        {/* Contact info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-neutral-950">
              Store Information
            </h2>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <AtlasIcon name="home" className="h-5 w-5 text-neutral-400" />
                <span>{store.address || "Address not provided"}</span>
              </div>
              <div className="flex items-center gap-3">
                <AtlasIcon name="phone" className="h-5 w-5 text-neutral-400" />
                <span>{store.contactPhone || "Phone not provided"}</span>
              </div>
              <div className="flex items-center gap-3">
                <AtlasIcon name="message-circle" className="h-5 w-5 text-neutral-400" />
                <span>{store.contactEmail || "Email not provided"}</span>
              </div>
              {store.whatsapp && (
                <div className="flex items-center gap-3">
                  <AtlasIcon name="phone" className="h-5 w-5 text-neutral-400" />
                  <span>WhatsApp: {store.whatsapp}</span>
                </div>
              )}
            </div>
          </div>

          {/* Social links */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-neutral-950">Follow Us</h2>
            <div className="mt-4 flex gap-4">
              {store.socialLinks.facebook && (
                <a
                  href={store.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-neutral-900"
                >
                  <AtlasIcon name="facebook" className="h-6 w-6" />
                </a>
              )}
              {store.socialLinks.instagram && (
                <a
                  href={store.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-neutral-900"
                >
                  <AtlasIcon name="instagram" className="h-6 w-6" />
                </a>
              )}
              {store.socialLinks.tiktok && (
                <a
                  href={store.socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-neutral-900"
                >
                  <AtlasIcon name="tiktok" className="h-6 w-6" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-neutral-950">Send Us a Message</h2>

          {submitted ? (
            <div className="mt-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-100 text-success-600">
                <AtlasIcon name="check" className="h-6 w-6" />
              </div>
              <p className="mt-4 text-neutral-900 font-medium">Message sent!</p>
              <p className="text-sm text-neutral-500">We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm resize-none"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}