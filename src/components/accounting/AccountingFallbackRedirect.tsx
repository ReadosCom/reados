import { Navigate, useRouterState } from '@tanstack/react-router';

/**
 * Redirects unknown accounting child paths.
 */
export const AccountingFallbackRedirect = () => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isAccountingRoute = pathname === `/erp/accounting` || pathname.startsWith(`/erp/accounting/`);

  if (!isAccountingRoute) {
    return <Navigate replace to="/" />;
  }

  return <Navigate replace to={'/erp/accounting' as never} />;
};
