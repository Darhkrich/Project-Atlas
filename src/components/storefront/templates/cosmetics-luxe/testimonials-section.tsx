import Image from "next/image";

const reviews = [
  {
    id: 1,
    name: "Efua A.",
    text: "The products are exceptional. My skin has never felt better.",
    avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=80&h=80&fit=crop&crop=faces",
  },
  {
    id: 2,
    name: "Nana K.",
    text: "Beautiful packaging and fast delivery. Highly recommend.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=faces",
  },
  {
    id: 3,
    name: "Ama S.",
    text: "I love the natural ingredients. This brand is a game changer.",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=faces",
  },
];

export function CosmeticsLuxeTestimonials() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-2xl font-bold text-neutral-950 sm:text-3xl">
          What our customers say
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
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