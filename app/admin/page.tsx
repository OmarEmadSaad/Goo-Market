import Link from "next/link";

import { getProducts } from "@/lib/server/products";
import { listUserEntries, getDisplayName, getRole } from "@/lib/server/users";
import { formatPrice } from "@/lib/pricing";

export default async function AdminOverviewPage() {
  const [products, users] = await Promise.all([getProducts(), listUserEntries()]);

  const inStock = products.filter((product) => product.inStock).length;
  const catalogValue = products.reduce(
    (sum, product) => sum + product.price * product.stock,
    0
  );
  const admins = users.filter((entry) => getRole(entry.record) === "admin").length;
  const lastProduct = products[products.length - 1];
  const lastUser = users[users.length - 1];

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-2">
        <SummaryCard
          title="Products"
          href="/admin/products"
          cta="Manage products"
          rows={[
            ["Total products", String(products.length)],
            ["In stock", `${inStock} of ${products.length}`],
            ["Catalog value", formatPrice(catalogValue)],
            ["Last added", lastProduct?.name ?? "None"],
          ]}
        />

        <SummaryCard
          title="Users"
          href="/admin/users"
          cta="Manage users"
          rows={[
            ["Total users", String(users.length)],
            ["Administrators", String(admins)],
            [
              "Last registered",
              lastUser ? getDisplayName(lastUser.record) || "Unnamed" : "None",
            ],
          ]}
        />
      </div>
    </>
  );
}

function SummaryCard({
  title,
  href,
  cta,
  rows,
}: {
  title: string;
  href: string;
  cta: string;
  rows: Array<[string, string]>;
}) {
  return (
    <section
      aria-labelledby={`card-${title}`}
      className="flex flex-col rounded-xl bg-green-600 p-6 text-white dark:bg-[#0B2447]"
    >
      <h2 id={`card-${title}`} className="border-b border-white/20 pb-4 text-2xl font-semibold">
        {title}
      </h2>

      <dl className="flex-1 space-y-3 py-6 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-white/80">{label}</dt>
            <dd className="text-right font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <Link
        href={href}
        className="rounded-md bg-white px-4 py-2 text-center text-sm font-medium text-green-700 hover:bg-green-50"
      >
        {cta}
      </Link>
    </section>
  );
}
