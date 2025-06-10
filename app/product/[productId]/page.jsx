import ProductDetailsClient from "../ProductDetailsClient";

export default async function ProductDetails({ params: { productId } }) {
  let product = null;
  let error = null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_URL}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const productsData = await res.json();

    const allProducts = Object.values(productsData).flat().filter(Boolean);

    product = allProducts.find((p) => p.id === productId);

    if (!product) {
      throw new Error("Product not found");
    }

    product.description = product.description || "No description available";
    product.rating = product.rating || 4.5;
    product.brand = product.brand || "Generic";
  } catch (err) {
    console.error("Error loading product:", err.message);
    error = err.message;
  }

  if (error) {
    return (
      <div className="p-8 text-red-600 font-bold">
        Error loading product: {error}
      </div>
    );
  }

  if (!product) {
    return <div className="p-8 text-gray-600">No product found.</div>;
  }

  return <ProductDetailsClient product={product} />;
}
