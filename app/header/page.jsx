"use client";
//https://iconscout.com/lottie-animations/ecommerce
import {
  Navbar,
  Typography,
  IconButton,
  Button,
  Input,
  Drawer,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import {
  ShoppingCartIcon,
  XMarkIcon,
  Bars3Icon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "../ReduxSystem/productSlice";
import Error from "../erro/page";
import Loading from "../loding/page";
import { useRouter } from "next/navigation";

const Header = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  const { products, categories, status, error } = useSelector(
    (state) => state.products
  );
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems?.length || 0;

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark", "bg-gray-900", "text-white");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark", "bg-gray-900", "text-white");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const allProducts = categories.flatMap(
    (category) => products[category] || []
  );

  return (
    <>
      <Drawer
        open={openMenu}
        onClose={() => setOpenMenu(false)}
        className="p-4 bg-white text-black dark:bg-gray-900 dark:text-white h-full max-w-xs md:max-w-md"
        overlayProps={{
          className: "fixed inset-0 bg-black/70 backdrop-blur-sm z-40",
        }}
        style={{ height: "100vh" }}
      >
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h5">Side Menu</Typography>
          <IconButton onClick={() => setOpenMenu(false)}>
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        </div>
        {status === "loading" ? (
          <Loading />
        ) : status === "failed" ? (
          <Error error={error} />
        ) : allProducts.length === 0 ? (
          <Typography className="text-center">No Product Yet.🙄</Typography>
        ) : (
          <ul className="space-y-2">
            {allProducts.map((product) => (
              <li key={product.id}>
                <a
                  href={`/products/${product.id}`}
                  className="hover:text-green-500 transition-colors duration-300 font-extralight"
                >
                  {product.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </Drawer>

      <Navbar
        variant="gradient"
        color="green"
        className="mx-auto max-w-screen-3xl from-green-600 to-green-600 px-4 py-3 rounded-none"
      >
        <div className="flex flex-wrap items-center justify-between gap-x-4 text-white w-full">
          <div className="flex flex-wrap items-center gap-4 flex-1 min-w-[250px]">
            <IconButton
              variant="text"
              color="white"
              onClick={() => setOpenMenu(true)}
              className="md:inline-flex"
            >
              <Bars3Icon className="h-5 w-5" />
            </IconButton>
            <Typography
              onClick={() => router.push("/")}
              variant="h6"
              className="cursor-pointer py-1.5 hover:text-green-200 transition-colors duration-300 whitespace-nowrap"
            >
              Goo-Market
            </Typography>

            <div className="relative flex w-full max-w-lg ml-2 min-w-[200px]">
              <Input
                type="search"
                color="white"
                label="Type here..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pr-24"
                containerProps={{
                  className: "w-full",
                }}
              />
              <Button
                size="sm"
                color="green"
                className="!absolute right-1 top-1 rounded"
              >
                Search
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <IconButton
              variant="text"
              color="white"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </IconButton>

            <div className="relative">
              <IconButton
                variant="text"
                color="white"
                onClick={() => router.push("/cart")}
              >
                <ShoppingCartIcon className="h-5 w-5" />
              </IconButton>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {cartCount}
              </span>
            </div>

            <Button
              variant="text"
              color="white"
              size="sm"
              onClick={() => router.push("/login")}
            >
              Login
            </Button>
          </div>
        </div>
      </Navbar>
    </>
  );
};

export default Header;
