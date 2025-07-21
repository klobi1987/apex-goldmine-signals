import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CopyButton } from "@/components/CopyButton";
import { TradeSimulator } from "@/components/TradeSimulator";
import { TechnicalAnalysisChart } from "@/components/TechnicalAnalysisChart";
import { tradingData } from "@/data/tradingData";
import { formatPrice, formatPercentage, formatVolume, getBybitUrl, copyToClipboard } from "@/utils/clipboard";

const CoinDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [showTradeSimulator, setShowTradeSimulator] = useState(false);

  const coin = useMemo(() => 
    tradingData.find(c => c.symbol === symbol), [symbol]);

  if (!coin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Coin not found</h1>
          <Button asChild>
            <Link to="/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleCopyAllData = () => {
    const jsonData = JSON.stringify(coin, null, 2);
    copyToClipboard(jsonData, "Complete trading data copied");
  };

  const getBiasColor = (bias: string) => {
    return bias === "LONG" ? "bg-bullish text-white" : "bg-bearish text-white";
  };

  const getSignalColor = (signal: string) => {
    if (signal.includes("BUY")) return "text-bullish";
    if (signal.includes("SELL")) return "text-bearish";
    return "text-info";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{coin.symbol} Trading Analysis</h1>
                <p className="text-muted-foreground">{coin.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopyAllData} variant="outline">
                Copy All Data
              </Button>
              <Dialog open={showTradeSimulator} onOpenChange={setShowTradeSimulator}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary">
                    <Calculator className="h-4 w-4 mr-2" />
                    Simulate Trade
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Trade Simulator - {coin.symbol}</DialogTitle>
                  </DialogHeader>
                  <TradeSimulator coin={coin} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Trading Essentials */}
          <Accordion type="single" collapsible defaultValue="essentials">
            <AccordionItem value="essentials">
              <AccordionTrigger className="text-xl font-semibold">
                Trading Essentials
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-gradient-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        ByBit Symbol
                        <div className="flex gap-2">
                          <CopyButton text={coin.bybit_symbol} />
                          <Button size="sm" variant="outline" asChild>
                            <a href={getBybitUrl(coin.bybit_symbol)} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-mono font-bold text-primary">{coin.bybit_symbol}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-card">
                    <CardHeader>
                      <CardTitle>Current Price</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold">${formatPrice(coin.lastPrice)}</p>
                        <CopyButton text={coin.lastPrice} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">24h Change</span>
                        <span className={parseFloat(coin.price24hPcnt) > 0 ? 'text-bullish' : 'text-bearish'}>
                          {formatPercentage(parseFloat(coin.price24hPcnt))}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-card">
                    <CardHeader>
                      <CardTitle>Trade Signals</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Trade Bias</span>
                        <Badge className={getBiasColor(coin.trade_bias)}>
                          {coin.trade_bias}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Urgency</span>
                        <Badge variant={coin.urgency_level === "EXTREME" ? "destructive" : "default"}>
                          {coin.urgency_level}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Apex Score</span>
                        <span className="font-bold text-primary">{coin.apex_score}/300</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Risk Grade</span>
                        <Badge variant="outline">{coin.risk_grade}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Market Overview */}
          <Accordion type="single" collapsible>
            <AccordionItem value="market">
              <AccordionTrigger className="text-xl font-semibold">
                Market Overview
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gradient-card">
                    <CardContent className="p-4 space-y-2">
                      <p className="text-sm font-medium">Volume 24h</p>
                      <p className="text-lg font-bold">{formatVolume(coin.volume_24h)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-card">
                    <CardContent className="p-4 space-y-2">
                      <p className="text-sm font-medium">Market Cap</p>
                      <p className="text-lg font-bold">{formatVolume(coin.market_cap)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-card">
                    <CardContent className="p-4 space-y-2">
                      <p className="text-sm font-medium">Galaxy Score</p>
                      <p className="text-lg font-bold text-info">{coin.galaxy_score}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-card">
                    <CardContent className="p-4 space-y-2">
                      <p className="text-sm font-medium">Sentiment</p>
                      <p className="text-lg font-bold text-bullish">{coin.sentiment}%</p>
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Technical Analysis */}
          <Accordion type="single" collapsible>
            <AccordionItem value="technical">
              <AccordionTrigger className="text-xl font-semibold">
                Technical Analysis
              </AccordionTrigger>
              <AccordionContent>
                <Tabs defaultValue="4h" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="4h">4H Timeframe</TabsTrigger>
                    <TabsTrigger value="1h">1H Timeframe</TabsTrigger>
                    <TabsTrigger value="15m">15M Timeframe</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="4h" className="space-y-4">
                    <TechnicalAnalysisChart data={coin.ta_4h} />
                  </TabsContent>
                  
                  <TabsContent value="1h" className="space-y-4">
                    <TechnicalAnalysisChart data={coin.ta_1h} />
                  </TabsContent>
                  
                  <TabsContent value="15m" className="space-y-4">
                    <TechnicalAnalysisChart data={coin.ta_15m} />
                  </TabsContent>
                </Tabs>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Order Book & Contract */}
          <Accordion type="single" collapsible>
            <AccordionItem value="orderbook">
              <AccordionTrigger className="text-xl font-semibold">
                Order Book & Contract Details
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-card">
                    <CardHeader>
                      <CardTitle>Order Book</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Bid Price</span>
                        <span className="font-mono text-bullish">{formatPrice(coin.order_book_bid_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ask Price</span>
                        <span className="font-mono text-bearish">{formatPrice(coin.order_book_ask_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Spread</span>
                        <span>{coin.order_book_spread_pct.toFixed(4)}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-card">
                    <CardHeader>
                      <CardTitle>Contract Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Max Leverage</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-warning">{coin.maxLeverage}x</span>
                          <CopyButton text={coin.maxLeverage.toString()} variant="sm" />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Order</span>
                        <span>{coin.minOrderQty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tick Size</span>
                        <span>{coin.tickSize}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default CoinDetail;