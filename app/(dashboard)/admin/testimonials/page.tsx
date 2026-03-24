import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import TestimonialsAdmin from "@/components/dashboard/TestimonialsAdmin";

export const metadata = { title: "Testimonials — Admin" };

export default async function AdminTestimonialsPage() {
  await requireRole("ADMIN");

  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Testimonials</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">
          Manage client testimonials. Select which ones appear on the homepage via Homepage Sections → Testimonials.
        </p>
      </div>
      <TestimonialsAdmin initialTestimonials={testimonials} />
    </div>
  );
}
