"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import Loading from "../loding/page";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { updateCart, fetchCart } from "../ReduxSystem/cartSlice";
import Image from "next/image";

export default function ProductDetailsClient({ product }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const discountedPrice = (product.price - product.price * 0.0938).toFixed(2);

  const handleIncrement = () => setQuantity(quantity + 1);
  const handleDecrement = () => setQuantity(quantity > 1 ? quantity - 1 : 1);

  const handleBuyNow = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      const result = await Swal.fire({
        icon: "warning",
        title: "You need to login first",
        text: "Please login to continue with the purchase.",
        confirmButtonColor: "#3085d6",
      });
      if (result.isConfirmed) {
        router.push("/login");
      }
    } else {
      const result = await Swal.fire({
        icon: "success",
        title: "Purchase Started",
        text: `Thank you! You're buying ${product.name}.`,
        confirmButtonColor: "#28a745",
      });
      if (result.isConfirmed) {
        router.push("/");
      }
    }
  };

  const handleAddToCart = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      const result = await Swal.fire({
        icon: "warning",
        title: "You need to login first",
        text: "Please login to add items to your cart.",
        confirmButtonColor: "#3085d6",
      });
      if (result.isConfirmed) {
        router.push("/login");
      }
      return;
    }

    setLoading(true);
    try {
      const newItem = {
        id: product.id,
        name: product.name,
        price: parseFloat(discountedPrice),
        image: product.image,
        quantity: quantity,
      };

      const itemExists = cartItems.find((item) => item.id === product.id);

      let updatedCart;
      if (itemExists) {
        updatedCart = cartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updatedCart = [...cartItems, newItem];
      }

      await dispatch(updateCart({ userId, cart: updatedCart }));

      await Swal.fire({
        icon: "success",
        title: "Added to Cart",
        text: `${product.name} has been added to your cart!`,
        confirmButtonColor: "#28a745",
        timer: 1500,
      });

      router.push("/cart");
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add item to cart.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Loading />
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col md:flex-row gap-6 items-center min-h-screen justify-center dark:bg-[#03001C] dark:text-white">
      <div className="w-80">
        <Image
          loading="lazy"
          width={850}
          height={750}
          src={product.image}
          alt={product.name}
          className="rounded shadow-md"
        />
        <div className="flex justify-center gap-4 mt-4">
          {[...Array(3)].map((y, i) => (
            <img
              key={i}
              src={product.image}
              alt="Thumbnail"
              className="w-16 h-16 object-cover rounded cursor-pointer"
            />
          ))}
        </div>
      </div>

      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-gray-600">{product.description}</p>
        <p>Rating: ⭐ {product.rating}</p>
        <p>Brand: {product.brand}</p>
        <p>Category: {product.category}</p>
        <div className="flex gap-3 items-center">
          <span className="line-through text-gray-500">
            EGP {product.price}
          </span>
          <span className="text-green-600 font-bold">
            EGP {discountedPrice} (9.38% Off)
          </span>
        </div>

        <div className="flex gap-2 items-center">
          <span>Quantity:</span>
          <button className="px-2 border" onClick={handleDecrement}>
            -
          </button>
          <span>{quantity}</span>
          <button className="px-2 border" onClick={handleIncrement}>
            +
          </button>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={handleBuyNow}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
