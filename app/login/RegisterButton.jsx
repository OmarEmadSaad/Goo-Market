"use client";

import { Button } from "@material-tailwind/react";
import { useRouter } from "next/navigation";

const RegisterButton = () => {
  const router = useRouter();

  return (
    <button
      variant="text"
      size="sm"
      onClick={() => router.push("/register")}
      className="text-green-600"
    >
      Register
    </button>
  );
};

export default RegisterButton;
