import { createContext, useContext } from "react";

export type PromptOptions = {
  cancelLabel?: string;
  confirmLabel?: string;
  description?: string;
  title: string;
  variant?: "default" | "destructive";
};

export type PromptRequest = {
  options: PromptOptions;
  resolve: (value: boolean) => void;
};

export type PromptContextValue = {
  confirm: (options: PromptOptions) => Promise<boolean>;
};

export const PromptContext = createContext<PromptContextValue | undefined>(undefined);

export const useAwaitedPrompt = () => {
  const context = useContext(PromptContext);

  if (!context) {
    throw new Error(`useAwaitedPrompt must be used within AwaitedPrompt.`);
  }

  return context;
};
