import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/utils/clipboard";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  description?: string;
  variant?: "default" | "outline" | "ghost" | "sm";
  className?: string;
  showText?: boolean;
}

export const CopyButton = ({ 
  text, 
  description, 
  variant = "outline", 
  className,
  showText = false 
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(text, description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSize = () => {
    if (variant === "sm") return "h-6 w-6";
    return "h-8 w-8";
  };

  const getIconSize = () => {
    if (variant === "sm") return "h-3 w-3";
    return "h-4 w-4";
  };

  if (showText) {
    return (
      <Button
        variant={variant === "sm" ? "outline" : variant}
        size={variant === "sm" ? "sm" : "default"}
        onClick={handleCopy}
        className={cn("gap-2", className)}
      >
        {copied ? <Check className={getIconSize()} /> : <Copy className={getIconSize()} />}
        {copied ? "Copied!" : "Copy"}
      </Button>
    );
  }

  return (
    <Button
      variant={variant === "sm" ? "ghost" : variant}
      size="icon"
      onClick={handleCopy}
      className={cn(getSize(), "transition-colors", className)}
    >
      {copied ? (
        <Check className={cn(getIconSize(), "text-bullish")} />
      ) : (
        <Copy className={getIconSize()} />
      )}
    </Button>
  );
};