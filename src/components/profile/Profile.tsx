import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { type ProfileEditable, profileEditableSchema } from '@components/authentication/authentication.schema.ts';
import { useAuthenticationSessionQuery, useUpdateAuthenticationProfileMutation } from '@components/authentication/authentication.query.ts';
import { applyPreferredLanguage } from '@components/i18n/i18n.ts';
import { useTranslation } from '@components/i18n/useTranslation.ts';
import { Button } from '@components/uiframework/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/uiframework/Card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/uiframework/Form';
import { Input } from '@components/uiframework/Input';
import { NativeSelect, NativeSelectOption } from '@components/uiframework/NativeSelect';

export const Profile = () => {
  const { t } = useTranslation(`./Profile.i18n.ts`);
  const { data: authenticationSession } = useAuthenticationSessionQuery();
  const { isPending, mutateAsync } = useUpdateAuthenticationProfileMutation();
  const [saveState, setSaveState] = useState<`error` | `idle` | `saved`>(`idle`);
  const sessionIdentity = authenticationSession?.authenticated ? authenticationSession.session : null;
  const form = useForm<ProfileEditable>({
    defaultValues: {
      displayName: sessionIdentity?.displayName ?? ``,
      firstName: sessionIdentity?.firstName ?? ``,
      language: sessionIdentity?.language ?? `en`,
      lastName: sessionIdentity?.lastName ?? ``,
      middleName: sessionIdentity?.middleName ?? ``,
    },
    resolver: zodResolver(profileEditableSchema),
  });

  useEffect(() => {
    if (!sessionIdentity) {
      return;
    }

    form.reset({
      displayName: sessionIdentity.displayName,
      firstName: sessionIdentity.firstName,
      language: sessionIdentity.language,
      lastName: sessionIdentity.lastName,
      middleName: sessionIdentity.middleName ?? ``,
    });
  }, [form, sessionIdentity]);

  const onSubmit = async ({ displayName, firstName, language, lastName, middleName }: ProfileEditable) => {
    setSaveState(`idle`);

    try {
      await mutateAsync({
        displayName,
        firstName,
        language,
        lastName,
        middleName,
      });
      await applyPreferredLanguage(language);
      setSaveState(`saved`);
    } catch {
      setSaveState(`error`);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('Profile')}</CardTitle>
          <CardDescription>{t('Manage your account preferences here.')}</CardDescription>
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
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Display name')}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending || form.formState.isSubmitting || !sessionIdentity} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('First name')}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending || form.formState.isSubmitting || !sessionIdentity} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Middle name')}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending || form.formState.isSubmitting || !sessionIdentity} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Last name')}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending || form.formState.isSubmitting || !sessionIdentity} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>{t('Email')}</FormLabel>
                <FormControl>
                  <Input disabled value={sessionIdentity?.email ?? ``} />
                </FormControl>
              </FormItem>

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Language')}</FormLabel>
                    <FormControl>
                      <NativeSelect {...field} disabled={isPending || form.formState.isSubmitting || !sessionIdentity} value={field.value}>
                        <NativeSelectOption value="en">{t('English')}</NativeSelectOption>
                        <NativeSelectOption value="tr">{t('Turkish')}</NativeSelectOption>
                        <NativeSelectOption value="de">{t('German')}</NativeSelectOption>
                        <NativeSelectOption value="es">{t('Spanish')}</NativeSelectOption>
                        <NativeSelectOption value="fr">{t('French')}</NativeSelectOption>
                        <NativeSelectOption value="it">{t('Italian')}</NativeSelectOption>
                        <NativeSelectOption value="pt">{t('Portuguese')}</NativeSelectOption>
                        <NativeSelectOption value="nl">{t('Dutch')}</NativeSelectOption>
                        <NativeSelectOption value="pl">{t('Polish')}</NativeSelectOption>
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {saveState === `saved` ? <p className="text-sm text-muted-foreground">{t('Preferences saved.')}</p> : null}
              {saveState === `error` ? <p className="text-sm text-destructive">{t('Could not save preferences right now.')}</p> : null}

              <div className="flex justify-end">
                <Button disabled={isPending || form.formState.isSubmitting || !sessionIdentity} type="submit">
                  {isPending || form.formState.isSubmitting ? t('Saving...') : t('Save changes')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};
