"use client";
import { ThemeProvider } from "@material-tailwind/react";

export default function Provider({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
