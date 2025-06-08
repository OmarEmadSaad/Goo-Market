"use client";
import React from "react";
import { Spinner, Typography } from "@material-tailwind/react";

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Spinner color="green" className="h-12 w-12 mb-4" />
      <Typography variant="h5" color="blue-gray" className="text-center">
        Loding...
      </Typography>
    </div>
  );
};

export default Loading;
