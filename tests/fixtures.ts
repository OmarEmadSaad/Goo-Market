import type { CartLine, Product } from "@/lib/types";

/** Mirrors the real catalog shape: no brand, no description, no rating. */
export function makeProduct(overrides: Partial<Product> = {}): Product {
  const base: Product = {
    id: "el01",
    name: "Fan",
    slug: "fan-el01",
    category: "electronics",
    categorySlug: "electronics",
    price: 700,
    stock: 7,
    image: "https://img.freepik.com/premium-psd/fan.jpg",
    inStock: true,
  };
  return { ...base, ...overrides };
}

export function makeCartLine(overrides: Partial<CartLine> = {}): CartLine {
  const base: CartLine = {
    id: "el01",
    name: "Fan",
    slug: "fan-el01",
    href: "/product/fan-el01",
    image: "https://img.freepik.com/premium-psd/fan.jpg",
    listPrice: 700,
    stock: 7,
    quantity: 1,
  };
  return { ...base, ...overrides };
}

/** The exact shape the Firebase node returns today: a top-level array. */
export const RAW_ARRAY_CATALOG = [
  {
    category: "electronics",
    id: "el01",
    image: "https://img.freepik.com/premium-psd/fan.jpg",
    name: "Fan",
    price: 700,
    stock: 7,
  },
  {
    category: "electronics",
    id: "el02",
    image: "https://img.freepik.com/premium-photo/washing-machine.jpg",
    name: "Washing Machine",
    price: 3000,
    stock: 5,
  },
  {
    category: "home",
    id: "ho01",
    image: "https://img.freepik.com/free-psd/sofa.jpg",
    name: "Sofa",
    price: 5000,
    stock: 0,
  },
];

/** The other shape the same node has been written in: keyed by category. */
export const RAW_OBJECT_CATALOG = {
  electronics: {
    "-Nabc123": {
      category: "electronics",
      id: "el03",
      image: "https://img.freepik.com/free-psd/fridge.jpg",
      name: "Refrigerator",
      price: 4500,
      stock: 3,
    },
  },
  food: {
    "-Nabc456": {
      category: "food",
      id: "fo01",
      image: "https://img.freepik.com/free-psd/rice.jpg",
      name: "Rice",
      price: 60,
      stock: 100,
    },
  },
};
