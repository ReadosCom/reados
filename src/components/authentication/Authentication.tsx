import { Button, ButtonAppearance, LoginPageLayout } from '@canonical/react-components';

/**
 * Render the tenant-scoped authentication experience.
 */
export const Authentication = () => {
  return (
    <main aria-labelledby="authentication-page-title">
      <LoginPageLayout title="Authenticate with Reados" logo={{ src: `/assets/images/reados.png`, title: `Reados`, url: `/` }}>
        <h1 id="authentication-page-title">Choose how you want to sign in.</h1>
        <p>Continue with an identity provider or use a one-time password for this tenant.</p>

        <div className="u-align--right">
          <Button appearance={ButtonAppearance.BRAND} element="a" href={`/`}>
            Back to home
          </Button>
        </div>
      </LoginPageLayout>
    </main>
  );
};
