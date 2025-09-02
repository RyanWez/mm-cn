"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Languages, ArrowRightLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { translateCustomerQuery } from "@/ai/flows/translate-customer-queries";
import { CopyButton } from "./copy-button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Skeleton } from "../ui/skeleton";
import { AlertCircle } from "lucide-react";

type TranslationDirection = "my-to-zh" | "zh-to-my";

const COOLDOWN_SECONDS = 30;

export function Translator() {
  const [inputText, setInputText] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [translationDirection, setTranslationDirection] =
    useState<TranslationDirection>("my-to-zh");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleTranslate = async () => {
    if (!inputText.trim() || cooldown > 0) return;

    setIsLoading(true);
    setError("");
    setTranslation("");

    const sourceLanguage = translationDirection === "my-to-zh" ? "Burmese" : "Chinese";
    const targetLanguage = translationDirection === "my-to-zh" ? "Chinese" : "Burmese";

    try {
      const translationResult = await translateCustomerQuery({
        query: inputText,
        sourceLanguage,
        targetLanguage,
      });

      if (translationResult.translation) {
        setTranslation(translationResult.translation);
        setCooldown(COOLDOWN_SECONDS);
      }
    } catch (e) {
      setError("Failed to get translation. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDirection = () => {
    setTranslationDirection((prev) =>
      prev === "my-to-zh" ? "zh-to-my" : "my-to-zh"
    );
    const currentInput = inputText;
    setInputText(translation);
    setTranslation(currentInput);
    setError("");
  };

  const isTranslateDisabled = isLoading || !inputText.trim() || cooldown > 0;
  const sourceLabel = translationDirection === "my-to-zh" ? "Burmese" : "Chinese";
  const targetLabel = translationDirection === "my-to-zh" ? "Chinese" : "Burmese";
  const placeholder = translationDirection === "my-to-zh" ? "မင်္ဂလာပါ..." : "你好...";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl">
          Live Translator
        </CardTitle>
        <CardDescription>
          Enter {sourceLabel} text to translate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
          {/* Source Language Column */}
          <div className="flex flex-col gap-2">
            <div className="text-center font-semibold text-card-foreground p-2 rounded-md border bg-muted">
              {sourceLabel}
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

          {/* Swap Button */}
          <div className="flex items-center h-full pt-12">
            <Button variant="ghost" size="icon" onClick={toggleDirection}>
              <ArrowRightLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Target Language Column */}
          <div className="flex flex-col gap-2">
            <div className="text-center font-semibold text-card-foreground p-2 rounded-md border bg-muted">
              {targetLabel}
            </div>
            <div className="relative w-full">
              <Textarea
                placeholder=""
                value={translation}
                readOnly
                rows={6}
                className="text-base bg-muted"
              />
              {translation && (
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
            Ai နဲ့ ဘာသာ ပြန်တာ ဖြစ်တဲ့ အတွက် အနည်းငယ် ကွဲလွဲမှု ရှိနိုင်ပါသည်
          </p>
      </CardContent>
    </Card>
  );
}
