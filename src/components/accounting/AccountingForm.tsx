import { useState } from "react";

import { useTranslation } from "@components/i18n/useTranslation.ts";
import { Button } from "@components/uiframework/Button";
import { Input } from "@components/uiframework/Input";

type AccountingFormProps = {
  defaultFiscalYear: string;
};

/**
 * Renders a minimal accounting configuration form scaffold.
 */
export const AccountingForm = ({ defaultFiscalYear }: AccountingFormProps) => {
  const { t } = useTranslation(`./AccountingPage.i18n.ts`);
  const [fiscalYear, setFiscalYear] = useState(defaultFiscalYear);

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-card-foreground" htmlFor="accounting-fiscal-year">
          {t(`Fiscal year`)}
        </label>
        <Input
          id="accounting-fiscal-year"
          onChange={(event) => {
            setFiscalYear(event.target.value);
          }}
          value={fiscalYear}
        />
      </div>
      <div className="flex justify-end">
        <Button type="button">{t(`Save configuration`)}</Button>
      </div>
    </form>
  );
};
