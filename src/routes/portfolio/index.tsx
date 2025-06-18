import { createFileRoute } from "@tanstack/react-router";
import { PortfolioContent } from "@/components/PortfolioContent.tsx";
import { AddStockForm } from "@/components/AddStockForm.tsx";


function fetchPortfolio() {
  console.log("fetchPortfolio");
  const portfolio = JSON.parse(localStorage.getItem("portfolio") || "[]");
  console.log(portfolio);
  return portfolio;
}

export const watchlistQueryOptions = {
  queryKey: ["portfolio"],
  queryFn: fetchPortfolio,
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  refetchInterval: 5 * 60 * 1000,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

export const Route = createFileRoute("/portfolio/")({
  loader: async ({ context }) => {
    // Prefetch the query - this will cache it and make it available to the client
    await context.queryClient.prefetchQuery(watchlistQueryOptions);
    return {};
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (<>
    <AddStockForm />
    <PortfolioContent />
  </>);
}
