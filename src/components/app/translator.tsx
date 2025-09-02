"use client";

import { useState } from "react";
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
import { Loader2, Languages } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { translateCustomerQuery } from "@/ai/flows/translate-customer-queries";
import { suggestCommonReplies } from "@/ai/flows/suggest-common-replies";
import { CopyButton } from "./copy-button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Skeleton } from "../ui/skeleton";
import { AlertCircle } from "lucide-react";

export function Translator() {
  const [burmeseInput, setBurmeseInput] = useState("");
  const [chineseTranslation, setChineseTranslation] = useState("");
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTranslate = async () => {
    if (!burmeseInput.trim()) return;

    setIsLoading(true);
    setError("");
    setChineseTranslation("");
    setSuggestedReplies([]);

    try {
      const translationResult = await translateCustomerQuery({
        query: burmeseInput,
      });
      if (translationResult.translation) {
        setChineseTranslation(translationResult.translation);

        const repliesResult = await suggestCommonReplies({
          translatedBurmeseText: translationResult.translation,
        });
        if (repliesResult.suggestedReplies) {
          setSuggestedReplies(repliesResult.suggestedReplies);
        }
      }
    } catch (e) {
      setError("Failed to get translation. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl">
          Live Translator
        </CardTitle>
        <CardDescription>
          Enter Burmese text to translate and get AI-powered reply suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full gap-4">
          <Textarea
            placeholder="မင်္ဂလာပါ..."
            value={burmeseInput}
            onChange={(e) => setBurmeseInput(e.target.value)}
            rows={4}
            className="text-base"
          />
          <Button
            onClick={handleTranslate}
            disabled={isLoading || !burmeseInput.trim()}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Languages className="mr-2 h-4 w-4" />
            )}
            Translate
          </Button>
        </div>
      </CardContent>

      {(isLoading || chineseTranslation || error) && (
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
                <Skeleton className="h-12 w-full" />
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
          {chineseTranslation && (
            <div className="w-full space-y-6">
              <div className="w-full space-y-2">
                <h3 className="font-semibold text-foreground">
                  Chinese Translation:
                </h3>
                <div className="flex items-center justify-between rounded-md border bg-muted p-3">
                  <p className="font-semibold text-primary">
                    {chineseTranslation}
                  </p>
                  <CopyButton textToCopy={chineseTranslation} />
                </div>
              </div>

              {suggestedReplies.length > 0 && (
                <div className="w-full space-y-2">
                  <h3 className="font-semibold text-foreground">
                    Suggested Replies:
                  </h3>
                  <div className="space-y-2">
                    {suggestedReplies.map((reply, index) => (
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
