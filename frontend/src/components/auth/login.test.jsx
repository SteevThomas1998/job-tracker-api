import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import Login from "./login.jsx";

describe("Login", () => {
  it("renders heading, inputs and button", () => {
    render(<Login />);

    // heading
    expect(screen.getByRole("heading", { level: 2, name: /login/i })).toBeInTheDocument();

    // inputs by placeholder (since there are no labels/ids)
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();

    // button
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("allows typing into email and password", async () => {
    render(<Login />);
    const user = userEvent.setup();

    const email = screen.getByPlaceholderText(/email/i);
    const password = screen.getByPlaceholderText(/password/i);

    await user.type(email, "test@example.com");
    await user.type(password, "secret123");

    expect(email).toHaveValue("test@example.com");
    expect(password).toHaveValue("secret123");
  });
});