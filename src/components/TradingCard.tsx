import { motion } from "framer-motion";
import { ExternalLink, TrendingUp, TrendingDown, Clock, Activity, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CopyButton } from "./CopyButton";
import { formatPrice, formatPercentage, getBybitUrl } from "@/utils/clipboard";
import { CoinData } from "@/data/tradingData";
import { Link } from "react-router-dom";

interface TradingCardProps {
  coin: CoinData;
  index: number;
}

export const TradingCard = ({ coin, index }: TradingCardProps) => {
  const priceChange24h = parseFloat(coin.price24hPcnt);
  const isPositive = priceChange24h > 0;
  
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "EXTREME": return "bg-bearish text-white";
      case "HIGH": return "bg-warning text-black";
      default: return "bg-info text-white";
    }
  };

  const getBiasColor = (bias: string) => {
    return bias === "LONG" ? "bg-bullish text-white" : "bg-bearish text-white";
  };

  const getConfidenceStars = (level: string) => {
    const levels = { "GODLIKE": 5, "MAXIMUM": 4, "VERY_HIGH": 4, "HIGH": 3 };
    return levels[level as keyof typeof levels] || 3;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="bg-gradient-card border-border shadow-card h-full hover:shadow-glow transition-all duration-300">
        <CardContent className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-foreground">{coin.symbol}</h3>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {coin.name}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {coin.bybit_symbol}
                </Badge>
                <CopyButton 
                  text={coin.bybit_symbol} 
                  description={`ByBit symbol ${coin.bybit_symbol} copied`}
                  variant="sm"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  asChild
                  className="h-6 w-6 p-0"
                >
                  <a 
                    href={getBybitUrl(coin.bybit_symbol)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Price Section */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  ${formatPrice(coin.lastPrice)}
                </p>
                <div className="flex items-center gap-1">
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 text-bullish" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-bearish" />
                  )}
                  <span className={`text-sm font-semibold ${isPositive ? 'text-bullish' : 'text-bearish'}`}>
                    {formatPercentage(priceChange24h)} (24h)
                  </span>
                </div>
              </div>
              <CopyButton 
                text={coin.lastPrice} 
                description={`Price ${coin.lastPrice} copied`}
                variant="outline"
              />
            </div>
          </div>

          {/* Trading Signals */}
          <div className="space-y-3 mb-4 flex-1">
            <div className="flex gap-2">
              <Badge className={getBiasColor(coin.trade_bias)}>
                {coin.trade_bias}
              </Badge>
              <Badge className={getUrgencyColor(coin.urgency_level)}>
                {coin.urgency_level}
              </Badge>
            </div>

            {/* Apex Score */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Apex Score</span>
                <span className="font-bold text-primary">{coin.apex_score}</span>
              </div>
              <Progress value={(coin.apex_score / 300) * 100} className="h-2" />
            </div>

            {/* Confidence Level */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Confidence</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < getConfidenceStars(coin.confidence_analysis.level)
                        ? 'bg-warning'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Timeframe Quick Access */}
          <div className="space-y-2 mb-4">
            <p className="text-xs font-medium text-muted-foreground">Quick Timeframe Access:</p>
            <div className="flex gap-1">
              {[
                { tf: "4h", icon: Clock, label: "4H", desc: "Swing" },
                { tf: "1h", icon: Activity, label: "1H", desc: "Day" },
                { tf: "15m", icon: Zap, label: "15M", desc: "Scalp" }
              ].map((timeframe) => (
                <Button
                  key={timeframe.tf}
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs"
                >
                  <Link to={`/coin/${coin.symbol}?timeframe=${timeframe.tf}`}>
                    <timeframe.icon className="h-3 w-3 mr-1" />
                    {timeframe.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <Button asChild className="w-full bg-gradient-primary hover:shadow-glow">
            <Link to={`/coin/${coin.symbol}?timeframe=15m`}>
              View Trading Details
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};