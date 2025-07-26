"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { v4 as uuidv4 } from "uuid";
import { fetchProducts } from "@/app/ReduxSystem/productSlice";
import { Avatar, Typography } from "@material-tailwind/react";

const AddProducts = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    id: uuidv4().slice(0, 8),
    category: "",
    name: "",
    price: "",
    stock: "",
    image: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewURL, setPreviewURL] = useState(
    "https://static.thenounproject.com/png/5191452-200.png"
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!imageFile && !form.image) {
      return "https://static.thenounproject.com/png/5191452-200.png";
    }

    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_UPLOAD_PRESET);

      try {
        setUploading(true);
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await response.json();
        setUploading(false);
        return data.secure_url;
      } catch (error) {
        setUploading(false);
        Swal.fire({
          icon: "error",
          title: "Image Upload Failed",
          text: error.message,
        });
        throw error;
      }
    }

    return form.image;
  };
  const handleAddProduct = async () => {
    const { category, name, price, stock } = form;

    if (!category || !name || !price || !stock) {
      Swal.fire({
        icon: "warning",
        title: "All fields are required",
        text: "Please fill in all required fields before submitting.",
      });
      return;
    }

    try {
      const imageUrl = await uploadImage();

      const newProduct = {
        id: form.id,
        category: category.trim().toLowerCase(),
        name: name,
        price: parseFloat(price),
        stock: parseInt(stock),
        image: imageUrl,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PRODUCT_URL.replace(".json", "")}/${category
          .trim()
          .toLowerCase()}.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newProduct),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      await response.json();
      await dispatch(fetchProducts()).unwrap();

      Swal.fire({
        icon: "success",
        title: "Product added successfully!",
        showConfirmButton: false,
        timer: 1500,
      });

      setTimeout(() => {
        router.push("/admin/products");
      }, 1600);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Failed to add product",
        text: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-[#03001C] dark:text-white">
      <div className="w-full max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg flex flex-col gap-4 dark:bg-[#0B2447] dark:text-white">
        <h2 className="text-2xl font-bold text-center text-green-600 dark:text-white">
          Add Product
        </h2>

        <input
          type="text"
          name="id"
          value={form.id}
          readOnly
          placeholder="Product ID (auto-generated)"
          className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed dark:bg-[#0B2447] dark:text-white"
        />

        <input
          type="text"
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          placeholder="Product Category (e.g., electronics)"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0B2447] dark:text-white"
        />

        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="Product Name"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0B2447] dark:text-white"
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            placeholder="Product Price"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0B2447] dark:text-white"
          />
          <input
            type="text"
            value="$"
            readOnly
            className="w-full sm:w-20 p-2 border rounded-md bg-gray-100 cursor-not-allowed dark:bg-[#0B2447] dark:text-white"
          />
        </div>

        <input
          type="number"
          name="stock"
          value={form.stock}
          onChange={handleChange}
          required
          placeholder="Stock Quantity"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0B2447] dark:text-white"
        />

        <input
          type="text"
          name="image"
          value={form.image}
          onChange={handleChange}
          required
          placeholder="Image URL (optional)"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0B2447] dark:text-white"
        />

        <p className="text-sm text-gray-500">
          Or upload an image below (default image will be used if none provided)
        </p>

        <div className="flex items-center gap-3">
          <Avatar
            src={previewURL}
            alt="Avatar"
            size="lg"
            className="border-2 border-green-500"
          />
          <div className="relative h-[50px] w-[130px]">
            <input
              type="file"
              name="photo"
              id="customFile"
              accept=".jpg, .png, .jpeg"
              className="hidden"
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

        <div className="text-center">
          <button
            onClick={handleAddProduct}
            disabled={uploading}
            className={`px-4 py-2 bg-green-500 text-white rounded-md ${
              uploading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
            }`}
          >
            {uploading ? "Uploading..." : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProducts;
