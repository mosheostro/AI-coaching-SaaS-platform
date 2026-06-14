import { requireProfile } from "@/lib/auth";
import { ChartCard } from "@/components/charts";

const TYPES = [
  { name: "Landing page", desc: "Hero, sections, and CTAs on the homepage.", status: "Editable via Settings" },
  { name: "Testimonials", desc: "Client quotes shown across the site.", status: "Phase 2" },
  { name: "FAQ", desc: "Frequently asked questions.", status: "Phase 2" },
  { name: "Resources", desc: "Downloadable guides and tools.", status: "Phase 2" },
  { name: "Blog articles", desc: "Long-form posts and updates.", status: "Phase 2" },
  { name: "Legal pages", desc: "Privacy, terms, disclaimer, cookies.", status: "Live (in /app)" },
];

export default async function ContentPage() {
  await requireProfile("admin");
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Content management</h1>
        <p className="text-soft text-sm">Manage site content without code changes.</p>
      </header>
      <ChartCard title="Content types">
        <div className="grid gap-3 sm:grid-cols-2">
          {TYPES.map((t) => (
            <div key={t.name} className="rounded-card border border-line p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{t.name}</p>
                <span className="badge bg-sage/15 text-sage-deep">{t.status}</span>
              </div>
              <p className="mt-1 text-sm text-soft">{t.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-soft">A full block-based CMS (testimonials, FAQ, resources, blog) is scoped for the next pass; branding/SEO copy is editable now under Settings.</p>
      </ChartCard>
    </div>
  );
}
