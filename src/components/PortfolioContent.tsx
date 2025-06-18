import { useQuery, useQueryClient } from "@tanstack/react-query";

// Re-use the same options object that the route's loader
// used to pre-fetch the data, so the query will be read
// from the cache and no extra network call is made.
import { watchlistQueryOptions } from "@/routes/portfolio/index.tsx";

/**
 * Displays the user's stock watchlist inside a table.
 *
 * Data are prefetched on the server via the `/portfolio/` route loader
 * and hydrated on the client by React Query.
 */
export function PortfolioContent() {
  const queryClient = useQueryClient();
  const {
    data: portfolio = [],
    error,
    isFetching,
  } = useQuery<any[]>(watchlistQueryOptions);

  const handleRemoveStock = (stockId: number, ticker: string) => {
    if (confirm(`Are you sure you want to remove ${ticker} from your portfolio?`)) {
      queryClient.setQueryData(["portfolio"], (oldData: any[] = []) => {
        return oldData.filter((stock: any) => stock.id !== stockId);
      });
      const existingPortfolio = JSON.parse(localStorage.getItem("portfolio") || "[]");
      const updatedPortfolio = existingPortfolio.filter((stock: any) => stock.id !== stockId);
      localStorage.setItem("portfolio", JSON.stringify(updatedPortfolio));
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-10">
        <span
          className="animate-spin mr-2 h-5 w-5 border-4 border-blue-500 border-t-transparent rounded-full" />
        Loading watch-list…
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-600 py-4 text-center">
        {(error as Error).message}
      </p>
    );
  }

  if (!portfolio.length) {
    return <p className="py-4 text-center">Your watch-list is empty.</p>;
  }

  return (
    <div className="overflow-x-auto py-4">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left font-medium text-gray-600">
            #
          </th>
          <th className="px-4 py-2 text-left font-medium text-gray-600">
            Ticker
          </th>
          <th className="px-4 py-2 text-left font-medium text-gray-600">
            Exchange
          </th>
          <th className="px-4 py-2 text-right font-medium text-gray-600">
            Target&nbsp;Price
          </th>
          <th className="px-4 py-2 text-right font-medium text-gray-600">
            Added&nbsp;On
          </th>
          <th className="px-4 py-2 text-right font-medium text-gray-600">
            Updated&nbsp;On
          </th>
          <th className="px-4 py-2 text-center font-medium text-gray-600">
            Actions
          </th>
        </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
        {portfolio.map((item: any, idx: number) => (
          <tr key={item.id}>
            <td className="px-4 py-2 text-gray-500">{idx + 1}</td>
            <td className="px-4 py-2 font-semibold">{item.ticker}</td>
            <td className="px-4 py-2">{item.exchange}</td>
            <td className="px-4 py-2 text-right">
              {item.targetPrice.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </td>
            <td className="px-4 py-2 text-right">
              {new Date(item.createdAt).toLocaleDateString()}
            </td>
            <td className="px-4 py-2 text-right">
              {new Date(item.updatedAt).toLocaleDateString()}
            </td>
            <td className="px-4 py-2 text-center">
              <button
                onClick={() => handleRemoveStock(item.id, item.ticker)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                title={`Remove ${item.ticker} from portfolio`}
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}
