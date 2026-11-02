import AssociateCard from "@/components/AssociateCard";
import associates from "@/data/associates.json";

export default function AssociatesGrid() {
  const list = associates.slice(0, 6);
  return (
    <section className="w-full py-12">
      <h2 className="text-2xl font-semibold mb-6 text-center tablet:text-left">College Associates</h2>
      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
        {list.map((a) => (
          <AssociateCard key={a.id} associate={a} />
        ))}
      </div>
    </section>
  );
}
