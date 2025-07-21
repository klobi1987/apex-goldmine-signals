import { toast } from "@/hooks/use-toast";

export const copyToClipboard = async (text: string, description?: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: description || `"${text}" has been copied to your clipboard.`,
      duration: 2000,
    });
  } catch (err) {
    console.error('Failed to copy: ', err);
    toast({
      title: "Copy failed",
      description: "Unable to copy to clipboard. Please try again.",
      variant: "destructive",
      duration: 3000,
    });
  }
};

export const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (numPrice < 0.001) {
    return numPrice.toFixed(8);
  } else if (numPrice < 1) {
    return numPrice.toFixed(6);
  } else if (numPrice < 100) {
    return numPrice.toFixed(4);
  } else {
    return numPrice.toFixed(2);
  }
};

export const formatPercentage = (percentage: number | string): string => {
  const num = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
  return `${(num * 100).toFixed(2)}%`;
};

export const formatVolume = (volume: number): string => {
  if (volume >= 1e9) {
    return `$${(volume / 1e9).toFixed(2)}B`;
  } else if (volume >= 1e6) {
    return `$${(volume / 1e6).toFixed(2)}M`;
  } else if (volume >= 1e3) {
    return `$${(volume / 1e3).toFixed(2)}K`;
  } else {
    return `$${volume.toFixed(2)}`;
  }
};

export const getBybitUrl = (symbol: string): string => {
  return `https://www.bybit.com/trade/usdt/${symbol}`;
};