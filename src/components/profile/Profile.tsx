import { AppShell } from '@components/application/AppShell';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { type ProfileEditable, profileEditableSchema } from '@components/authentication/authentication.schema.ts';
import { useAuthenticationSessionQuery, useUpdateAuthenticationProfileMutation } from '@components/authentication/authentication.query.ts';
import { applyPreferredLanguage } from '@components/i18n/i18n.ts';
import { useTranslation } from '@components/i18n/useTranslation.ts';
import { Button } from '@components/uiframework/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/uiframework/Card';
import { Input } from '@components/uiframework/Input';

export const Profile = () => {
  const { t } = useTranslation(`./Profile.i18n.ts`);
  const { data: authenticationSession } = useAuthenticationSessionQuery();
  const { isPending, mutateAsync } = useUpdateAuthenticationProfileMutation();
  const [saveState, setSaveState] = useState<`error` | `idle` | `saved`>(`idle`);
  const sessionIdentity = authenticationSession?.authenticated ? authenticationSession.session : null;
  const {
    formState: { isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<ProfileEditable>({
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

    reset({
      displayName: sessionIdentity.displayName,
      firstName: sessionIdentity.firstName,
      language: sessionIdentity.language,
      lastName: sessionIdentity.lastName,
      middleName: sessionIdentity.middleName ?? ``,
    });
  }, [reset, sessionIdentity]);

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
    <AppShell>
      <main className="relative min-h-[100vh] overflow-hidden rounded-xl bg-background md:min-h-min">
        <div className="relative w-full h-full px-2 py-4 sm:px-4 sm:py-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('Profile')}</CardTitle>
              <CardDescription>{t('Manage your account preferences here.')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-5"
                onSubmit={(event) => {
                  void handleSubmit(onSubmit)(event);
                }}
              >
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-card-foreground" htmlFor="profile-display-name">
                    {t('Display name')}
                  </label>
                  <Input
                    {...register(`displayName`)}
                    disabled={isPending || isSubmitting || !sessionIdentity}
                    id="profile-display-name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-card-foreground" htmlFor="profile-first-name">
                    {t('First name')}
                  </label>
                  <Input
                    {...register(`firstName`)}
                    disabled={isPending || isSubmitting || !sessionIdentity}
                    id="profile-first-name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-card-foreground" htmlFor="profile-middle-name">
                    {t('Middle name')}
                  </label>
                  <Input
                    {...register(`middleName`)}
                    disabled={isPending || isSubmitting || !sessionIdentity}
                    id="profile-middle-name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-card-foreground" htmlFor="profile-last-name">
                    {t('Last name')}
                  </label>
                  <Input
                    {...register(`lastName`)}
                    disabled={isPending || isSubmitting || !sessionIdentity}
                    id="profile-last-name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-card-foreground" htmlFor="profile-email">
                    {t('Email')}
                  </label>
                  <Input disabled id="profile-email" value={sessionIdentity?.email ?? ``} />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-card-foreground" htmlFor="profile-language">
                    {t('Language')}
                  </label>
                  <select
                    {...register(`language`)}
                    className="h-7 w-full rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isPending || isSubmitting || !sessionIdentity}
                    id="profile-language"
                  >
                    <option value="en">{t('English')}</option>
                    <option value="tr">{t('Turkish')}</option>
                    <option value="de">{t('German')}</option>
                    <option value="es">{t('Spanish')}</option>
                    <option value="fr">{t('French')}</option>
                    <option value="it">{t('Italian')}</option>
                    <option value="pt">{t('Portuguese')}</option>
                    <option value="nl">{t('Dutch')}</option>
                    <option value="pl">{t('Polish')}</option>
                  </select>
                </div>

                {saveState === `saved` ? <p className="text-sm text-muted-foreground">{t('Preferences saved.')}</p> : null}
                {saveState === `error` ? <p className="text-sm text-destructive">{t('Could not save preferences right now.')}</p> : null}

                <div className="flex justify-end">
                  <Button disabled={isPending || isSubmitting || !sessionIdentity} type="submit">
                    {isPending || isSubmitting ? t('Saving...') : t('Save changes')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppShell>
  );
};
