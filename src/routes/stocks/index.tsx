import { createFileRoute } from "@tanstack/react-router";
import { StocksTableClient } from "@/components/stockTableClient.tsx";

// Type definitions
export interface StockQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  fullExchangeName: string;
  marketState: string;
  quoteType: string;
}

async function fetchStocks() {
  const apiKey = import.meta.env.VITE_YAHOO_RAPID_API_KEY;
  if (!apiKey) {
    throw new Error("Yahoo Finance API key not found. Please check your .env file.");
  }

  const url = "https://yahoo-finance-real-time1.p.rapidapi.com/market/get-trending-tickers?region=US";
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": "yahoo-finance-real-time1.p.rapidapi.com",
    },
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const stocksQueryOptions = {
  queryKey: ["stocks", "trending"],
  queryFn: fetchStocks,
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  refetchInterval: 5 * 60 * 1000,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

export const Route = createFileRoute("/stocks/")({
  loader: async ({ context }) => {
    // Prefetch the query - this will cache it and make it available to the client
    await context.queryClient.prefetchQuery(stocksQueryOptions);
    return {};
  },
  component: StocksServerComponent,
});

// Server component that uses the cached query data
function StocksServerComponent() {
  return <StocksTableClient />;
}
