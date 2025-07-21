import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Calculator, Clock, Activity, Zap, TrendingUp } from "lucide-react";
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

type TimeframeType = "4h" | "1h" | "15m";

const CoinDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showTradeSimulator, setShowTradeSimulator] = useState(false);
  
  // Get timeframe from URL params, default to 15m for scalping focus
  const activeTimeframe = (searchParams.get("timeframe") as TimeframeType) || "15m";

  const coin = useMemo(() => 
    tradingData.find(c => c.symbol === symbol), [symbol]);

  // Update URL when timeframe changes
  const handleTimeframeChange = (timeframe: TimeframeType) => {
    setSearchParams({ timeframe });
  };

  // Cross-timeframe confluence analysis
  const confluenceAnalysis = useMemo(() => {
    if (!coin) return null;
    
    const timeframes = [
      { key: "ta_4h", name: "4H", data: coin.ta_4h },
      { key: "ta_1h", name: "1H", data: coin.ta_1h },
      { key: "ta_15m", name: "15M", data: coin.ta_15m }
    ];
    
    const signals = timeframes.map(tf => tf.data.elite_analysis.trading_decision);
    const strongBuyCount = signals.filter(s => s === "STRONG_BUY").length;
    const buyCount = signals.filter(s => s.includes("BUY")).length;
    const sellCount = signals.filter(s => s.includes("SELL")).length;
    
    let confluenceLevel = "NEUTRAL";
    let confluenceColor = "text-muted-foreground";
    
    if (strongBuyCount >= 2) {
      confluenceLevel = "STRONG BULLISH CONFLUENCE";
      confluenceColor = "text-bullish";
    } else if (buyCount === 3) {
      confluenceLevel = "BULLISH CONFLUENCE";
      confluenceColor = "text-bullish";
    } else if (sellCount >= 2) {
      confluenceLevel = "BEARISH CONFLUENCE";
      confluenceColor = "text-bearish";
    } else if (buyCount >= 2) {
      confluenceLevel = "WEAK BULLISH";
      confluenceColor = "text-info";
    }
    
    return { level: confluenceLevel, color: confluenceColor, signals: timeframes };
  }, [coin]);

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

          {/* Cross-Timeframe Confluence Banner */}
          {confluenceAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="bg-gradient-card border-2 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold">Multi-Timeframe Analysis</h3>
                        <p className={`text-sm ${confluenceAnalysis.color}`}>
                          {confluenceAnalysis.level}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {confluenceAnalysis.signals.map((tf) => (
                        <Badge
                          key={tf.key}
                          variant={tf.data.elite_analysis.trading_decision.includes("BUY") ? "default" : "outline"}
                          className="text-xs"
                        >
                          {tf.name}: {tf.data.elite_analysis.trading_decision}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Technical Analysis with Enhanced Timeframe Navigation */}
          <Accordion type="single" collapsible defaultValue="technical">
            <AccordionItem value="technical">
              <AccordionTrigger className="text-xl font-semibold">
                Technical Analysis - Multi-Timeframe
              </AccordionTrigger>
              <AccordionContent>
                {/* Enhanced Timeframe Selector */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Select Timeframe</h3>
                    <div className="flex gap-2">
                      {[
                        { value: "4h", label: "4H", icon: Clock, desc: "Swing Trading" },
                        { value: "1h", label: "1H", icon: Activity, desc: "Day Trading" },
                        { value: "15m", label: "15M", icon: Zap, desc: "Scalping" }
                      ].map((tf) => (
                        <Button
                          key={tf.value}
                          variant={activeTimeframe === tf.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleTimeframeChange(tf.value as TimeframeType)}
                          className="flex items-center gap-2"
                        >
                          <tf.icon className="h-4 w-4" />
                          {tf.label}
                          <span className="text-xs opacity-70">({tf.desc})</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <Tabs value={activeTimeframe} onValueChange={(value) => handleTimeframeChange(value as TimeframeType)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-12">
                    <TabsTrigger value="4h" className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      4H Swing
                    </TabsTrigger>
                    <TabsTrigger value="1h" className="flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4" />
                      1H Day
                    </TabsTrigger>
                    <TabsTrigger value="15m" className="flex items-center gap-2 text-sm bg-primary/10">
                      <Zap className="h-4 w-4" />
                      15M Scalp
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="mt-6">
                    <TabsContent value="4h" className="space-y-4 mt-0">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold">4H Timeframe - Swing Trading</h4>
                        <CopyButton 
                          text={JSON.stringify(coin.ta_4h, null, 2)} 
                          description="4H timeframe data copied"
                          variant="outline"
                        />
                      </div>
                      <TechnicalAnalysisChart data={coin.ta_4h} />
                    </TabsContent>
                    
                    <TabsContent value="1h" className="space-y-4 mt-0">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold">1H Timeframe - Day Trading</h4>
                        <CopyButton 
                          text={JSON.stringify(coin.ta_1h, null, 2)} 
                          description="1H timeframe data copied"
                          variant="outline"
                        />
                      </div>
                      <TechnicalAnalysisChart data={coin.ta_1h} />
                    </TabsContent>
                    
                    <TabsContent value="15m" className="space-y-4 mt-0">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold">15M Timeframe - Scalping Focus</h4>
                        <CopyButton 
                          text={JSON.stringify(coin.ta_15m, null, 2)} 
                          description="15M timeframe data copied"
                          variant="outline"
                        />
                      </div>
                      <TechnicalAnalysisChart data={coin.ta_15m} />
                    </TabsContent>
                  </div>
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