"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { Input, Button, Typography, Avatar } from "@material-tailwind/react";
import Swal from "sweetalert2";
import { fetchProducts } from "@/app/ReduxSystem/productSlice";
import Loading from "@/app/loding/page";

const EditProducts = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { products, status, error } = useSelector((state) => state.products);

  const [id, setId] = useState(params?.id || null);

  useEffect(() => {
    if (!id) {
      const url = window.location.pathname;
      const segments = url.split("/").filter(Boolean);
      if (
        segments.length >= 3 &&
        segments[0] === "admin" &&
        segments[1] === "products"
      ) {
        const fallbackId = segments[segments.length - 1];
        if (fallbackId && !["products", "admin"].includes(fallbackId)) {
          setId(fallbackId);
        } else {
          router.push("/admin/products");
        }
      } else {
        router.push("/admin/products");
      }
    }
  }, [id, router]);

  const product = id
    ? Object.values(products)
        .flat()
        .find((p) => p.id === id)
    : null;

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    image: "",
  });
  const [previewURL, setPreviewURL] = useState(null);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProducts());
    }
    if (product) {
      setForm({
        name: product.name || "",
        price: product.price || "",
        category: product.category || "",
        stock: product.stock || "",
        image: product.image || "",
      });
      setPreviewURL(product.image || null);
    }
  }, [product, status, dispatch, id, error, params]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newPreviewURL = URL.createObjectURL(file);
      setPreviewURL(newPreviewURL);
      setForm({ ...form, image: newPreviewURL });
    }
  };

  const handleEdit = async () => {
    try {
      if (!id) throw new Error("No product ID provided");
      let imageUrl = form.image;
      if (form.image.startsWith("blob:")) {
        throw new Error(
          "File upload not implemented. Please provide an image URL."
        );
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_URL}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          price: parseFloat(form.price) || 0,
          category: form.category,
          stock: parseInt(form.stock) || 0,
          image: imageUrl || "",
        }),
      });

      if (!res.ok) throw new Error(`Failed to update: ${res.statusText}`);

      await res.json();
      dispatch(fetchProducts());
      Swal.fire({
        icon: "success",
        title: "Product updated successfully!",
        showConfirmButton: false,
        timer: 1500,
      });
      setTimeout(() => {
        router.push("/admin/products");
      }, 150);
    } catch (err) {
      console.error("Edit error:", err.message);
      Swal.fire({
        icon: "error",
        title: "Failed to update product",
        text: err.message,
      });
    }
  };

  const redirectToProducts = () => {
    router.push("/admin/products");
  };

  if (!id) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center ">
        <Typography variant="h6" color="red">
          Error: No product ID provided in the URL.
        </Typography>
        <Typography variant="small" color="gray" className="mt-2">
          Please navigate to a valid product ID (e.g., /admin/products/el01).
        </Typography>
        <Button onClick={redirectToProducts} className="mt-4">
          Go to Products
        </Button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center">
        <Loading />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center">
        <Typography variant="h6" color="red">
          Error: {error}
        </Typography>
      </div>
    );
  }

  if (!product && status === "succeeded") {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center">
        <Typography variant="h6" color="red">
          Product with ID "{id}" not found.
        </Typography>
        <Button onClick={redirectToProducts} className="mt-4">
          Go to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg flex flex-col gap-4 min-h-screen mt-5 mb-5 space-y-12 dark:bg-[#0B2447] ">
      <Input
        label="Product Name"
        type="text"
        value={form.name}
        className="dark:text-white"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          label="Product Price"
          type="number"
          value={form.price}
          className="dark:text-white"
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <Input label="Currency" value="$" readOnly className="w-full" />
      </div>

      <Input
        label="Product Category"
        type="text"
        value={form.category}
        className="dark:text-white"
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      />

      <Input
        label="Product Stock"
        type="number"
        value={form.stock}
        className="dark:text-white"
        onChange={(e) => setForm({ ...form, stock: e.target.value })}
      />

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Input
          label="Product Image URL"
          type="text"
          value={form.image}
          className="dark:text-white"
          onChange={(e) => {
            const newImage = e.target.value;
            setForm({ ...form, image: newImage });
            setPreviewURL(newImage || null);
          }}
        />
        <div className="flex items-center gap-3">
          {previewURL && (
            <Avatar
              src={previewURL}
              alt="Product Image"
              size="lg"
              className="border-2 border-green-500"
            />
          )}
          <div className="relative h-[50px] w-[130px]">
            <input
              type="file"
              name="photo"
              id="customFile"
              accept=".jpg, .png, .jpeg"
              className="hidden dark:text-white"
              onChange={handleImageChange}
            />
            <label
              htmlFor="customFile"
              className="absolute top-0 left-0 w-full h-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-blue-gray-900 bg-green-100 rounded-lg cursor-pointer hover:bg-green-200"
            >
              Upload Photo
            </label>
          </div>
        </div>
      </div>
      <Typography variant="small" color="gray" className=" dark:text-white">
        Provide a valid URL (e.g., "https://url") or upload an image (.jpg,
        .png, .jpeg)
      </Typography>

      <div className="text-center">
        <Button onClick={handleEdit} color="green">
          Edit Product
        </Button>
      </div>
    </div>
  );
};

export default EditProducts;
