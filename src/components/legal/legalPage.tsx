import { AtlasContainer, AtlasSection } from "@/components/atlas";
import { AtlasFooter } from "@/components/atlas/atlas-footer";
import { AtlasNavbar } from "@/components/landing/AtlasNavbar";

interface LegalSection {
  title: string;
  content: string;
}

interface LegalPageProps {
  title: string;
  description: string;
  updatedDate: string;
  sections: LegalSection[];
}

export default function LegalPage({
  title,
  description,
  updatedDate,
  sections,
}: LegalPageProps) {
  return (
    <>
      <AtlasNavbar />

      {/* Page Header */}
      <AtlasSection size="md" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {title}
            </h1>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Last updated: {updatedDate}
            </p>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* Content with TOC */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[240px_1fr]">
            {/* Table of Contents */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  On this page
                </p>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <a
                      key={section.title}
                      href={`#${section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      className="block text-sm text-neutral-600 transition-colors hover:text-brand-800 dark:text-neutral-400 dark:hover:text-brand-300"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <div className="max-w-3xl">
              {/* Mobile TOC */}
              <details className="mb-8 rounded-lg border border-neutral-200 bg-white p-4 lg:hidden dark:border-neutral-800 dark:bg-neutral-950">
                <summary className="cursor-pointer text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Table of Contents
                </summary>
                <nav className="mt-4 space-y-2">
                  {sections.map((section) => (
                    <a
                      key={section.title}
                      href={`#${section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      className="block text-sm text-neutral-600 hover:text-brand-800 dark:text-neutral-400 dark:hover:text-brand-300"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </details>

              {/* Sections */}
              <div className="space-y-10">
                {sections.map((section, index) => (
                  <div
                    key={section.title}
                    id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                  >
                    <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                      {index + 1}. {section.title}
                    </h2>
                    <p className="mt-3 leading-relaxed text-neutral-700 dark:text-neutral-300">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      <AtlasFooter />
    </>
  );
}