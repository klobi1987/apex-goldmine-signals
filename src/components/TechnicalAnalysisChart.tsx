import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { CoinData } from "@/data/tradingData";

interface TechnicalAnalysisChartProps {
  data: CoinData['ta_4h'] | CoinData['ta_1h'] | CoinData['ta_15m'];
}

export const TechnicalAnalysisChart = ({ data }: TechnicalAnalysisChartProps) => {
  // Mock chart data based on technical analysis
  const chartData = [
    { name: 'SMA20', value: data.trend.sma20 },
    { name: 'SMA50', value: data.trend.sma50 },
    { name: 'EMA21', value: data.trend.ema21 },
    { name: 'Current', value: data.current_price },
    { name: 'VWAP', value: data.advanced.vwap },
  ];

  const rsiData = [
    { name: 'RSI', value: data.momentum.rsi },
    { name: 'Neutral', value: 50 },
    { name: 'Overbought', value: 70 },
    { name: 'Oversold', value: 30 },
  ];

  const fibLevels = [
    { level: '0%', price: data.levels.fibonacci.level_0, color: '#ef4444' },
    { level: '23.6%', price: data.levels.fibonacci.level_236, color: '#f97316' },
    { level: '38.2%', price: data.levels.fibonacci.level_382, color: '#eab308' },
    { level: '50%', price: data.levels.fibonacci.level_500, color: '#22c55e' },
    { level: '61.8%', price: data.levels.fibonacci.level_618, color: '#3b82f6' },
    { level: '78.6%', price: data.levels.fibonacci.level_786, color: '#8b5cf6' },
    { level: '100%', price: data.levels.fibonacci.level_1000, color: '#ef4444' },
  ];

  const getSignalColor = (signal: string) => {
    if (signal.includes("BULLISH") || signal.includes("BUY")) return "bg-bullish text-white";
    if (signal.includes("BEARISH") || signal.includes("SELL")) return "bg-bearish text-white";
    return "bg-info text-white";
  };

  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return "text-bearish";
    if (rsi < 30) return "text-bullish";
    return "text-warning";
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Direction</span>
              <Badge variant={data.trend.direction === "UP" ? "default" : "secondary"}>
                {data.trend.direction}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Strength</span>
              <Badge variant="outline">{data.trend.strength}</Badge>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Current vs SMA20</span>
              <Progress 
                value={((data.current_price - data.trend.sma20) / data.trend.sma20) * 100 + 50} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Momentum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">RSI</span>
              <span className={`font-bold ${getRSIColor(data.momentum.rsi)}`}>
                {data.momentum.rsi.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">MACD</span>
              <Badge variant={data.momentum.macd.state === "BULLISH" ? "default" : "secondary"}>
                {data.momentum.macd.state}
              </Badge>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">RSI Level</span>
              <Progress value={data.momentum.rsi} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Elite Signals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Decision</span>
              <Badge className={getSignalColor(data.elite_analysis.trading_decision)}>
                {data.elite_analysis.trading_decision}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Confidence</span>
              <span className="font-bold text-primary">{data.elite_analysis.confidence_level}</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Signal Strength</span>
              <Progress value={data.elite_analysis.signal_strength * 20} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle>Price Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${value.toFixed(6)}`} />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(6)}`, 'Price']}
                  labelStyle={{ color: '#000' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle>RSI Indicator</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={rsiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: number) => [value.toFixed(2), 'Value']}
                  labelStyle={{ color: '#000' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--info))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Fibonacci Levels */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>Fibonacci Retracement Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {fibLevels.map((fib, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: `${fib.color}15` }}>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fib.color }}></div>
                  <span className="font-medium">{fib.level}</span>
                </div>
                <span className="font-mono text-sm">${fib.price.toFixed(6)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Elite Analysis Signals */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>Elite Analysis Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {data.elite_analysis.signals.map((signal, index) => (
              <Badge key={index} className={getSignalColor(signal)} variant="outline">
                {signal.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
          <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Signal Direction:</span>
                <span className="ml-2 font-semibold">{data.elite_analysis.signal_direction}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Confluence Score:</span>
                <span className="ml-2 font-semibold">{data.elite_analysis.confluence_score}/5</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support & Resistance */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>Key Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-bullish">Support Levels</h4>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-bullish/10 rounded">
                  <span>Primary Support</span>
                  <span className="font-mono">${data.levels.support.toFixed(6)}</span>
                </div>
                <div className="flex justify-between p-2 bg-bullish/5 rounded">
                  <span>Fibonacci 61.8%</span>
                  <span className="font-mono">${data.levels.fibonacci.level_618.toFixed(6)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-bearish">Resistance Levels</h4>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-bearish/10 rounded">
                  <span>Primary Resistance</span>
                  <span className="font-mono">${data.levels.resistance.toFixed(6)}</span>
                </div>
                <div className="flex justify-between p-2 bg-bearish/5 rounded">
                  <span>Fibonacci 23.6%</span>
                  <span className="font-mono">${data.levels.fibonacci.level_236.toFixed(6)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};