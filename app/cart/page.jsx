"use client";

import { Card, Typography, Button } from "@material-tailwind/react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, setCartItems } from "../ReduxSystem/cartSlice";
import Error from "../erro/page";
import Loading from "../loding/page";

const Cart = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { cartItems, status, error } = useSelector((state) => state.cart);
  const urlUser = process.env.NEXT_PUBLIC_USERS_URL;
  const userId = useSelector((state) => state.auth.userId);

  useEffect(() => {
    if (userId && status === "idle") {
      dispatch(fetchCart(userId));
    }
  }, [dispatch, userId, status]);

  const isEmpty = cartItems.length === 0;

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const taxes = subtotal * 0.15;
  const shipping = 0;
  const total = subtotal + taxes + shipping;

  const handleDelete = async (id) => {
    if (!userId) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${urlUser}/${userId}`);
      const user = await res.json();
      const cart = Array.isArray(user.cart) ? user.cart : [];
      const updatedCart = cart.filter((item) => item.id !== id);

      await fetch(`${urlUser}/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: updatedCart }),
      });

      dispatch(setCartItems(updatedCart));
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to delete item from cart",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const handleIncrement = async (id) => {
    if (!userId) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${urlUser}/${userId}`);
      const user = await res.json();
      const cart = Array.isArray(user.cart) ? user.cart : [];
      const updatedCart = cart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      );

      await fetch(`${urlUser}/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: updatedCart }),
      });

      dispatch(setCartItems(updatedCart));
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to update quantity",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const handleDecrement = async (id) => {
    if (!userId) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${urlUser}/${userId}`);
      const user = await res.json();
      const cart = Array.isArray(user.cart) ? user.cart : [];
      const updatedCart = cart.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );

      await fetch(`${urlUser}/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: updatedCart }),
      });

      dispatch(setCartItems(updatedCart));
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to update quantity",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const handleCheckout = async () => {
    if (!userId) {
      router.push("/login");
      return;
    }

    try {
      await fetch(`${urlUser}/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: [] }),
      });

      dispatch(setCartItems([]));
      Swal.fire({
        title: "Payment Successful",
        text: "Thank you for shopping with us!",
        icon: "success",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        router.push("/");
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to process checkout",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  if (status === "loading") {
    return <Loading />;
  }

  if (status === "failed") {
    return <Error error={error} />;
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-start gap-10 p-6 min-h-screen dark:bg-[#03001C] dark:text-white">
      <div className="w-full md:w-2/3 text-center">
        <Typography variant="h4" color="green" className="mb-6">
          Shopping Cart
        </Typography>

        {isEmpty ? (
          <div className="text-center mt-20">
            <img
              src="https://goomarket.vercel.app/assets/shopping_cart-b0846037.png"
              alt="Empty Cart"
              className="mx-auto w-40 mb-6"
            />
            <Typography variant="h5" className="mb-2 font-semibold">
              Your cart is empty
            </Typography>
            <Typography color="gray" className="mb-4">
              Looks like you haven't added any products yet. Start shopping now!
            </Typography>
            <Button color="green" onClick={() => router.push("/")}>
              Browse Products
            </Button>
          </div>
        ) : (
          cartItems.map(({ id, name, price, image, quantity }, index) => (
            <div
              key={id || index}
              className="flex items-center justify-between border-b py-4 gap-4 overflow-x-auto flex-nowrap "
            >
              <div className="flex items-center gap-4 min-w-[180px] shrink-0">
                <img
                  src={image}
                  alt={name || "Product"}
                  className="w-16 h-16 object-cover"
                />
                <h1 className="font-semibold text-sm md:text-base">
                  {name ? name.slice(0, 20) : "Product"}
                </h1>
              </div>

              <div className="flex flex-col items-center min-w-[100px] shrink-0">
                <h1 className="text-sm text-gray-500">Price</h1>
                <p className="text-sm mt-1">
                  EGP {parseFloat(price).toFixed(2)}
                </p>
              </div>

              <div className="flex flex-col items-center min-w-[130px] shrink-0">
                <h1 className="text-sm text-gray-500">Quantity</h1>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => handleDecrement(id)}
                    className="w-8 h-8 border rounded"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <p className="w-8 text-center">{quantity}</p>
                  <button
                    type="button"
                    onClick={() => handleIncrement(id)}
                    className="w-8 h-8 border rounded"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 min-w-[140px] shrink-0">
                <p className="font-semibold whitespace-nowrap">
                  EGP {(price * quantity).toFixed(2)}
                </p>
                <button
                  type="button"
                  onClick={() => handleDelete(id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <MdDelete size={24} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Card className="w-full md:w-1/3 p-6 dark:bg-[#0B2447] dark:text-white">
        <Typography variant="h5" className="mb-4">
          Summary
        </Typography>

        <div className="flex justify-between mb-2">
          <Typography>Subtotal</Typography>
          <Typography>EGP {subtotal.toFixed(2)}</Typography>
        </div>
        <div className="flex justify-between mb-2">
          <Typography>Taxes</Typography>
          <Typography>EGP {taxes.toFixed(2)}</Typography>
        </div>
        <div className="flex justify-between mb-2">
          <Typography>Shipping</Typography>
          <Typography>EGP {shipping.toFixed(2)}</Typography>
        </div>
        <hr className="my-4" />
        <div className="flex justify-between font-bold text-lg mb-4">
          <Typography>Total</Typography>
          <Typography>EGP {total.toFixed(2)}</Typography>
        </div>

        <Button
          color="green"
          fullWidth
          onClick={handleCheckout}
          disabled={isEmpty || status === "loading"}
        >
          Checkout
        </Button>
      </Card>
    </div>
  );
};

export default Cart;
