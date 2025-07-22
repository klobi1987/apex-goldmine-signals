import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Zap, Copy, Eye, EyeOff } from "lucide-react";
import { useN8nIntegration } from "@/hooks/useN8nIntegration";
import { copyToClipboard } from "@/utils/clipboard";

interface N8nIntegrationPanelProps {
  coinSymbol?: string;
  timeframe?: string;
  onMerge2Data?: (data: any) => void;
}

export const N8nIntegrationPanel = ({ coinSymbol, timeframe, onMerge2Data }: N8nIntegrationPanelProps) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempWebhookUrl, setTempWebhookUrl] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  
  const { 
    config, 
    updateConfig, 
    isConnected, 
    merge2Data, 
    isLoading, 
    fetchMerge2Data, 
    testConnection 
  } = useN8nIntegration();

  const handleSaveConfig = () => {
    updateConfig({
      webhookUrl: tempWebhookUrl || config.webhookUrl,
      apiKey: tempApiKey || config.apiKey,
      enabled: config.enabled,
    });
    setTempWebhookUrl('');
    setTempApiKey('');
  };

  const handleFetchMerge2Data = async () => {
    const data = await fetchMerge2Data(coinSymbol, timeframe);
    if (data && onMerge2Data) {
      onMerge2Data(data);
    }
  };

  return (
    <Card className="bg-gradient-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            N8N Integration
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <Switch
              checked={config.enabled}
              onCheckedChange={(enabled) => updateConfig({ enabled })}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                placeholder={config.webhookUrl || "N8N webhook URL"}
                value={tempWebhookUrl}
                onChange={(e) => setTempWebhookUrl(e.target.value)}
              />
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(config.webhookUrl || '')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="flex gap-2">
              <Input
                type={showApiKey ? "text" : "password"}
                placeholder="API key (optional)"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
              />
              <Button variant="outline" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveConfig} disabled={!tempWebhookUrl && !tempApiKey}>
              <Settings className="h-4 w-4 mr-2" />Save
            </Button>
            <Button variant="outline" onClick={testConnection} disabled={!config.webhookUrl || isLoading}>
              Test
            </Button>
          </div>
        </div>

        {isConnected && (
          <div className="pt-3 border-t">
            <Button onClick={handleFetchMerge2Data} disabled={isLoading} className="w-full">
              Fetch Merge2 Data
            </Button>
            {coinSymbol && (
              <p className="text-sm text-muted-foreground mt-2">
                {coinSymbol} {timeframe && `(${timeframe})`}
              </p>
            )}
          </div>
        )}

        {merge2Data && (
          <div className="pt-3 border-t space-y-2">
            <div className="flex justify-between items-center">
              <Label>Merge2 Data</Label>
              <Badge variant="outline">{new Date(merge2Data.timestamp).toLocaleTimeString()}</Badge>
            </div>
            <div className="bg-muted/50 p-2 rounded text-xs">
              <pre className="overflow-auto max-h-24">{JSON.stringify(merge2Data, null, 1)}</pre>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => copyToClipboard(JSON.stringify(merge2Data, null, 2))}>
              <Copy className="h-4 w-4 mr-2" />Copy Data
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};