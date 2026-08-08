import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-semibold tracking-tight text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-medium">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This page doesn't exist or has moved.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

/**
 * AuthBridge — watches localStorage for auth changes and invalidates
 * the router so authenticated/unauthenticated layouts react immediately.
 * Replaces the old Supabase onAuthStateChange listener.
 */
function AuthBridge() {
  const router = useRouter();
  const lastToken = useRef<string | null>(null);

  useEffect(() => {
    // Sync initial state
    lastToken.current = localStorage.getItem("token");

    // Listen for storage events (cross-tab logout/login)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        const nextToken = e.newValue;
        if (lastToken.current !== nextToken) {
          lastToken.current = nextToken;
          router.invalidate();
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [router]);

  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const setAppHeight = () => {
      const viewportHeight = window.visualViewport?.height ?? 0;
      const nextHeight = Math.max(window.innerHeight, viewportHeight, document.documentElement.clientHeight);
      document.documentElement.style.setProperty("--app-height", `${nextHeight}px`);
    };

    setAppHeight();
    const raf = window.requestAnimationFrame(setAppHeight);
    window.addEventListener("resize", setAppHeight);
    window.addEventListener("orientationchange", setAppHeight);
    window.addEventListener("pageshow", setAppHeight);
    window.visualViewport?.addEventListener("resize", setAppHeight);
    window.visualViewport?.addEventListener("scroll", setAppHeight);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", setAppHeight);
      window.removeEventListener("orientationchange", setAppHeight);
      window.removeEventListener("pageshow", setAppHeight);
      window.visualViewport?.removeEventListener("resize", setAppHeight);
      window.visualViewport?.removeEventListener("scroll", setAppHeight);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthBridge />
      <Outlet />
      <Toaster
        theme="dark"
        position="top-center"
        closeButton
        swipeDirections={["left", "right", "top"]}
        offset={{ top: "calc(env(safe-area-inset-top) + 0.75rem)" }}
        mobileOffset={{ top: "calc(env(safe-area-inset-top) + 0.75rem)" }}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: "ei-toast",
            title: "ei-toast-title",
            description: "ei-toast-desc",
            icon: "ei-toast-icon",
            closeButton: "ei-toast-close",
            loading: "ei-toast-loading",
            success: "ei-toast-success",
            error: "ei-toast-error",
          },
        }}
      />
    </QueryClientProvider>
  );
}
