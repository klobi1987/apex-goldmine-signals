import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Copy } from "lucide-react";
import { ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from "recharts";
import { CoinData } from "@/data/tradingData";
import { copyToClipboard } from "@/utils/clipboard";

interface ProfessionalTradingChartProps {
  data: CoinData['ta_4h'] | CoinData['ta_1h'] | CoinData['ta_15m'];
  coinSymbol: string;
  coinName: string;
  n8nData?: any;
}

export const ProfessionalTradingChart = ({ data, coinSymbol, coinName, n8nData }: ProfessionalTradingChartProps) => {
  const [activeChart, setActiveChart] = useState<'price' | 'rsi' | 'macd' | 'volume'>('price');

  const priceChartData = [
    { time: '1', price: data.levels.support, volume: 1000000 },
    { time: '2', price: data.trend.sma50, volume: 1200000 },
    { time: '3', price: data.current_price, volume: 2500000 },
    { time: '4', price: data.levels.resistance, volume: 1600000 },
  ];

  const rsiChartData = [
    { time: '1', rsi: 30 },
    { time: '2', rsi: 50 },
    { time: '3', rsi: data.momentum.rsi },
    { time: '4', rsi: 70 },
  ];

  const macdChartData = [
    { time: '1', macd: data.momentum.macd.macd - 0.001, signal: data.momentum.macd.signal - 0.0008, histogram: -0.0002 },
    { time: '2', macd: data.momentum.macd.macd, signal: data.momentum.macd.signal, histogram: data.momentum.macd.histogram },
  ];

  const fibLevels = [
    { level: '23.6%', price: data.levels.fibonacci.level_236, color: '#f97316' },
    { level: '38.2%', price: data.levels.fibonacci.level_382, color: '#eab308' },
    { level: '50.0%', price: data.levels.fibonacci.level_500, color: '#22c55e' },
    { level: '61.8%', price: data.levels.fibonacci.level_618, color: '#3b82f6' },
  ];

  const copyAllData = async () => {
    const compiledData = {
      symbol: coinSymbol,
      timeframe: data.timeframe,
      price: data.current_price,
      trend: data.trend,
      momentum: data.momentum,
      levels: data.levels,
      signals: data.elite_analysis,
      n8n_data: n8nData
    };
    await copyToClipboard(JSON.stringify(compiledData, null, 2), `${coinSymbol} analysis`);
  };

  const getSignalColor = (signal: string) => 
    signal.includes("BUY") ? "bg-bullish text-white" : 
    signal.includes("SELL") ? "bg-bearish text-white" : "bg-info text-white";

  const getRSIColor = (rsi: number) => 
    rsi > 70 ? "text-bearish font-bold" : 
    rsi < 30 ? "text-bullish font-bold" : "text-warning font-bold";

  const renderChart = () => {
    const commonProps = {
      width: "100%",
      height: 300,
      data: activeChart === 'rsi' ? rsiChartData : activeChart === 'macd' ? macdChartData : priceChartData
    };

    return (
      <ResponsiveContainer {...commonProps}>
        <ComposedChart data={commonProps.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          
          {activeChart === 'price' && (
            <>
              <ReferenceLine y={data.levels.support} stroke="#22c55e" strokeDasharray="5 5" />
              <ReferenceLine y={data.levels.resistance} stroke="#ef4444" strokeDasharray="5 5" />
              {fibLevels.map((fib, i) => (
                <ReferenceLine key={i} y={fib.price} stroke={fib.color} strokeOpacity={0.6} />
              ))}
              <Area dataKey="price" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} />
            </>
          )}
          
          {activeChart === 'rsi' && (
            <>
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" />
              <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="5 5" />
              <ReferenceArea y1={70} y2={100} fill="#ef4444" fillOpacity={0.1} />
              <ReferenceArea y1={0} y2={30} fill="#22c55e" fillOpacity={0.1} />
              <Line dataKey="rsi" stroke="hsl(var(--primary))" strokeWidth={2} />
            </>
          )}
          
          {activeChart === 'macd' && (
            <>
              <Bar dataKey="histogram" fill="hsl(var(--info))" opacity={0.6} />
              <Line dataKey="macd" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line dataKey="signal" stroke="hsl(var(--warning))" strokeDasharray="5 5" dot={false} />
            </>
          )}
          
          {activeChart === 'volume' && (
            <Bar dataKey="volume" fill="hsl(var(--info))" opacity={0.7} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Copy All Data Button */}
      <Card className="bg-gradient-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{coinName} ({coinSymbol})</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {data.timeframe} • Professional Analysis • {new Date(data.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={copyAllData} variant="outline" size="sm" className="gap-2">
                <Copy className="h-4 w-4" />
                Copy All Data
              </Button>
              {n8nData && (
                <Badge variant="outline" className="bg-primary/10">
                  N8N Connected
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Professional Chart Controls */}
      <Card className="bg-gradient-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Professional Trading Analysis</CardTitle>
            <div className="flex gap-2">
              {(['price', 'rsi', 'macd', 'volume'] as const).map((chartType) => (
                <Button
                  key={chartType}
                  variant={activeChart === chartType ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveChart(chartType)}
                  className="capitalize"
                >
                  {chartType === 'macd' ? 'MACD' : chartType}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Current Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${data.current_price.toFixed(6)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getSignalColor(data.elite_analysis.trading_decision)}>
                {data.elite_analysis.trading_decision}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {data.elite_analysis.confidence_level}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">RSI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRSIColor(data.momentum.rsi)}`}>
              {data.momentum.rsi.toFixed(2)}
            </div>
            <div className="mt-2">
              <Progress value={data.momentum.rsi} className="h-2" />
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {data.momentum.rsi_condition}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {data.trend.direction}
            </div>
            <Badge variant={data.trend.direction === "UP" ? "default" : "secondary"} className="mt-2">
              {data.trend.strength}
            </Badge>
            <div className="text-sm text-muted-foreground mt-1">
              {data.advanced.market_structure.structure}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Confluence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {data.elite_analysis.confluence_score}/5
            </div>
            <div className="mt-2">
              <Progress value={data.elite_analysis.confluence_score * 20} className="h-2" />
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Signal Strength: {data.elite_analysis.signal_strength}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fibonacci & N8N Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card">
          <CardHeader className="pb-3">
            <CardTitle>Fibonacci Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {fibLevels.map((fib, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded border-l-4" style={{ borderLeftColor: fib.color }}>
                  <span className="text-sm">{fib.level}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">${fib.price.toFixed(6)}</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(fib.price.toString())}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {n8nData && (
          <Card className="bg-gradient-card">
            <CardHeader className="pb-3">
              <CardTitle>N8N Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted/50 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(n8nData, null, 2)}
              </pre>
              <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => copyToClipboard(JSON.stringify(n8nData, null, 2))}>
                <Copy className="h-4 w-4 mr-2" />Copy Data
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Signals */}
      <Card className="bg-gradient-card">
        <CardHeader className="pb-3">
          <CardTitle>Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.elite_analysis.signals.slice(0, 6).map((signal, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded border">
                <Badge className={getSignalColor(signal)}>{signal.replace(/_/g, ' ')}</Badge>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(signal)}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};