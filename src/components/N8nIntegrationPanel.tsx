import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, TestTube, Zap, Copy, Eye, EyeOff } from "lucide-react";
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
        {/* Configuration Section */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                placeholder={config.webhookUrl || "Enter your N8N webhook URL"}
                value={tempWebhookUrl}
                onChange={(e) => setTempWebhookUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(config.webhookUrl || '', 'Webhook URL')}
                disabled={!config.webhookUrl}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                placeholder={config.apiKey ? "••••••••••••" : "Enter API key for authentication"}
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSaveConfig}
              disabled={!tempWebhookUrl && !tempApiKey}
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
            <Button 
              variant="outline"
              onClick={testConnection}
              disabled={!config.webhookUrl || isLoading}
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test
            </Button>
          </div>
        </div>

        {/* Actions Section */}
        {isConnected && (
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex gap-2">
              <Button 
                onClick={handleFetchMerge2Data}
                disabled={isLoading}
                className="flex-1"
              >
                Fetch Merge2 Data
              </Button>
            </div>

            {coinSymbol && (
              <div className="text-sm text-muted-foreground">
                Current: {coinSymbol} {timeframe && `(${timeframe})`}
              </div>
            )}
          </div>
        )}

        {/* Merge2 Data Display */}
        {merge2Data && (
          <div className="space-y-2 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Latest Merge2 Data</Label>
              <Badge variant="outline" className="bg-primary/10">
                {new Date(merge2Data.timestamp).toLocaleTimeString()}
              </Badge>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <pre className="text-xs overflow-auto max-h-32">
                {JSON.stringify(merge2Data, null, 2)}
              </pre>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full gap-2"
              onClick={() => copyToClipboard(JSON.stringify(merge2Data, null, 2), 'N8N Merge2 data')}
            >
              <Copy className="h-4 w-4" />
              Copy Merge2 Data
            </Button>
          </div>
        )}

        {/* Help Section */}
        <div className="text-xs text-muted-foreground space-y-1 pt-3 border-t border-border">
          <p><strong>Setup Instructions:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Create an N8N workflow with a webhook trigger</li>
            <li>Copy the webhook URL and paste it above</li>
            <li>Enable the integration and test the connection</li>
            <li>Use "Fetch Merge2 Data" to get processed data from your workflow</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};