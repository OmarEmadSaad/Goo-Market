"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { fetchUsers, setUserId } from "../ReduxSystem/usersSlice";
import { Button } from "@material-tailwind/react";
import "react-toastify/dist/ReactToastify.css";

const LoginForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { users, status, error } = useSelector((state) => state.users);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchUsers());
    }
  }, [status, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const matchedUser = users.find(
      (user) =>
        (user.email?.toLowerCase() === formData.email.toLowerCase() ||
          user.Email?.toLowerCase() === formData.email.toLowerCase()) &&
        user.password === formData.password
    );

    if (matchedUser) {
      await dispatch(setUserId(matchedUser.id)).unwrap();
      toast.success("Login successful");
      router.push("/");
    } else {
      toast.error("User Not Found, you must Sign Up");
    }
  };

  return (
    <>
      <form className="py-4 md:py-0" onSubmit={handleSubmit}>
        <div className="mb-5 text-left">
          <label className="block text-sm font-medium text-headingColor mb-1">
            Your Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="name@mail.com"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none text-[16px] leading-7 focus:border-primaryColor text-headingColor placeholder:text-textColor rounded-md"
          />
        </div>

        <div className="mb-5 text-left">
          <label className="block text-sm font-medium text-headingColor mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="********"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none text-[16px] leading-7 focus:border-primaryColor text-headingColor placeholder:text-textColor rounded-md"
          />
        </div>

        <div className="mt-7">
          <Button variant="gradient" fullWidth type="submit" color="green">
            Login
          </Button>
        </div>
      </form>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default LoginForm;
