import { Button, ButtonAppearance, LoginPageLayout } from '@canonical/react-components';

/**
 * Render the public Reados landing page.
 */
export const Home = () => {
  return (
    <main aria-labelledby="home-page-title">
      <LoginPageLayout title="Welcome to Reados" logo={{ src: `/assets/images/reados.png`, title: `Welcome to Reados`, url: `/` }}>
        <p className="u-sv3">Start your workday with us. Your path to productivity is just a click away.</p>

        <div className="u-align--right">
          <Button appearance={ButtonAppearance.BRAND} element="a" href={`/identify`}>
            Start here
          </Button>
        </div>
      </LoginPageLayout>
    </main>
  );
};
