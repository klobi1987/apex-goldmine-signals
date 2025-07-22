import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface N8nConfig {
  webhookUrl?: string;
  apiKey?: string;
  enabled: boolean;
}

interface N8nMerge2Data {
  timestamp: string;
  source: string;
  merge_data: any;
  coin_symbol?: string;
  timeframe?: string;
}

export const useN8nIntegration = () => {
  const [config, setConfig] = useState<N8nConfig>({
    enabled: false,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [merge2Data, setMerge2Data] = useState<N8nMerge2Data | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('n8n-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        if (parsedConfig.webhookUrl && parsedConfig.enabled) {
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Failed to parse N8N config:', error);
      }
    }
  }, []);

  // Save config to localStorage
  const updateConfig = useCallback((newConfig: Partial<N8nConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    localStorage.setItem('n8n-config', JSON.stringify(updatedConfig));
    
    if (updatedConfig.webhookUrl && updatedConfig.enabled) {
      setIsConnected(true);
      toast({
        title: "N8N Connected",
        description: "Successfully connected to N8N workflow",
      });
    } else {
      setIsConnected(false);
    }
  }, [config]);

  // Fetch merge2 data from N8N
  const fetchMerge2Data = useCallback(async (coinSymbol?: string, timeframe?: string) => {
    if (!config.webhookUrl || !config.enabled) {
      return null;
    }

    setIsLoading(true);
    try {
      const payload = {
        action: 'get_merge2_data',
        coin_symbol: coinSymbol,
        timeframe: timeframe,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setMerge2Data(data);
        return data;
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to fetch N8N merge2 data:', error);
      toast({
        title: "N8N Error",
        description: "Failed to fetch merge2 data from N8N workflow",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [config.webhookUrl, config.enabled, config.apiKey]);

  // Send data to N8N workflow
  const sendToN8n = useCallback(async (data: any) => {
    if (!config.webhookUrl || !config.enabled) {
      toast({
        title: "N8N Not Connected",
        description: "Please configure N8N webhook URL first",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const payload = {
        action: 'receive_trading_data',
        data: data,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
        },
        mode: 'no-cors', // Handle CORS for webhook calls
        body: JSON.stringify(payload),
      });

      toast({
        title: "Data Sent to N8N",
        description: "Trading data successfully sent to N8N workflow",
      });
      return true;
    } catch (error) {
      console.error('Failed to send data to N8N:', error);
      toast({
        title: "N8N Error",
        description: "Failed to send data to N8N workflow",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [config.webhookUrl, config.enabled, config.apiKey]);

  // Test N8N connection
  const testConnection = useCallback(async () => {
    if (!config.webhookUrl) {
      toast({
        title: "No Webhook URL",
        description: "Please enter a webhook URL first",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
        },
        mode: 'no-cors',
        body: JSON.stringify({
          action: 'test_connection',
          timestamp: new Date().toISOString(),
        }),
      });

      toast({
        title: "Connection Test Sent",
        description: "Test request sent to N8N. Check your workflow for confirmation.",
      });
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: "Connection Test Failed",
        description: "Unable to reach N8N webhook",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [config.webhookUrl, config.apiKey]);

  return {
    config,
    updateConfig,
    isConnected,
    merge2Data,
    isLoading,
    fetchMerge2Data,
    sendToN8n,
    testConnection,
  };
};