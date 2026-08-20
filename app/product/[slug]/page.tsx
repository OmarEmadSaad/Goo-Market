import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import ProductImage from "@/components/product/ProductImage";
import ProductPrice from "@/components/product/ProductPrice";
import ProductBadge from "@/components/product/ProductBadge";
import ProductGrid from "@/components/product/ProductGrid";
import ProductPurchasePanel from "./ProductPurchasePanel";

import { getProductBySlug, getProducts, getRelated } from "@/lib/server/products";
import { categoryPath, productPath, titleCase } from "@/lib/catalog";
import {
  breadcrumbSchema,
  productDescription,
  productSchema,
} from "@/lib/seo/jsonld";
import { CURRENCY, formatPrice, getUnitPrice, getUnitSaving } from "@/lib/pricing";
import { SITE_NAME } from "@/lib/site";
import type { Breadcrumb, Product } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found", robots: { index: false, follow: true } };
  }

  const canonical = productPath(product);
  const description = productDescription(product);

  return {
    title: `${product.name} - ${titleCase(product.category)}`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: `${product.name} | ${SITE_NAME}`,
      description,
      images: product.image ? [{ url: product.image, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.image ? [product.image] : undefined,
    },
    other: {
      "product:price:amount": getUnitPrice(product.price).toFixed(2),
      "product:price:currency": CURRENCY,
      "product:availability": product.inStock ? "in stock" : "out of stock",
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  if (slug !== product.slug) permanentRedirect(productPath(product));

  const related = await getRelated(product.id, 4);

  const trail: Breadcrumb[] = [
    { name: "Home", url: "/" },
    { name: "Categories", url: "/category" },
    { name: titleCase(product.category), url: categoryPath(product.categorySlug) },
    { name: product.name, url: productPath(product) },
  ];

  return (
    <Container className="py-8">
      <JsonLd schema={[productSchema(product), breadcrumbSchema(trail)]} />
      <Breadcrumbs trail={trail} />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery product={product} />

        <div>
          <Link
            href={categoryPath(product.categorySlug)}
            className="text-sm uppercase tracking-wide text-green-700 hover:underline dark:text-green-300"
          >
            {titleCase(product.category)}
          </Link>

          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{product.name}</h1>

          <div className="mt-4">
            <ProductPrice listPrice={product.price} size="lg" />
            <p className="mt-1 text-sm text-gray-600 dark:text-[#93B1A6]">
              You save {formatPrice(getUnitSaving(product.price))} per item.
            </p>
          </div>

          <div className="mt-4">
            <ProductBadge product={product} />
          </div>

          <p className="mt-6 leading-relaxed text-gray-700 dark:text-[#ECFAE5]">
            {productDescription(product)}
          </p>

          <ProductPurchasePanel product={product} />

          <Specifications product={product} />
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-16" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-4 text-xl font-semibold">
            Related products
          </h2>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </Container>
  );
}

function ProductGallery({ product }: { product: Product }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--gm-border)] bg-[var(--gm-surface)] lg:self-start">
      <ProductImage
        product={product}
        ratio="square"
        priority
        sizes="(max-width: 1024px) 100vw, 45vw"
        imageClassName="object-contain p-6"
      />
    </div>
  );
}

function Specifications({ product }: { product: Product }) {
  const rows: Array<[string, string]> = [
    ["Category", titleCase(product.category)],
    ["SKU", product.sku || product.id],
    ["Price", formatPrice(getUnitPrice(product.price))],
    ["List price", formatPrice(product.price)],
    [
      "Availability",
      product.inStock ? `In stock (${product.stock} available)` : "Out of stock",
    ],
  ];

  if (product.brand) rows.splice(1, 0, ["Brand", product.brand]);

  return (
    <section className="mt-8" aria-labelledby="specs-heading">
      <h2 id="specs-heading" className="mb-3 text-lg font-semibold">
        Product details
      </h2>
      <dl className="divide-y divide-[var(--gm-border)] rounded-lg border border-[var(--gm-border)]">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
            <dt className="text-gray-500 dark:text-[#93B1A6]">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
