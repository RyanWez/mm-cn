"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Languages } from "lucide-react";
import { translateCustomerQuery } from "@/ai/translate";
import { CopyButton } from "./copy-button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle } from "lucide-react";
import { LottieLoader } from "./lottie-loader";

const COOLDOWN_SECONDS = 30;

// Function to get cache from localStorage
const getCache = (): Record<string, string> => {
  try {
    const cache = localStorage.getItem("translationCache");
    return cache ? JSON.parse(cache) : {};
  } catch (error) {
    console.error("Failed to read from localStorage", error);
    return {};
  }
};

// Function to set cache to localStorage
const setCache = (key: string, value: string) => {
  try {
    const cache = getCache();
    cache[key] = value;
    localStorage.setItem("translationCache", JSON.stringify(cache));
  } catch (error) {
    console.error("Failed to write to localStorage", error);
  }
};

export function Translator() {
  const [inputText, setInputText] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleTranslate = async () => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput || cooldown > 0) return;

    setIsLoading(true);
    setError("");
    setTranslation("");

    const cacheKey = `auto-translate:${trimmedInput}`;

    // Check cache first
    const cachedTranslation = getCache()[cacheKey];
    if (cachedTranslation) {
      setTranslation(cachedTranslation);
      setIsLoading(false);
      return;
    }

    try {
      const translationResult = await translateCustomerQuery({
        query: trimmedInput,
      });

      if (translationResult) {
        setTranslation(translationResult);
        setCache(cacheKey, translationResult); // Save to cache
        setCooldown(COOLDOWN_SECONDS);
      }
    } catch (e) {
      setError("Failed to get translation. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const isTranslateDisabled = isLoading || !inputText.trim() || cooldown > 0;
  const placeholder = "ဘာသာပြန်ရန် စာသားရိုက်ထည့်ပါ";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl">
          Live Translator
        </CardTitle>
        <CardDescription>
          Enter text to automatically detect the language and translate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
          {/* Source Language Column */}
          <div className="flex flex-col gap-2">
            <div className="text-center font-semibold text-card-foreground p-2 rounded-md border bg-muted">
              Enter Burmese or Chinese
            </div>
            <Textarea
              placeholder={placeholder}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={6}
              className="text-base"
              maxLength={250}
            />
            <p className="text-xs text-muted-foreground text-right pr-1">
              {inputText.length} / 250
            </p>
          </div>

          {/* Target Language Column */}
          <div className="flex flex-col gap-2 md:pt-0">
             <div className="text-center font-semibold text-card-foreground p-2 rounded-md border bg-muted">
              Translation
            </div>
            <div className="relative w-full">
              {isLoading ? (
                <div className="flex items-center justify-center rounded-md bg-muted border h-[110px]">
                  <LottieLoader />
                </div>
              ) : (
                <Textarea
                  placeholder=""
                  value={translation}
                  readOnly
                  rows={6}
                  className="text-base bg-muted"
                />
              )}
              {translation && !isLoading && (
                 <div className="absolute bottom-2 right-2">
                   <CopyButton textToCopy={translation} />
                 </div>
              )}
            </div>
             <p className="text-xs text-muted-foreground text-right pr-1 h-4"></p> {/* Spacer */}
          </div>
        </div>

        {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

        <Button onClick={handleTranslate} disabled={isTranslateDisabled} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : cooldown > 0 ? (
            <span>Try again in {cooldown}s</span>
          ) : (
            <Languages className="mr-2 h-4 w-4" />
          )}
          {cooldown === 0 && 'Translate'}
        </Button>
         <p className="text-xs text-muted-foreground pt-2 text-center opacity-70">
            AI နဲ့ ဘာသာပြန်ထားတာဖြစ်လို့ အဓိပ္ပာယ် အနည်းငယ် ကွဲလွဲမှု ရှိနိုင်ပါသည်
          </p>
      </CardContent>
    </Card>
  );
}
