"use client";

import {
  Card,
  Input,
  Button,
  Typography,
  Select,
  Option,
  Avatar,
} from "@material-tailwind/react";
import { useActionState, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { addNewUsers } from "./RegisterAction";

const DEFAULT_PHOTO_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Avj4TSMtuTPrA1IqGtlWogrd6D3aZhVwCA98c3NC442QLQU0rmqWv7M&s";

const Register = () => {
  const [state, formAction, isPending] = useActionState(addNewUsers, {
    errors: {},
    success: false,
    message: "",
    userId: null,
  });

  const [previewURL, setPreviewURL] = useState(DEFAULT_PHOTO_URL);
  const [gender, setGender] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onClose: () => router.push("/login"),
        });
      } else {
        const errorMessages = Object.values(state.errors)
          .filter(Boolean)
          .join(" ");
        const message = errorMessages || state.message;
        toast.error(message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  }, [state]);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewURL(URL.createObjectURL(file));
    } else {
      setPreviewURL(DEFAULT_PHOTO_URL);
    }
  };

  const handleGenderChange = (value) => {
    setGender(value);
  };

  return (
    <section className="px-5 xl:px-0 min-h-screen flex items-center justify-center">
      <div className="mx-auto max-w-[1170px] w-full ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
          <div className="hidden lg:block overflow-hidden rounded-l-lg">
            <video
              className="w-full h-full object-cover rounded-l-lg"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/Ecommerce.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <Card
            className="rounded-none lg:rounded-r-lg lg:pl-16 py-10 dark:bg-[#0B2447] dark:text-[#93B1A6]"
            shadow={false}
          >
            <Typography variant="h3" color="balck" className="mb-10">
              Create <span className="text-green-500">Account</span>
            </Typography>

            <form
              action={(formData) => {
                formAction({ formData });
              }}
              className="flex flex-col gap-4 dark:text-[#93B1A6]"
            >
              <div>
                <Input
                  name="name"
                  type="text"
                  label="Full Name"
                  size="lg"
                  color="green"
                  className="dark:text-[#93B1A6]"
                />
                {state.errors?.name && (
                  <Typography color="red" className="text-sm mt-1">
                    {state.errors.name}
                  </Typography>
                )}
              </div>

              <div>
                <Input
                  name="email"
                  type="email"
                  label={state.errors?.email ? state.errors.email : "Email"}
                  size="lg"
                  color="green"
                  className={
                    state.errors?.email
                      ? "border-red-500"
                      : "dark:text-[#93B1A6]"
                  }
                />
              </div>

              <div>
                <Input
                  name="password"
                  type="password"
                  label="Password"
                  size="lg"
                  color="green"
                  className="dark:text-[#93B1A6]"
                />
                {state.errors?.password && (
                  <Typography color="red" className="text-sm mt-1">
                    {state.errors.password}
                  </Typography>
                )}
              </div>

              <div className="mb-4 flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                  <Select
                    label="Select Gender"
                    color="green"
                    value={gender}
                    onChange={handleGenderChange}
                    className="dark:text-[#93B1A6]"
                  >
                    <Option value="">Select</Option>
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                  </Select>
                  <input
                    type="hidden"
                    name="gender"
                    value={gender}
                    className="dark:text-[#93B1A6]"
                  />
                  {state.errors?.gender && (
                    <Typography color="red" className="text-sm mt-1">
                      {state.errors.gender}
                    </Typography>
                  )}
                </div>
              </div>

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
                    accept=".jpg, .png"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                  <label
                    htmlFor="customFile"
                    className="absolute top-0 left-0 w-full h-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-blue-gray-900 bg-green-100 rounded-lg cursor-pointer hover:bg-green-200"
                  >
                    {state.errors?.photo ? (
                      <Typography color="red" className="text-sm text-center">
                        {state.errors.photo}
                      </Typography>
                    ) : (
                      "Upload Photo"
                    )}
                  </label>
                </div>
              </div>

              <Button
                color="green"
                size="lg"
                fullWidth
                type="submit"
                className="mt-4"
                disabled={isPending}
              >
                {isPending ? "Registering..." : "Register"}
              </Button>

              <Typography className="mt-3 text-center">
                Already have an account?{" "}
                <span
                  onClick={() => router.push("/login")}
                  className="text-green-600 font-medium cursor-pointer"
                >
                  Login
                </span>
              </Typography>
            </form>
          </Card>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};

export default Register;
