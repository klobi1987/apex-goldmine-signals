import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoinData } from "@/data/tradingData";
import { formatPrice } from "@/utils/clipboard";

interface TradeSimulatorProps {
  coin: CoinData;
}

export const TradeSimulator = ({ coin }: TradeSimulatorProps) => {
  const [entryPrice, setEntryPrice] = useState(coin.lastPrice);
  const [leverage, setLeverage] = useState(1);
  const [position, setPosition] = useState(100); // USDT

  // Auto-populate TP/SL from technical analysis
  const suggestedTP = coin.ta_1h.levels.resistance;
  const suggestedSL = coin.ta_1h.levels.support;

  const [takeProfit, setTakeProfit] = useState(suggestedTP.toString());
  const [stopLoss, setStopLoss] = useState(suggestedSL.toString());

  const calculatePnL = () => {
    const entry = parseFloat(entryPrice);
    const tp = parseFloat(takeProfit);
    const sl = parseFloat(stopLoss);
    const positionSize = position * leverage;
    const quantity = positionSize / entry;

    const isLong = coin.trade_bias === "LONG";
    
    const profitPnL = isLong 
      ? ((tp - entry) / entry) * positionSize
      : ((entry - tp) / entry) * positionSize;
    
    const lossPnL = isLong
      ? ((sl - entry) / entry) * positionSize
      : ((entry - sl) / entry) * positionSize;

    const riskReward = Math.abs(profitPnL / lossPnL);

    return {
      profitPnL: profitPnL.toFixed(2),
      lossPnL: lossPnL.toFixed(2),
      riskReward: riskReward.toFixed(2),
      quantity: quantity.toFixed(0),
      positionSize: positionSize.toFixed(2)
    };
  };

  const results = calculatePnL();

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="entryPrice">Entry Price ($)</Label>
            <Input
              id="entryPrice"
              type="number"
              step="0.00001"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="leverage">Leverage (max {coin.maxLeverage}x)</Label>
            <Input
              id="leverage"
              type="number"
              min="1"
              max={coin.maxLeverage}
              value={leverage}
              onChange={(e) => setLeverage(Math.min(parseInt(e.target.value) || 1, coin.maxLeverage))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="position">Position Size (USDT)</Label>
          <Input
            id="position"
            type="number"
            min="5"
            value={position}
            onChange={(e) => setPosition(parseInt(e.target.value) || 100)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="takeProfit">Take Profit ($)</Label>
            <Input
              id="takeProfit"
              type="number"
              step="0.00001"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder={`Suggested: ${formatPrice(suggestedTP)}`}
            />
          </div>
          <div>
            <Label htmlFor="stopLoss">Stop Loss ($)</Label>
            <Input
              id="stopLoss"
              type="number"
              step="0.00001"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder={`Suggested: ${formatPrice(suggestedSL)}`}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Trading Simulation Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Position Size</p>
              <p className="font-bold">{results.positionSize} USDT</p>
            </div>
            <div>
              <p className="text-muted-foreground">Quantity</p>
              <p className="font-bold">{results.quantity} {coin.symbol}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-bullish/10 rounded-lg">
              <p className="text-muted-foreground">Potential Profit</p>
              <p className="font-bold text-bullish">+${results.profitPnL}</p>
            </div>
            <div className="p-3 bg-bearish/10 rounded-lg">
              <p className="text-muted-foreground">Potential Loss</p>
              <p className="font-bold text-bearish">{results.lossPnL}</p>
            </div>
          </div>

          <div className="p-3 bg-info/10 rounded-lg">
            <p className="text-muted-foreground">Risk:Reward Ratio</p>
            <p className="font-bold text-info">1:{results.riskReward}</p>
          </div>

          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              * This is a simulation based on suggested TP/SL levels from technical analysis. 
              Actual trading results may vary significantly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};