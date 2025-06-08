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
import Link from "next/link";

const DEFAULT_PHOTO_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Avj4TSMtuTPrA1IqGtlWogrd6D3aZhVwCA98c3NC442QLQU0rmqWv7M&s";

const Register = () => {
  return (
    <section className="px-5 xl:px-0 min-h-screen flex items-center justify-center">
      <div className="mx-auto max-w-[1170px] w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            className="rounded-none lg:rounded-r-lg lg:pl-16 py-10"
            shadow={false}
          >
            <Typography variant="h3" color="blue-gray" className="mb-10">
              Create <span className="text-blue-500">Account</span>
            </Typography>

            <form className="flex flex-col gap-4">
              <Input
                name="name"
                type="text"
                label="Full Name"
                size="lg"
                color="green"
              />
              <Input
                name="email"
                type="email"
                label="Email"
                size="lg"
                color="green"
              />
              <Input
                name="password"
                type="password"
                label="Password"
                size="lg"
                color="green"
              />

              <div className="mb-4 flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                  <Typography variant="small" className="mb-2 font-bold">
                    Gender:
                  </Typography>
                  <Select name="gender" label="Select Gender" color="green">
                    <Option value="">Select</Option>
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                  </Select>
                </div>
              </div>

              <div className="hidden" id="specialization-field">
                <Input
                  name="specialization"
                  type="text"
                  label="Specialization (for doctors)"
                  size="lg"
                  color="green"
                />
              </div>

              <div className="flex items-center gap-3">
                <Avatar
                  src={DEFAULT_PHOTO_URL}
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
                  />
                  <label
                    htmlFor="customFile"
                    className="absolute top-0 left-0 w-full h-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-blue-gray-900 bg-green-100 rounded-lg cursor-pointer hover:bg-green-200"
                  >
                    Upload Photo
                  </label>
                </div>
              </div>

              <Button
                color="green"
                size="lg"
                fullWidth
                type="submit"
                className="mt-4"
              >
                Register
              </Button>

              <Typography className="mt-3 text-center">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-500 font-medium">
                  Login
                </Link>
              </Typography>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Register;
