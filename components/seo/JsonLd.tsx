import type { JsonLd as JsonLdObject } from "@/lib/seo/jsonld";

export default function JsonLd({ schema }: { schema: JsonLdObject | JsonLdObject[] }) {
  const json = JSON.stringify(schema).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
