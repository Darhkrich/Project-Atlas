import Link from "next/link";
import { AtlasContainer } from "@/components/atlas/atlas-container";

const posts = [
  {
    category: "Product Update",
    title: "Introducing Atlas Wallet 2.0",
    date: "May 10, 2024",
    image: "laptop",
  },
  {
    category: "Business Tips",
    title: "How to Grow Your Reseller Business",
    date: "May 8, 2024",
    image: "discussion",
  },
  {
    category: "Industry News",
    title: "The Future of Digital Services in Africa",
    date: "May 5, 2024",
    image: "tablet",
  },
];

export function BlogSection() {
  return (
    <section className="py-16 md:py-20 bg-white dark:bg-neutral-950">
      <AtlasContainer>
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Left intro */}
          <div className="lg:col-span-1">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Latest from
              <br />
              Our Blog
            </h2>
            <Link
              href="/blog"
              className="mt-4 inline-flex items-center text-blue-700 dark:text-blue-400 font-medium hover:underline"
            >
              Visit Our Blog
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </Link>
          </div>

          {/* Blog cards */}
          <div className="lg:col-span-3 grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.title}
                className="rounded-2xl overflow-hidden border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow dark:border-neutral-800 dark:bg-neutral-900"
              >
                {/* Image placeholder */}
                <div className="h-40 bg-neutral-200 dark:bg-neutral-800 relative">
                  <BlogImage type={post.image} />
                </div>
                <div className="p-5">
                  <span className="inline-block rounded-full bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1">
                    {post.category}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                    {post.date}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </AtlasContainer>
    </section>
  );
}

function BlogImage({ type }: { type: string }) {
  switch (type) {
    case "laptop":
      return (
        <svg className="h-full w-full object-cover" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="200" fill="#1a202c" />
          <rect x="30" y="40" width="340" height="120" rx="8" fill="#2d3748" />
          <rect x="80" y="70" width="240" height="60" rx="4" fill="#4a5568" />
          <circle cx="200" cy="100" r="10" fill="#718096" />
        </svg>
      );
    case "discussion":
      return (
        <svg className="h-full w-full object-cover" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="200" fill="#1a202c" />
          <circle cx="150" cy="80" r="30" fill="#2d3748" />
          <circle cx="250" cy="80" r="30" fill="#2d3748" />
          <path d="M120 140 L150 110 L180 140" stroke="#4a5568" strokeWidth="6" fill="none" />
          <path d="M220 140 L250 110 L280 140" stroke="#4a5568" strokeWidth="6" fill="none" />
        </svg>
      );
    case "tablet":
      return (
        <svg className="h-full w-full object-cover" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="200" fill="#1a202c" />
          <rect x="150" y="40" width="100" height="120" rx="10" fill="#2d3748" />
          <circle cx="200" cy="100" r="15" fill="#4a5568" />
        </svg>
      );
    default:
      return null;
  }
}