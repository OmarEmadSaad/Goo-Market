"use client";
import {
  Navbar,
  Typography,
  IconButton,
  Button,
  Input,
  Drawer,
  Avatar,
  ListItem,
  ListItemPrefix,
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
import Error from "../erro/page";
import Loading from "../loding/page";
import { useRouter } from "next/navigation";
import { fetchProducts } from "../ReduxSystem/productSlice";
import { fetchUsers, setUserId } from "../ReduxSystem/usersSlice";

const Header = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  const {
    products,
    categories,
    status: productStatus,
    error: productError,
  } = useSelector((state) => state.products);
  const {
    users,
    userId,
    status: userStatus,
    error: userError,
  } = useSelector((state) => state.users);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const cartCount = cartItems?.length || 0;

  const currentUser = users.find((user) => user.id === userId);

  useEffect(() => {
    const savedId = localStorage.getItem("userId");
    if (savedId) {
      dispatch(setUserId(savedId));
    }
  }, [dispatch]);

  useEffect(() => {
    if (userId && userStatus === "idle") {
      dispatch(fetchUsers());
    }
  }, [userId, userStatus, dispatch]);

  useEffect(() => {
    if (productStatus === "idle") {
      dispatch(fetchProducts());
    }
  }, [dispatch, productStatus]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark", "bg-[#03001C]", "text-white");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark", "bg-[#03001C]", "text-white");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    dispatch(setUserId(null));
    router.push("/login");
  };

  const cloudName = process.env.NEXT_PUBLIC_CLOUD_NAME;
  const getImageUrl = (image) => {
    if (!image) {
      return "https://res.cloudinary.com/demo/image/upload/sample.jpg";
    }
    if (image.startsWith("http")) {
      return image;
    }
    const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${image}`;
    return cloudinaryUrl;
  };

  const allProducts =
    categories?.flatMap((category) => products[category] || []) || [];

  return (
    <>
      <Drawer
        open={openMenu}
        onClose={() => setOpenMenu(false)}
        className="p-4 bg-white text-black dark:bg-[#03001C] dark:text-white h-full max-w-xs md:max-w-md"
        overlayProps={{
          className: "fixed inset-0 bg-black/70 backdrop-blur-sm z-40",
        }}
        style={{ height: "100vh" }}
      >
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h5">Side Menu</Typography>
          <IconButton
            onClick={() => setOpenMenu(false)}
            color="blue-gray"
            variant="text"
          >
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        </div>
        {productStatus === "loading" ? (
          <Loading />
        ) : productStatus === "failed" ? (
          <Error error={productError} />
        ) : allProducts.length === 0 ? (
          <Typography className="text-center">No Product Yet.🙄</Typography>
        ) : (
          <ul className="space-y-2">
            {currentUser?.role === "admin" && (
              <ListItem
                onClick={() => {
                  router.push("/admin");
                  setOpenMenu(false);
                }}
              >
                <ListItemPrefix>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 2.25a.75.75 0 000 1.5H3v10.5a3 3 0 003 3h1.21l-1.172 3.513a.75.75 0 001.424.474l.329-.987h8.418l.33.987a.75.75 0 001.422-.474l-1.17-3.513H18a3 3 0 003-3V3.75h.75a.75.75 0 000-1.5H2.25zm6.04 16.5l.5-1.5h6.42l.5 1.5H8.29zm7.46-12a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6zm-3 2.25a.75.75 0 00-1.5 0v3.75a.75.75 0 001.5 0V9zm-3 2.25a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </ListItemPrefix>
                Dashboard
              </ListItem>
            )}
            {allProducts.map((product) => (
              <li key={product.id}>
                <span
                  onClick={() => {
                    router.push(
                      `/search?query=${encodeURIComponent(product.name)}`
                    );
                    setOpenMenu(false);
                  }}
                  className="cursor-pointer hover:text-green-500 transition-colors duration-300 font-sans"
                >
                  {product.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Drawer>

      <Navbar
        variant="gradient"
        className="mx-auto max-w-screen-3xl from-green-600 to-green-600 bg-green-600 px-4 py-3 rounded-none dark:bg-[#0B2447] dark:text-white"
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
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchText.trim()) {
                    router.push(
                      `/search?query=${encodeURIComponent(searchText.trim())}`
                    );
                    setSearchText("");
                  }
                }}
                className="pr-24"
                containerProps={{
                  className: "w-full",
                }}
              />

              <Button
                size="sm"
                color="green"
                className="!absolute right-1 top-1 rounded dark:bg-[#03001C] dark:text-white"
                onClick={() => {
                  if (searchText.trim()) {
                    router.push(
                      `/search?query=${encodeURIComponent(searchText.trim())}`
                    );
                    setSearchText("");
                  }
                }}
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

            {userId ? (
              userStatus === "loading" ? (
                <Typography>Loading...</Typography>
              ) : userStatus === "failed" ? (
                <Typography>Error loading user</Typography>
              ) : (
                <div className="flex items-center gap-2">
                  <Avatar
                    src={
                      getImageUrl(currentUser?.image) ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Avj4TSMtuTPrA1IqGtlWogrd6D3aZhVwCA98c3NC442QLQU0rmqWv7M&s"
                    }
                    alt={currentUser?.name || "User"}
                    size="sm"
                    className="border border-white inline-block"
                    placeholder={
                      currentUser?.name?.charAt(0).toUpperCase() || "?"
                    }
                    withBorder={true}
                    color="green"
                    style={{
                      display: "inline-block",
                      width: "40px",
                      height: "40px",
                      visibility: "visible",
                    }}
                  />
                  <Button
                    variant="text"
                    color="white"
                    size="sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              )
            ) : (
              <Button
                variant="text"
                color="white"
                size="sm"
                onClick={() => router.push("/login")}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </Navbar>
    </>
  );
};

export default Header;
