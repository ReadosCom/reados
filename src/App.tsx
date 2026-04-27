import { RouterProvider } from '@tanstack/react-router';

import { useRootApplicationQuery } from '@components/app/app.query.ts';
import { router } from './router.tsx';

export const App = () => {
  useRootApplicationQuery();

  return <RouterProvider router={router} />;
};
