import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import PolicyAgreement from "./PolicyAgreement";
import StockBadge from "./StockBadge";

jest.mock("react-router-dom", () => ({ Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a> }), { virtual: true });

function CheckoutGate() {
  const [accepted, setAccepted] = useState(false);
  return <><PolicyAgreement checked={accepted} onChange={setAccepted} /><button disabled={!accepted}>Place order</button></>;
}

test("agreement starts unchecked, links every policy, and only enables ordering after checking", () => {
  render(<CheckoutGate />);
  expect(screen.getByRole("checkbox")).not.toBeChecked();
  expect(screen.getByRole("button")).toBeDisabled();
  for (const [name, href] of [["Terms & Conditions", "/terms-and-conditions"], ["Privacy Policy", "/privacy-policy"], ["Return & Refund Policy", "/cancellation-return-policy"]]) {
    expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    expect(screen.getByRole("link", { name })).toHaveAttribute("target", "_blank");
  }
  fireEvent.click(screen.getByRole("checkbox"));
  expect(screen.getByRole("button")).toBeEnabled();
  fireEvent.click(screen.getByRole("checkbox"));
  expect(screen.getByRole("button")).toBeDisabled();
});

test("sold out product and size inventory show image badges", () => {
  const view = render(<StockBadge product={{ stock: 0 }} />);
  expect(screen.getByText("Out of stock")).toBeInTheDocument();
  view.rerender(<StockBadge product={{ stock: 2, inStock: true, sizes: ["M"], sizeStock: { M: 0 } }} />);
  expect(screen.getByText("Out of stock")).toBeInTheDocument();
  view.rerender(<StockBadge product={{ stock: 2, inStock: true, sizes: ["M"], sizeStock: { M: 2 } }} />);
  expect(screen.queryByText("Out of stock")).not.toBeInTheDocument();
});
