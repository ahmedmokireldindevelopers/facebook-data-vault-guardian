
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Pause, Play, Square, RefreshCw } from "lucide-react";

interface ExtractionControlsProps {
  status: string;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onIntervalChange: (interval: number) => void;
  disabled?: boolean;
}

export function ExtractionControls({
  status,
  onPause,
  onResume,
  onStop,
  onIntervalChange,
  disabled = false
}: ExtractionControlsProps) {
  const [interval, setInterval] = useState(500); // Default 500ms
  const [isCustomInterval, setIsCustomInterval] = useState(false);

  // Load saved interval on component mount
  useEffect(() => {
    // Check if chrome API is available using safe type checking
    if (typeof window !== 'undefined' && window.chrome?.storage?.local) {
      window.chrome.storage.local.get("extractionInterval", (data) => {
        if (data.extractionInterval) {
          setInterval(data.extractionInterval);
        }
      });
    }
  }, []);

  const handleIntervalChange = (value: number[] | number) => {
    const newInterval = Array.isArray(value) ? value[0] : value;
    setInterval(newInterval);
    
    // Save to storage and notify parent with proper type checking
    if (typeof window !== 'undefined' && window.chrome?.storage?.local) {
      window.chrome.storage.local.set({ extractionInterval: newInterval });
    }
    onIntervalChange(newInterval);
  };

  const handleCustomIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      handleIntervalChange(value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button 
          variant={status === "extracting" ? "outline" : "default"}
          size="sm" 
          onClick={status === "extracting" ? onPause : onResume}
          disabled={disabled || status === "complete" || status === "error"}
          className="flex-1"
        >
          {status === "extracting" ? (
            <><Pause className="mr-2 h-4 w-4" /> Pause</>
          ) : (
            <><Play className="mr-2 h-4 w-4" /> Resume</>
          )}
        </Button>
        
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onStop}
          disabled={disabled || status === "idle" || status === "complete" || status === "error"}
          className="flex-1"
        >
          <Square className="mr-2 h-4 w-4" /> Stop
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Time Interval</span>
          <span className="text-sm text-muted-foreground">{interval}ms</span>
        </div>
        
        {isCustomInterval ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="100"
              value={interval}
              onChange={handleCustomIntervalChange}
              className="w-24"
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsCustomInterval(false)}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Slider
              min={100}
              max={2000}
              step={100}
              value={[interval]}
              onValueChange={handleIntervalChange}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Fast (100ms)</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsCustomInterval(true)}
                className="h-6 text-xs"
              >
                Custom
              </Button>
              <span>Slow (2000ms)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
