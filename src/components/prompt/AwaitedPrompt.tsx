import { useMemo, useState, type ReactNode } from 'react';

import { PromptContext, type PromptContextValue, type PromptRequest } from '@components/prompt/prompt.context.ts';
import { Button } from '@components/uiframework/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@components/uiframework/Dialog';

export const AwaitedPrompt = ({ children }: { children: ReactNode }) => {
  const [request, setRequest] = useState<PromptRequest | null>(null);

  const complete = (value: boolean) => {
    if (!request) {
      return;
    }

    request.resolve(value);
    setRequest(null);
  };

  const value = useMemo<PromptContextValue>(() => {
    return {
      confirm: (options) => {
        return new Promise<boolean>((resolve) => {
          setRequest((currentRequest) => {
            if (currentRequest) {
              currentRequest.resolve(false);
            }

            return { options, resolve };
          });
        });
      },
    };
  }, []);

  return (
    <PromptContext.Provider value={value}>
      {children}
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            complete(false);
          }
        }}
        open={request !== null}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{request?.options.title ?? ``}</DialogTitle>
            {request?.options.description ? <DialogDescription>{request.options.description}</DialogDescription> : null}
          </DialogHeader>
          <DialogFooter>
              <Button
                onClick={() => {
                  complete(false);
                }}
                type="button"
              variant="outline"
            >
              {request?.options.cancelLabel ?? `Cancel`}
            </Button>
            <Button
              onClick={() => {
                complete(true);
              }}
              type="button"
                variant={request?.options.variant === `destructive` ? `destructive` : `default`}
              >
                {request?.options.confirmLabel ?? `Confirm`}
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PromptContext.Provider>
  );
};
