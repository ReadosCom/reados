import type { Control, UseFormGetValues } from 'react-hook-form';

import { useTranslation } from '@components/i18n/useTranslation.ts';
import { Badge } from '@components/uiframework/Badge';
import { Button } from '@components/uiframework/Button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/uiframework/Form';
import { Input } from '@components/uiframework/Input';
import { TabsContent } from '@components/uiframework/Tabs';

type AccountingSegmentFormValues = {
  segments: Array<{
    id: string;
    label: string;
    required: boolean;
  }>;
};

type AccountingSegmentProps = {
  control: Control<AccountingSegmentFormValues>;
  getValues: UseFormGetValues<AccountingSegmentFormValues>;
  index: number;
  isFinalized: boolean;
  onRemove: (index: number) => void;
  tabValue: string;
};

export const AccountingSegment = ({ control, getValues, index, isFinalized, onRemove, tabValue }: AccountingSegmentProps) => {
  const { t } = useTranslation(`./AccountingSegment.i18n.ts`);
  const isRequired = getValues(`segments.${index}.required`) === true;
  const canRemove = !isFinalized && !isRequired;

  return (
    <TabsContent className="space-y-3 rounded-md border border-border p-3" value={tabValue}>
      <FormField
        control={control}
        name={`segments.${index}.label`}
        render={({ field: segmentLabelField }) => (
          <FormItem>
            <FormLabel>{t(`Label`)}</FormLabel>
            <FormControl>
              <Input {...segmentLabelField} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex justify-end pt-1">
        {canRemove ? (
          <Button
            onClick={() => {
              onRemove(index);
            }}
            type="button"
            variant="outline"
          >
            {t(`Remove`)}
          </Button>
        ) : (
          <Badge variant="secondary">{t(`Required segments can't be deleted`)}</Badge>
        )}
      </div>
    </TabsContent>
  );
};
