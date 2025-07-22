import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Copy, Download } from "lucide-react";
import { ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from "recharts";
import { CoinData } from "@/data/tradingData";
import { copyToClipboard } from "@/utils/clipboard";
import { toast } from "@/hooks/use-toast";

interface ProfessionalTradingChartProps {
  data: CoinData['ta_4h'] | CoinData['ta_1h'] | CoinData['ta_15m'];
  coinSymbol: string;
  coinName: string;
  n8nData?: any; // n8n merge2 data
}

export const ProfessionalTradingChart = ({ data, coinSymbol, coinName, n8nData }: ProfessionalTradingChartProps) => {
  const [activeChart, setActiveChart] = useState<'price' | 'rsi' | 'macd' | 'volume'>('price');

  // Create professional price chart data with candlestick-like representation
  const priceChartData = [
    { time: '1', price: data.levels.support, type: 'support', volume: 1000000 },
    { time: '2', price: data.trend.sma50, type: 'sma50', volume: 1200000 },
    { time: '3', price: data.trend.sma20, type: 'sma20', volume: 1500000 },
    { time: '4', price: data.trend.ema21, type: 'ema21', volume: 1800000 },
    { time: '5', price: data.advanced.vwap, type: 'vwap', volume: 2000000 },
    { time: '6', price: data.current_price, type: 'current', volume: 2500000 },
    { time: '7', price: data.levels.resistance, type: 'resistance', volume: 1600000 },
  ];

  // RSI chart data with proper levels
  const rsiChartData = [
    { time: '1', rsi: 30, level: 'oversold' },
    { time: '2', rsi: 40, level: 'neutral' },
    { time: '3', rsi: 50, level: 'neutral' },
    { time: '4', rsi: 60, level: 'neutral' },
    { time: '5', rsi: data.momentum.rsi, level: 'current' },
    { time: '6', rsi: 70, level: 'overbought' },
    { time: '7', rsi: 80, level: 'overbought' },
  ];

  // MACD chart data
  const macdChartData = [
    { time: '1', macd: data.momentum.macd.macd - 0.001, signal: data.momentum.macd.signal - 0.0008, histogram: -0.0002 },
    { time: '2', macd: data.momentum.macd.macd - 0.0005, signal: data.momentum.macd.signal - 0.0004, histogram: -0.0001 },
    { time: '3', macd: data.momentum.macd.macd, signal: data.momentum.macd.signal, histogram: data.momentum.macd.histogram },
  ];

  // Fibonacci levels for professional display
  const fibLevels = [
    { level: '0.0%', price: data.levels.fibonacci.level_0, color: '#ef4444', strength: 'strong' },
    { level: '23.6%', price: data.levels.fibonacci.level_236, color: '#f97316', strength: 'medium' },
    { level: '38.2%', price: data.levels.fibonacci.level_382, color: '#eab308', strength: 'medium' },
    { level: '50.0%', price: data.levels.fibonacci.level_500, color: '#22c55e', strength: 'strong' },
    { level: '61.8%', price: data.levels.fibonacci.level_618, color: '#3b82f6', strength: 'strong' },
    { level: '78.6%', price: data.levels.fibonacci.level_786, color: '#8b5cf6', strength: 'medium' },
    { level: '100.0%', price: data.levels.fibonacci.level_1000, color: '#ef4444', strength: 'strong' },
  ];

  const copyAllData = async () => {
    const compiledData = {
      symbol: coinSymbol,
      name: coinName,
      timeframe: data.timeframe,
      timestamp: data.timestamp,
      current_price: data.current_price,
      trend_analysis: data.trend,
      momentum_indicators: data.momentum,
      volatility_metrics: data.volatility,
      advanced_indicators: data.advanced,
      key_levels: data.levels,
      elite_signals: data.elite_analysis,
      n8n_merge2_data: n8nData || null,
      fibonacci_levels: fibLevels,
      trading_recommendation: {
        decision: data.elite_analysis.trading_decision,
        confidence: data.elite_analysis.confidence_level,
        signals: data.elite_analysis.signals,
        confluence_score: data.elite_analysis.confluence_score
      }
    };

    await copyToClipboard(JSON.stringify(compiledData, null, 2), `Complete ${coinSymbol} analysis data`);
  };

  const getSignalColor = (signal: string) => {
    if (signal.includes("BULLISH") || signal.includes("BUY")) return "bg-bullish text-white";
    if (signal.includes("BEARISH") || signal.includes("SELL")) return "bg-bearish text-white";
    return "bg-info text-white";
  };

  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return "text-bearish font-bold";
    if (rsi < 30) return "text-bullish font-bold";
    return "text-warning font-bold";
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${typeof entry.value === 'number' ? entry.value.toFixed(6) : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (activeChart) {
      case 'price':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={priceChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `$${value.toFixed(6)}`} />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Support and Resistance Lines */}
              <ReferenceLine y={data.levels.support} stroke="#22c55e" strokeDasharray="5 5" strokeWidth={2} />
              <ReferenceLine y={data.levels.resistance} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} />
              
              {/* Fibonacci Levels */}
              {fibLevels.map((fib, index) => (
                <ReferenceLine 
                  key={index} 
                  y={fib.price} 
                  stroke={fib.color} 
                  strokeWidth={fib.strength === 'strong' ? 2 : 1}
                  strokeOpacity={0.6}
                />
              ))}
              
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                fill="hsl(var(--primary))"
                fillOpacity={0.1}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'rsi':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={rsiChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
              <Tooltip content={<CustomTooltip />} />
              
              {/* RSI Levels */}
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} />
              <ReferenceLine y={50} stroke="#64748b" strokeDasharray="2 2" strokeWidth={1} />
              <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="5 5" strokeWidth={2} />
              
              {/* Overbought/Oversold Areas */}
              <ReferenceArea y1={70} y2={100} fill="#ef4444" fillOpacity={0.1} />
              <ReferenceArea y1={0} y2={30} fill="#22c55e" fillOpacity={0.1} />
              
              <Line 
                type="monotone" 
                dataKey="rsi" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'macd':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={macdChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip content={<CustomTooltip />} />
              
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
              
              <Bar dataKey="histogram" fill="hsl(var(--info))" opacity={0.6} />
              <Line 
                type="monotone" 
                dataKey="macd" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="signal" 
                stroke="hsl(var(--warning))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'volume':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={priceChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip content={<CustomTooltip />} />
              
              <Bar 
                dataKey="volume" 
                fill="hsl(var(--info))" 
                opacity={0.7}
                radius={[2, 2, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
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

      {/* Professional Fibonacci Display */}
      <Card className="bg-gradient-card">
        <CardHeader className="pb-3">
          <CardTitle>Fibonacci Retracement Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {fibLevels.map((fib, index) => (
              <div 
                key={index} 
                className="p-3 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition-colors"
                style={{ borderLeftColor: fib.color, borderLeftWidth: '4px' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{fib.level}</div>
                    <div className="text-xs text-muted-foreground">{fib.strength}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">${fib.price.toFixed(6)}</div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 mt-1"
                      onClick={() => copyToClipboard(fib.price.toString(), `Fibonacci ${fib.level} level`)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* N8N Integration Display */}
      {n8nData && (
        <Card className="bg-gradient-card border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              N8N Merge2 Integration Data
              <Badge variant="outline" className="bg-primary/10">
                Live Data
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted/50 p-4 rounded-lg overflow-auto max-h-32">
              {JSON.stringify(n8nData, null, 2)}
            </pre>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 gap-2"
              onClick={() => copyToClipboard(JSON.stringify(n8nData, null, 2), "N8N merge2 data")}
            >
              <Copy className="h-4 w-4" />
              Copy N8N Data
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Elite Signals Grid */}
      <Card className="bg-gradient-card">
        <CardHeader className="pb-3">
          <CardTitle>Elite Analysis Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
            {data.elite_analysis.signals.map((signal, index) => (
              <Badge key={index} className={getSignalColor(signal)} variant="outline">
                {signal.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
          <div className="p-4 bg-secondary/20 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Direction:</span>
                <span className="ml-2 font-semibold">{data.elite_analysis.signal_direction}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Confluence:</span>
                <span className="ml-2 font-semibold">{data.elite_analysis.confluence_score}/5</span>
              </div>
              <div>
                <span className="text-muted-foreground">Strength:</span>
                <span className="ml-2 font-semibold">{data.elite_analysis.signal_strength}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};