"use client";
import { Typography } from "@material-tailwind/react";

const Footer = () => {
  return (
    <div>
      <footer className="w-full bg-green-600 p-8 dark:bg-[#0B2447] dark:text-white">
        <Typography color="white" className="text-center font-normal">
          PRIVACY POUCY | TERMS OF SERVICE
        </Typography>
        <Typography color="white" className="text-center font-normal">
          &copy; 2025 Market All Rights Reserved
        </Typography>
      </footer>
    </div>
  );
};

export default Footer;
