import { Button, ButtonAppearance } from '@canonical/react-components';

import './dashboard.scss';

const modules = [
  { name: `Accounting`, path: `/accounting` },
  { name: `CRM`, path: `/crm` },
  { name: `Sales`, path: `/sales` },
  { name: `Billing`, path: `/billing` },
  { name: `Contract Management`, path: `/contract-management` },
  { name: `Inventory`, path: `/inventory` },
  { name: `Procurement`, path: `/procurement` },
  { name: `HR`, path: `/hr` },
  { name: `Payroll`, path: `/payroll` },
  { name: `Projects`, path: `/projects` },
  { name: `Documents`, path: `/documents` },
  { name: `Inbox`, path: `/inbox` },
  { name: `CMS`, path: `/cms` },
  { name: `Authentication`, path: `/authentication` },
  { name: `Authorization`, path: `/authorization` },
  { name: `Tenant`, path: `/tenant` },
  { name: `Workflow`, path: `/workflow` },
  { name: `Audit`, path: `/audit` },
  { name: `Search`, path: `/search` },
  { name: `Notification`, path: `/notification` },
];

/**
 * Render the tenant application dashboard.
 */
export const Dashboard = () => {
  return (
    <main className="dashboard" aria-labelledby="dashboard-title">
      <header className="dashboard__header">
        <p className="dashboard__eyebrow">Tenant Workspace</p>
        <h1 id="dashboard-title">Reados Dashboard</h1>
        <p className="dashboard__lead">Your modules and operational tools are ready for today.</p>
      </header>

      <section className="dashboard__modules" aria-label="Available modules">
        {modules.map(({ name, path }) => (
          <article className="dashboard__card" key={name}>
            <h2>{name}</h2>
            <p>Open {name.toLowerCase()} workflows and continue where you left off.</p>
            <div className="dashboard__card-actions u-align--right">
              <Button appearance={ButtonAppearance.BRAND} className="dashboard__go-button" element="a" href={path}>
                Go
              </Button>
            </div>
          </article>
        ))}
      </section>

      <div className="dashboard__actions u-align--right">
        <Button appearance={ButtonAppearance.BASE} element="a" href="/authentication">
          Switch user
        </Button>
        <Button appearance={ButtonAppearance.BRAND} element="a" href="/">
          Open workspace
        </Button>
      </div>
    </main>
  );
};
