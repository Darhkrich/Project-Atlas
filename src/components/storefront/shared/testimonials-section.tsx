import Image from "next/image";

const defaultReviews = [
  {
    id: 1,
    name: "Akosua M.",
    text: "Absolutely love this store! The products are authentic and delivery is fast.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces",
  },
  {
    id: 2,
    name: "Kwame O.",
    text: "Great quality and customer service. I'm a returning customer.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces",
  },
  {
    id: 3,
    name: "Adwoa B.",
    text: "The website is easy to use and payment was seamless. Highly recommended.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces",
  },
];

export function TestimonialsSection() {
  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-2xl font-bold text-neutral-950 sm:text-3xl">
          What our customers say
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {defaultReviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <Image
                  src={review.avatar}
                  alt={review.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-neutral-950">{review.name}</p>
                  <p className="text-xs text-neutral-500">Verified buyer</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-neutral-600">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}