/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { AtlasContainer } from "@/components/atlas/atlas-container";
import { AtlasIcon } from "@/components/atlas/icons";

const posts = [
  {
    category: "Product Update",
    title: "Introducing Atlas Wallet 2.0",
    date: "May 10, 2024",
    image: "/images/blog/laptop.jpg",
  },
  {
    category: "Business Tips",
    title: "How to Grow Your Reseller Business",
    date: "May 8, 2024",
    image: "/images/blog/discussion.jpg",
  },
  {
    category: "Industry News",
    title: "The Future of Digital Services in Africa",
    date: "May 5, 2024",
    image: "/images/blog/tablet.jpg",
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
              <AtlasIcon name="arrow-right" className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {/* Blog cards */}
          <div className="lg:col-span-3 grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.title}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                {/* Actual blog image */}
                <div className="h-40 w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
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