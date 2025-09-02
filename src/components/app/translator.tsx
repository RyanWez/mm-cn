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
import { suggestCommonReplies } from "@/ai/flows/suggest-common-replies";
import { CopyButton } from "./copy-button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Skeleton } from "../ui/skeleton";
import { AlertCircle } from "lucide-react";

type TranslationDirection = "my-to-zh" | "zh-to-my";

const COOLDOWN_SECONDS = 30;

export function Translator() {
  const [inputText, setInputText] = useState("");
  const [translation, setTranslation] = useState("");
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
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
    setSuggestedReplies([]);

    const sourceLanguage = translationDirection === "my-to-zh" ? "Burmese" : "Chinese";
    const targetLanguage = translationDirection === "my-to-zh" ? "Chinese" : "Burmese";

    try {
      // Run both API calls in parallel
      const [translationResult, repliesResult] = await Promise.all([
        translateCustomerQuery({
          query: inputText,
          sourceLanguage,
          targetLanguage,
        }),
        suggestCommonReplies({
          translatedText: inputText, // Use original text for suggestion
          language: targetLanguage,
        }),
      ]);

      if (translationResult.translation) {
        setTranslation(translationResult.translation);
      }

      if (repliesResult.suggestedReplies) {
        setSuggestedReplies(repliesResult.suggestedReplies);
      }

      // Start cooldown only after both requests are finished successfully
      if (translationResult.translation) {
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
    setInputText("");
    setTranslation("");
    setSuggestedReplies([]);
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
          Enter {sourceLabel} text to translate and get AI-powered reply suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm w-20 text-center">{sourceLabel}</span>
            <Button variant="ghost" size="icon" onClick={toggleDirection}>
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-sm w-20 text-center">{targetLabel}</span>
          </div>
          <Textarea
            placeholder={placeholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            className="text-base"
          />
          <Button onClick={handleTranslate} disabled={isTranslateDisabled}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : cooldown > 0 ? (
              <span>Try again in {cooldown}s</span>
            ) : (
              <Languages className="mr-2 h-4 w-4" />
            )}
            {cooldown === 0 && 'Translate'}
          </Button>
        </div>
      </CardContent>

      {(isLoading || translation || error) && (
        <CardFooter className="flex-col items-start gap-6 pt-6">
          <Separator />
          {isLoading && (
            <div className="w-full space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {translation && (
            <div className="w-full space-y-6">
              <div className="w-full space-y-2">
                <h3 className="font-semibold text-foreground">
                  {targetLabel} Translation:
                </h3>
                <div className="flex items-center justify-between rounded-md border bg-muted p-3">
                  <p className="font-semibold text-primary">
                    {translation}
                  </p>
                  <CopyButton textToCopy={translation} />
                </div>
              </div>

              {suggestedReplies.length > 0 && (
                <div className="w-full space-y-2">
                  <h3 className="font-semibold text-foreground">
                    Recommend:
                  </h3>
                  <div className="space-y-2">
                    {suggestedReplies.slice(0, 1).map((reply, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border bg-background p-3"
                      >
                        <p className="text-sm">{reply}</p>
                        <CopyButton textToCopy={reply} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
