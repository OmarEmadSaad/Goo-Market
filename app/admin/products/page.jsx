"use client";
import { Card, Typography, Avatar, Button } from "@material-tailwind/react";
import Swal from "sweetalert2";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchProducts } from "@/app/ReduxSystem/productSlice";
import Loading from "@/app/loding/page";
import { useRouter } from "next/navigation";

const TABLE_HEAD = ["Img", "Name", "Category", "Price", "Stock", "Action"];

const ProductsTable = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { products, status, error, categories } = useSelector(
    (state) => state.products
  );

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const PRODUCT_URL = process.env.NEXT_PUBLIC_PRODUCT_URL;

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  const handleEdit = (id) => {
    router.push(`/admin/products/${id}`);
  };

  const delProduct = async ({ name, id }) => {
    const result = await Swal.fire({
      title: `Are you sure to delete ${name.slice(0, 5)}...?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${PRODUCT_URL}`);
        const data = await res.json();

        let productKey = null;

        for (const categoryKey in data) {
          const categoryProducts = data[categoryKey];
          const foundEntry = Object.entries(categoryProducts || {}).find(
            ([, value]) => value.id === id
          );
          if (foundEntry) {
            productKey = {
              category: categoryKey,
              key: foundEntry[0],
            };
            break;
          }
        }

        if (!productKey) {
          Swal.fire("Error!", "Product not found.", "error");
          return;
        }

        const deleteRes = await fetch(
          `${BASE_URL}/products/${productKey.category}/${productKey.key}.json`,
          {
            method: "DELETE",
          }
        );

        if (!deleteRes.ok) throw new Error("Failed to delete");

        dispatch(fetchProducts());
        Swal.fire("Deleted!", "The product has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete the product.", "error");
      }
    }
  };

  const allProducts = categories
    .flatMap((category) => products[category] || [])
    .filter((product) => product?.id);

  return (
    <div className="min-h-screen w-full mt-3">
      <div className="mt-4 text-4xl items-center text-center">
        <h1 className="text-center text-green-600 dark:text-white">Products</h1>
        <Button
          color="green"
          className="mt-4"
          onClick={() => router.push("/admin/addproducts")}
        >
          Add Products
        </Button>
      </div>

      {status === "loading" && <Loading />}
      {status === "failed" && <p>Error: {error}</p>}
      {status === "succeeded" && (
        <Card className="h-full w-full overflow-auto mt-4">
          <table className="w-full min-w-max table-auto text-left dark:bg-[#0B2447] dark:text-[#ECFAE5] mb-5 mt-5">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className={`border-b border-blue-gray-100 dark:bg-[#0B2447] bg-blue-gray-50 p-4 ${
                      head === "Action" ? "text-center" : ""
                    }`}
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal leading-none opacity-70 dark:text-[#ECFAE5]"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allProducts.map(
                ({ id, name, category, price, stock, image }, index) => {
                  const isLast = index === allProducts.length - 1;
                  const classes = isLast
                    ? "p-4"
                    : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={id || index}>
                      <td className={classes}>
                        <Avatar src={image} alt={name} loading="lazy" />
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          className="font-normal dark:text-[#ECFAE5]"
                        >
                          {name.slice(0, 15)}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          className="font-normal dark:text-[#ECFAE5]"
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          className="font-normal dark:text-[#ECFAE5]"
                        >
                          {price} $
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          className="font-normal dark:text-[#ECFAE5]"
                        >
                          {stock}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <div className="w-full flex items-center justify-center gap-4">
                          <Button
                            size="sm"
                            color="yellow"
                            onClick={() => handleEdit(id)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            color="red"
                            onClick={() => delProduct({ name, id })}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default ProductsTable;
