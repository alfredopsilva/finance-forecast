import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function AddStockForm() {
  const [ticker, setTicker] = useState("");
  const [exchange, setExchange] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const queryClient = useQueryClient();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticker.trim() || !exchange.trim() || !targetPrice.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid target price");
      return;
    }

    // Get existing portfolio from localStorage
    const existingPortfolio = JSON.parse(localStorage.getItem("portfolio") || "[]");

    // Create new stock entry
    const newStock = {
      id: Date.now(), // Simple ID generation for POC
      ticker: ticker.trim().toUpperCase(),
      exchange: exchange.trim(),
      targetPrice: price,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to portfolio
    const updatedPortfolio = [...existingPortfolio, newStock];
    localStorage.setItem("portfolio", JSON.stringify(updatedPortfolio));

    queryClient.invalidateQueries({queryKey: ["portfolio"]});
    // Reset form
    setTicker("");
    setExchange("");
    setTargetPrice("");

    // Show success message
    alert(`Added ${newStock.ticker} to your portfolio!`);
  };

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Add Stock to Portfolio</h2>

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-0">
          <label htmlFor="ticker" className="block text-sm font-medium text-gray-700 mb-1">
            Ticker Symbol
          </label>
          <input
            type="text"
            id="ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="e.g., AAPL"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 min-w-0">
          <label htmlFor="exchange" className="block text-sm font-medium text-gray-700 mb-1">
            Exchange
          </label>
          <input
            type="text"
            id="exchange"
            value={exchange}
            onChange={(e) => setExchange(e.target.value)}
            placeholder="e.g., NASDAQ"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 min-w-0">
          <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Target Price ($)
          </label>
          <input
            type="number"
            id="targetPrice"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="e.g., 150.00"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-shrink-0">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors whitespace-nowrap"
          >
            Add to Portfolio
          </button>
        </div>
      </form>
    </div>
  );
}
