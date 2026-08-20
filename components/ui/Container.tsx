import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const WIDTHS = {
  narrow: "max-w-3xl",
  default: "max-w-7xl",
  wide: "max-w-screen-2xl",
} as const;

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  size?: keyof typeof WIDTHS;
  children?: ReactNode;
}

export default function Container({
  as: Component = "div",
  size = "default",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", WIDTHS[size], className)}
      {...props}
    >
      {children}
    </Component>
  );
}
