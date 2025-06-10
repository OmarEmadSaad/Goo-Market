"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { Typography } from "@material-tailwind/react";
import HomeCard from "../home/HomeCard";
import { FaSearch } from "react-icons/fa";

const Search = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("query")?.toLowerCase() || "";
  const { products, categories } = useSelector((state) => state.products);

  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      const allProducts = categories.flatMap(
        (category) => products[category] || []
      );

      const results = allProducts.filter((product) =>
        product.name.toLowerCase().includes(query)
      );

      setFiltered(results);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [products, categories, query]);

  return (
    <div className="p-6 min-h-screen">
      <Typography variant="h4" className="mb-4">
        Search Results for: <span className="text-green-600">{query}</span>
      </Typography>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="relative w-24 h-24 rounded-full border-4 border-green-400">
            <div className="absolute top-1/2 left-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2 animate-move-circle">
              <FaSearch className="text-green-600 text-5xl" />
            </div>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <Typography className="text-red-500 text-center text-[2em]">
          Not Found 🙄
        </Typography>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <HomeCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
