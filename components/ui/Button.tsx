import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "warning";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 disabled:hover:bg-green-600",
  secondary:
    "bg-white text-green-700 border border-green-600 hover:bg-green-50 dark:bg-transparent dark:text-green-300 dark:border-green-400 dark:hover:bg-white/10",
  ghost: "bg-transparent text-current hover:bg-black/5 dark:hover:bg-white/10",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  warning: "bg-yellow-500 text-gray-900 hover:bg-yellow-600",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm gap-1.5 min-h-9",
  md: "px-4 py-2 text-sm gap-2 min-h-10",
  lg: "px-6 py-3 text-base gap-2 min-h-12",
  icon: "h-10 w-10 justify-center",
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href"> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export default function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    fullWidth = false,
    className,
    children,
    ...rest
  } = props;

  const classes = cn(
    "inline-flex items-center justify-center rounded-md font-medium transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-60",
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className
  );

  if (typeof props.href === "string") {
    const { href, ...anchorProps } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };

    if (/^https?:\/\//i.test(href)) {
      return (
        <a
          href={href}
          rel="noopener noreferrer"
          target="_blank"
          className={classes}
          {...anchorProps}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } =
    rest as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
