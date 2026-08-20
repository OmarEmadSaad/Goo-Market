import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ProductCard from "@/components/product/ProductCard";
import ProductGrid from "@/components/product/ProductGrid";
import ProductPrice from "@/components/product/ProductPrice";
import ProductBadge from "@/components/product/ProductBadge";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Pagination from "@/components/ui/Pagination";
import QuantitySelector from "@/components/cart/QuantitySelector";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { makeProduct } from "./fixtures";

/**
 * `ProductCard` and its children are Server Components, but they are pure
 * (no async, no data access), so they render directly in the test environment.
 * `AddToCartButton` needs the cart context, so cards are rendered here with
 * `showAddToCart={false}`; the button is covered in cart.test.tsx.
 */

describe("ProductPrice", () => {
  it("shows the discounted price and the struck-through list price", () => {
    render(<ProductPrice listPrice={700} />);
    expect(screen.getByText("EGP 630.00")).toBeInTheDocument();
    expect(screen.getByText("EGP 700.00")).toBeInTheDocument();
  });

  it("shows the discount percentage", () => {
    render(<ProductPrice listPrice={700} />);
    expect(screen.getByText("10% off")).toBeInTheDocument();
  });

  it("hides the struck-through price from screen readers and explains it", () => {
    const { container } = render(<ProductPrice listPrice={700} />);
    const struck = container.querySelector(".line-through");
    expect(struck).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText(/reduced from EGP 700/)).toBeInTheDocument();
  });

  it("omits the comparison when there is nothing to compare", () => {
    render(<ProductPrice listPrice={0} />);
    expect(screen.queryByText("10% off")).not.toBeInTheDocument();
  });
});

describe("ProductBadge", () => {
  it("reports in stock", () => {
    render(<ProductBadge product={{ stock: 20, inStock: true }} />);
    expect(screen.getByText("In stock")).toBeInTheDocument();
  });

  it("warns with the real remaining count when stock is low", () => {
    render(<ProductBadge product={{ stock: 3, inStock: true }} />);
    expect(screen.getByText("Only 3 left")).toBeInTheDocument();
  });

  it("reports out of stock", () => {
    render(<ProductBadge product={{ stock: 0, inStock: false }} />);
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
  });
});

describe("ProductCard", () => {
  const product = makeProduct();

  it("renders the name as a link to the canonical product URL", () => {
    render(<ProductCard product={product} showAddToCart={false} />);
    const link = screen.getByRole("link", { name: "Fan" });
    expect(link).toHaveAttribute("href", "/product/fan-el01");
  });

  it("links to the category, giving the grid real internal links", () => {
    render(<ProductCard product={product} showAddToCart={false} />);
    expect(screen.getByRole("link", { name: "Electronics" })).toHaveAttribute(
      "href",
      "/category/electronics"
    );
  });

  it("uses the product name as the image alt text", () => {
    render(<ProductCard product={product} showAddToCart={false} />);
    expect(screen.getByAltText("Fan")).toBeInTheDocument();
  });

  it("renders the price and stock state in the markup, not after hydration", () => {
    render(<ProductCard product={product} showAddToCart={false} />);
    expect(screen.getByText("EGP 630.00")).toBeInTheDocument();
    expect(screen.getByText("In stock")).toBeInTheDocument();
  });

  it("uses a heading so the grid has a real document outline", () => {
    render(<ProductCard product={product} showAddToCart={false} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Fan");
  });
});

describe("ProductGrid", () => {
  const products = [
    makeProduct(),
    makeProduct({ id: "el02", name: "Washing Machine", slug: "washing-machine-el02" }),
  ];

  it("renders one list item per product", () => {
    render(
      <ProductGrid
        products={products}
        showAddToCart={false}
        ariaLabel="Electronics"
      />
    );
    const list = screen.getByRole("list", { name: "Electronics" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders nothing at all for an empty list", () => {
    const { container } = render(
      <ProductGrid products={[]} showAddToCart={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("Breadcrumbs", () => {
  const trail = [
    { name: "Home", url: "/" },
    { name: "Electronics", url: "/category/electronics" },
    { name: "Fan", url: "/product/fan-el01" },
  ];

  it("links every crumb except the current page", () => {
    render(<Breadcrumbs trail={trail} />);
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Electronics" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Fan" })).not.toBeInTheDocument();
  });

  it("marks the last crumb as the current page", () => {
    render(<Breadcrumbs trail={trail} />);
    expect(screen.getByText("Fan")).toHaveAttribute("aria-current", "page");
  });

  it("is a labelled navigation landmark", () => {
    render(<Breadcrumbs trail={trail} />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("renders nothing for an empty trail", () => {
    const { container } = render(<Breadcrumbs trail={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("Pagination", () => {
  const buildHref = (page: number) => `/category/electronics?page=${page}`;

  it("renders nothing when there is only one page", () => {
    const { container } = render(
      <Pagination page={1} pageCount={1} buildHref={buildHref} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("marks the current page and links the others", () => {
    render(<Pagination page={2} pageCount={3} buildHref={buildHref} />);
    expect(screen.getByRole("link", { name: "Go to page 2" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "Go to page 3" })).toHaveAttribute(
      "href",
      "/category/electronics?page=3"
    );
  });

  it("disables Previous on the first page and Next on the last", () => {
    const { unmount } = render(
      <Pagination page={1} pageCount={3} buildHref={buildHref} />
    );
    expect(screen.getByLabelText("Go to previous page")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    unmount();

    render(<Pagination page={3} pageCount={3} buildHref={buildHref} />);
    expect(screen.getByLabelText("Go to next page")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  it("collapses a long range with ellipses around the current page", () => {
    render(<Pagination page={10} pageCount={20} buildHref={buildHref} />);
    expect(screen.getByRole("link", { name: "Go to page 1" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to page 20" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Go to page 5" })
    ).not.toBeInTheDocument();
  });
});

describe("QuantitySelector", () => {
  it("has a labelled numeric input", () => {
    render(<QuantitySelector value={2} onChange={vi.fn()} label="Quantity for Fan" />);
    expect(screen.getByLabelText("Quantity for Fan")).toHaveValue(2);
  });

  it("increments and decrements through named buttons", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<QuantitySelector value={2} onChange={onChange} max={5} />);

    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(onChange).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole("button", { name: "Decrease quantity" }));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("disables decrement at the minimum and increment at the stock ceiling", () => {
    const { unmount } = render(
      <QuantitySelector value={1} onChange={vi.fn()} min={1} max={5} />
    );
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
    unmount();

    render(<QuantitySelector value={5} onChange={vi.fn()} min={1} max={5} />);
    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
  });

  it("clamps a typed value above the available stock", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<QuantitySelector value={1} onChange={onChange} min={1} max={5} />);

    await user.type(screen.getByLabelText("Quantity"), "9");

    // "1" + "9" = 19, clamped to the 5 units actually in stock.
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it("clamps an emptied field back up to the minimum", async () => {
    // A stateful wrapper, because clamping is only observable when the value
    // the component receives actually follows what it reports.
    function Wrapper({ onChange }: { onChange: (value: number) => void }) {
      const [value, setValue] = useState(3);
      return (
        <QuantitySelector
          value={value}
          min={1}
          max={5}
          onChange={(next) => {
            setValue(next);
            onChange(next);
          }}
        />
      );
    }

    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Wrapper onChange={onChange} />);

    await user.clear(screen.getByLabelText("Quantity"));

    expect(onChange).toHaveBeenLastCalledWith(1);
    expect(screen.getByLabelText("Quantity")).toHaveValue(1);
  });
});

describe("state components", () => {
  it("renders an empty state with a call to action", () => {
    render(
      <EmptyState
        title="Your cart is empty"
        description="Start shopping now"
        action={{ label: "Browse products", href: "/" }}
      />
    );
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse products" })).toHaveAttribute(
      "href",
      "/"
    );
  });

  it("announces an error to assistive technology", () => {
    render(<ErrorState error="Failed to load products" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
    expect(screen.getByText("Failed to load products")).toBeInTheDocument();
  });

  it("falls back to a generic error message", () => {
    render(<ErrorState />);
    expect(screen.getByText(/could not load this right now/i)).toBeInTheDocument();
  });
});
