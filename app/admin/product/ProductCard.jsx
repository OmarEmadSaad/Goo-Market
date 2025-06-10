"use client";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Loading from "@/app/loding/page";

const ProductCard = () => {
  const [lastProduct, setLastProduct] = useState("");
  const [numOfProducts, setNumOfProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const urlProducts = process.env.NEXT_PUBLIC_PRODUCT_URL;

    if (!urlProducts) {
      setError("Product URL is not defined");
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${urlProducts}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const productsData = await res.json();

        const allProducts = Object.values(productsData).flat().filter(Boolean);

        const lastProductTitle =
          allProducts[allProducts.length - 1]?.name || "No product";
        const numOfProducts = allProducts.length || 0;
        setLastProduct(lastProductTitle);
        setNumOfProducts(numOfProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Typography color="red">Error ProductCard: {error}</Typography>;
  }

  return (
    <div>
      <Card
        variant="gradient"
        className="w-full max-w-[20rem] p-8 bg-green-600 text-white dark:bg-[#0B2447] dark:text-white"
      >
        <CardHeader
          floated={false}
          shadow={false}
          color="transparent"
          className="m-0 mb-8 rounded-none border-b border-white/10 pb-8 text-center"
        >
          <Typography
            variant="h1"
            color="white"
            className="mt-6 flex justify-center gap-1 text-7xl font-normal"
          >
            <span className="mt-2 text-4xl">Products</span>
          </Typography>
        </CardHeader>
        <CardBody className="p-0">
          <div className="flex flex-col gap-5">
            <h1>
              Number of Products:{" "}
              <span className="text-blue-900 dark:text-white">
                {numOfProducts}
              </span>
            </h1>
            <h1>
              Last Added Product:{" "}
              <span className="text-blue-900 dark:text-white">
                {lastProduct ? lastProduct : "None"}
              </span>
            </h1>
          </div>
        </CardBody>
        <CardFooter className="mt-12 p-0">
          <Button
            size="lg"
            color="white"
            className="hover:scale-[1.02] focus:scale-[1.02] active:scale-100"
            ripple={false}
            fullWidth={true}
            onClick={() => router.push("/admin/products")}
          >
            Check Products
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
export default ProductCard;
