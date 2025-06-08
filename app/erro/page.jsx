"use client";
import React from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";

const Error = ({ error }) => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardBody>
          <Typography variant="h5" color="red" className="mb-2 text-center">
            An Error Occurred
          </Typography>
          <Typography color="gray" className="text-center">
            {error || "Failed to load data. Please try again later."}
          </Typography>
        </CardBody>
      </Card>
    </div>
  );
};

export default Error;
