import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrderStatusStepper } from "./OrderStatusStepper";

describe("OrderStatusStepper", () => {
  it("marks steps up to and including the current status as complete", () => {
    render(<OrderStatusStepper status="preparing" />);

    expect(screen.getByTestId("step-received")).toHaveAttribute("data-complete", "true");
    expect(screen.getByTestId("step-preparing")).toHaveAttribute("data-complete", "true");
    expect(screen.getByTestId("step-out_for_delivery")).toHaveAttribute("data-complete", "false");
    expect(screen.getByTestId("step-delivered")).toHaveAttribute("data-complete", "false");
  });

  it("marks every step complete once delivered", () => {
    render(<OrderStatusStepper status="delivered" />);
    expect(screen.getByTestId("step-delivered")).toHaveAttribute("data-complete", "true");
  });

  it("renders the human-readable label for each status", () => {
    render(<OrderStatusStepper status="received" />);
    expect(screen.getByText("Order Received")).toBeInTheDocument();
    expect(screen.getByText("Out for Delivery")).toBeInTheDocument();
  });
});
