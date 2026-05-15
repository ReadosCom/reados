import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useTranslation } from "@components/i18n/useTranslation.ts";
import { Button } from "@components/uiframework/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/uiframework/Card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@components/uiframework/Form";
import { Switch } from "@components/uiframework/Switch";

import { useAccountingConfigurationQuery, useUpdateAccountingConfigurationMutation } from "./accountingConfiguration.query.ts";

const accountingConfigurationFormSchema = z.object({
  finalized: z.boolean(),
});

type AccountingConfigurationFormValues = z.infer<typeof accountingConfigurationFormSchema>;

export const AccountingConfiguration = () => {
  const { t } = useTranslation(`./AccountingPage.i18n.ts`);
  const { data, isError, isPending } = useAccountingConfigurationQuery();
  const { mutateAsync, isPending: isUpdating } = useUpdateAccountingConfigurationMutation();
  const [saveState, setSaveState] = useState<`error` | `idle` | `saved`>(`idle`);
  const form = useForm<AccountingConfigurationFormValues>({
    defaultValues: {
      finalized: false,
    },
    resolver: zodResolver(accountingConfigurationFormSchema),
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    form.reset({
      finalized: data.configuration.finalized === true,
    });
  }, [data, form]);

  const onSubmit = async (values: AccountingConfigurationFormValues) => {
    setSaveState(`idle`);

    try {
      await mutateAsync({
        configuration: {
          ...data?.configuration,
          finalized: values.finalized,
        },
      });
      setSaveState(`saved`);
    } catch {
      setSaveState(`error`);
    }
  };

  if (isPending) {
    return <p className="text-sm text-muted-foreground">{t(`Loading accounting configuration...`)}</p>;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{t(`Accounting configuration`)}</CardTitle>
        <CardDescription>{t(`Configure accounting module readiness and defaults.`)}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={(event) => {
              void form.handleSubmit(onSubmit)(event);
            }}
          >
            <FormField
              control={form.control}
              name="finalized"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between rounded-md border border-border p-3">
                    <div className="space-y-1">
                      <FormLabel>{t(`Finalized`)}</FormLabel>
                      <FormDescription>{t(`Allow users to continue from configuration to accounting workflows.`)}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isError ? <p className="text-sm text-destructive">{t(`Could not load accounting configuration right now.`)}</p> : null}
            {saveState === `saved` ? <p className="text-sm text-muted-foreground">{t(`Configuration saved.`)}</p> : null}
            {saveState === `error` ? <p className="text-sm text-destructive">{t(`Could not save configuration right now.`)}</p> : null}

            <div className="flex justify-end">
              <Button disabled={isUpdating} type="submit">
                {isUpdating ? t(`Saving...`) : t(`Save configuration`)}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
