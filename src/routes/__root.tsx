// app/routes/__root.tsx
import { createRootRouteWithContext, Outlet, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "@/styles/app.css?url"; // Important: use ?url import
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { RouterContext } from "@/routerContext.tsx";
import { useEffect, useState } from "react";

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [
      { rel: "stylesheet", href: appCss }, // This ensures CSS loads in SSR
    ],
    scripts: [
      {
        type: "module",
        children: `import RefreshRuntime from "/@react-refresh"
  RefreshRuntime.injectIntoGlobalHook(window)
  window.$RefreshReg$ = () => {}
  window.$RefreshSig$ = () => (type) => type
  window.__vite_plugin_react_preamble_installed__ = true`,
      },
      {
        type: "module",
        src: "/@vite/client",
      },
      {
        type: "module",
        src: "/src/entry-client.tsx",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RootDocument>
        <Outlet />
        {/* Only render devtools on the client side */}
        {isClient && <ReactQueryDevtools initialIsOpen={false}  />}
      </RootDocument>
    </QueryClientProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
    <head>
      <title>Finance Forecast</title>
      <HeadContent />
    </head>
    <body>
    {children}
    <Scripts />
    </body>
    </html>
  );
}
