import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { TradingCard } from "@/components/TradingCard";
import { tradingData } from "@/data/tradingData";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [prices, setPrices] = useState(tradingData.map(coin => parseFloat(coin.lastPrice)));

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prevPrices => 
        prevPrices.map((price, index) => {
          const volatility = tradingData[index].volatility;
          const change = (Math.random() - 0.5) * volatility * price * 0.01;
          return Math.max(0, price + change);
        })
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Filter coins based on search query
  const filteredCoins = tradingData.filter(coin => 
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.bybit_symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update coins with simulated prices
  const coinsWithUpdatedPrices = filteredCoins.map((coin, index) => ({
    ...coin,
    lastPrice: prices[tradingData.findIndex(c => c.symbol === coin.symbol)]?.toFixed(8) || coin.lastPrice
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {coinsWithUpdatedPrices.map((coin, index) => (
            <TradingCard key={coin.symbol} coin={coin} index={index} />
          ))}
        </motion.div>

        {filteredCoins.length === 0 && searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground text-lg">
              No coins found matching "{searchQuery}"
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Index;
