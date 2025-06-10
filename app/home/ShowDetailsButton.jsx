"use client";

import { useRouter } from "next/navigation";

const ShowDetailsButton = ({ productId }) => {
  const router = useRouter();

  const handleShowDetails = () => {
    router.push(`/product/${productId}`);
  };

  return (
    <button
      className="w-full bg-green-500 text-white py-2 rounded"
      onClick={handleShowDetails}
    >
      Show Details
    </button>
  );
};

export default ShowDetailsButton;
