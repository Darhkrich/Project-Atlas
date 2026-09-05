import Image from "next/image";

const reviews = [
  {
    id: 1,
    name: "Kojo A.",
    text: "Great quality and fast shipping. My new favorite store.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces",
  },
  {
    id: 2,
    name: "Abena P.",
    text: "The styles are fresh and prices are fair. Highly recommend.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces",
  },
  {
    id: 3,
    name: "Yaw D.",
    text: "Excellent customer service. They helped me find the perfect outfit.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces",
  },
];

export function FashionModernTestimonials() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-2xl font-bold uppercase tracking-wider text-neutral-950">
          Customer Reviews
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.id} className="border border-neutral-200 bg-white p-6">
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