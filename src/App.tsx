import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";

const router = getRouter();

// Register the router for type-safe navigation
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
