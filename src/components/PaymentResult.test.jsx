import { render, screen, waitFor } from "@testing-library/react";
import PaymentResult from "./PaymentResult";
import { getPaymentStatus } from "../api/orders";

const mockToken = "a".repeat(64);
const mockRemove = jest.fn();
jest.mock("react-router-dom", () => ({
  useSearchParams: () => [new URLSearchParams(`token=${mockToken}`)],
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });
jest.mock("../api/orders", () => ({ getPaymentStatus: jest.fn(), rememberGuestOrder: jest.fn() }));
jest.mock("../context/CartContext", () => ({ useCart: () => ({ items: [], loading: false, remove: mockRemove }) }));

beforeEach(() => { jest.clearAllMocks(); sessionStorage.clear(); });

test("a success URL does not show success for an unverified payment", async () => {
  getPaymentStatus.mockResolvedValue({ order_code: "RZ1", total: 200, payment_status: "pending" });
  render(<PaymentResult success />);
  expect(await screen.findByText("Payment not confirmed")).toBeInTheDocument();
  expect(screen.queryByText("Payment Successful")).not.toBeInTheDocument();
  expect(mockRemove).not.toHaveBeenCalled();
});

test("the failure page recognizes a payment confirmed by IPN", async () => {
  getPaymentStatus.mockResolvedValue({ order_code: "RZ1", total: 200, payment_status: "paid" });
  render(<PaymentResult />);
  expect(await screen.findByText("Payment Successful")).toBeInTheDocument();
  expect(screen.getByText(/BDT 200/)).toBeInTheDocument();
});

test("a validation service outage does not claim success", async () => {
  getPaymentStatus.mockRejectedValue(new Error("Network error"));
  render(<PaymentResult success />);
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("could not check your payment"));
  expect(screen.queryByText("Payment Successful")).not.toBeInTheDocument();
});

test("risky payments show manual review", async () => {
  getPaymentStatus.mockResolvedValue({ order_code: "RZ1", total: 200, payment_status: "review" });
  render(<PaymentResult success />);
  expect(await screen.findByText("Payment under review")).toBeInTheDocument();
});
