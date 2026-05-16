import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { v7 as uuidv7 } from "uuid";

import { useTranslation } from "@components/i18n/useTranslation.ts";
import { Button } from "@components/uiframework/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/uiframework/Card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@components/uiframework/Form";
import { Input } from "@components/uiframework/Input";
import { Switch } from "@components/uiframework/Switch";

import { useAccountingConfigurationQuery, useUpdateAccountingConfigurationMutation } from "./accountingConfiguration.query.ts";
import { accountingConfigurationFormSchema, accountSystemSegment, entitySystemSegment, type AccountingConfigurationFormValues } from "./accountingConfiguration.schema.ts";

export const AccountingConfiguration = () => {
  const { t } = useTranslation(`./AccountingConfiguration.i18n.ts`);
  const { data, isError, isPending } = useAccountingConfigurationQuery();
  const { mutateAsync, isPending: isUpdating } = useUpdateAccountingConfigurationMutation();
  const [saveState, setSaveState] = useState<`error` | `idle` | `saved`>(`idle`);
  const form = useForm<AccountingConfigurationFormValues>({
    defaultValues: {
      finalized: false,
      optionalSegments: [],
    },
    resolver: zodResolver(accountingConfigurationFormSchema),
  });
  const optionalSegments = useFieldArray({
    control: form.control,
    name: `optionalSegments`,
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    form.reset({
      finalized: data.configuration.finalized === true,
      optionalSegments: data.configuration.segments
        .filter((segment) => segment.source === `custom`)
        .sort((left, right) => left.order - right.order)
        .map((segment) => ({
          active: segment.active,
          id: segment.id,
          label: segment.label,
        })),
    });
  }, [data, form]);

  const onSubmit = async (values: AccountingConfigurationFormValues) => {
    setSaveState(`idle`);

    try {
      const customSegments = values.optionalSegments.map((segment, index) => ({
        active: segment.active,
        id: segment.id,
        label: segment.label,
        order: index + 2,
        required: false as const,
        source: `custom` as const,
      }));

      await mutateAsync({
        configuration: {
          finalized: values.finalized,
          segments: [entitySystemSegment, accountSystemSegment, ...customSegments],
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

            <section className="space-y-3" aria-label={t(`Required segments`)}>
              <h3 className="text-sm font-semibold">{t(`Required segments`)}</h3>
              <div className="rounded-md border border-border p-3 text-sm">
                <p className="font-medium">{t(`Entity`)}</p>
                <p className="text-muted-foreground">{t(`System required segment`)}</p>
              </div>
              <div className="rounded-md border border-border p-3 text-sm">
                <p className="font-medium">{t(`Account`)}</p>
                <p className="text-muted-foreground">{t(`System required segment`)}</p>
              </div>
            </section>

            <section className="space-y-3" aria-label={t(`Optional segments`)}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{t(`Optional segments`)}</h3>
                <Button
                  onClick={() => {
                    optionalSegments.append({
                      active: true,
                      id: uuidv7(),
                      label: ``,
                    });
                  }}
                  type="button"
                  variant="outline"
                >
                  {t(`Add segment`)}
                </Button>
              </div>

              {optionalSegments.fields.map((field, index) => (
                <div className="space-y-3 rounded-md border border-border p-3" key={field.id}>
                  <FormField
                    control={form.control}
                    name={`optionalSegments.${index}.label`}
                    render={({ field: optionalLabelField }) => (
                      <FormItem>
                        <FormLabel>{t(`Label`)}</FormLabel>
                        <FormControl>
                          <Input {...optionalLabelField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`optionalSegments.${index}.active`}
                    render={({ field: optionalActiveField }) => (
                      <FormItem>
                        <div className="flex items-center justify-between rounded-md border border-border p-3">
                          <div className="space-y-1">
                            <FormLabel>{t(`Active`)}</FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={optionalActiveField.value} onCheckedChange={optionalActiveField.onChange} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        optionalSegments.remove(index);
                      }}
                      type="button"
                      variant="outline"
                    >
                      {t(`Remove`)}
                    </Button>
                  </div>
                </div>
              ))}
            </section>

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
