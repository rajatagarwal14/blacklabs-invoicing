import { Text, View } from '@react-pdf/renderer';
import { memo, type FC } from 'react';
import { InvoiceType } from '../../../shared/enums/invoiceType';
import { LayoutType } from '../../../shared/enums/layoutType';
import type { InvoiceFromData } from '../../../shared/types/invoice';
import type { Settings } from '../../../shared/types/settings';
import { formatDate } from '../../../shared/utils/formatFunctions';
import { DEFAULT_FONT_SIZES, FONT_SIZES, PDF_STYLES } from './constant';
import { TitleInfo } from './TitleInfo';

interface PropsLabels {
  invoiceNoLabel: string;
  quoteNoLabel: string;
  dueDateLabel: string;
  dateLabel: string;
  pdfQUOTELabel: string;
  pdfINVOICELabel: string;
}
interface Props {
  invoiceForm?: InvoiceFromData;
  storeSettings?: Settings;
  labels: PropsLabels;
}
const InvoiceInformationInfoComponent: FC<Props> = ({ invoiceForm, storeSettings, labels }) => {
  const { invoiceNoLabel, quoteNoLabel, dueDateLabel, dateLabel, pdfQUOTELabel, pdfINVOICELabel } = labels;

  return (
    <View
      style={[
        PDF_STYLES.alignEnd,
        PDF_STYLES.gap4,
        invoiceForm?.invoiceCustomization?.layout === LayoutType.compact ? PDF_STYLES.w100 : PDF_STYLES.w50
      ]}
    >
      {invoiceForm?.invoiceCustomization?.layout === LayoutType.classic && (
        <TitleInfo
          invoiceForm={invoiceForm}
          labels={{
            pdfINVOICELabel: pdfINVOICELabel,
            pdfQUOTELabel: pdfQUOTELabel
          }}
        />
      )}

      <View
        style={[
          PDF_STYLES.gap3,
          PDF_STYLES.alignEnd,
          invoiceForm?.invoiceCustomization?.layout === LayoutType.modern
            ? {
                backgroundColor: '#e0e0e0',
                padding: 5,
                borderRadius: 5
              }
            : {}
        ]}
      >
        <View style={[PDF_STYLES.row, PDF_STYLES.alignEnd]}>
          {invoiceForm?.invoiceCustomization?.layout !== LayoutType.classic && (
            <Text
              style={[
                PDF_STYLES.regularBold,
                { fontSize: FONT_SIZES[invoiceForm?.invoiceCustomization?.fontSize ?? DEFAULT_FONT_SIZES].regularBold }
              ]}
            >
              {invoiceForm?.invoiceType === InvoiceType.invoice ? invoiceNoLabel : quoteNoLabel}:{' '}
            </Text>
          )}
          <Text
            style={[
              PDF_STYLES.regular,
              { fontSize: FONT_SIZES[invoiceForm?.invoiceCustomization?.fontSize ?? DEFAULT_FONT_SIZES].regular }
            ]}
          >
            {invoiceForm?.invoicePrefix}
            {invoiceForm?.invoiceNumber}
            {invoiceForm?.invoiceSuffix}
          </Text>
        </View>
        {storeSettings && invoiceForm?.issuedAt && (
          <View style={[PDF_STYLES.row, PDF_STYLES.alignEnd]}>
            <Text
              style={[
                PDF_STYLES.regularBold,
                { fontSize: FONT_SIZES[invoiceForm?.invoiceCustomization?.fontSize ?? DEFAULT_FONT_SIZES].regularBold }
              ]}
            >
              {dateLabel}:{' '}
            </Text>
            <Text
              style={[
                PDF_STYLES.regular,
                { fontSize: FONT_SIZES[invoiceForm?.invoiceCustomization?.fontSize ?? DEFAULT_FONT_SIZES].regular }
              ]}
            >
              {formatDate(invoiceForm.issuedAt, storeSettings.dateFormat)}
            </Text>
          </View>
        )}
        {storeSettings && invoiceForm?.dueDate && (
          <View style={[PDF_STYLES.row, PDF_STYLES.alignEnd]}>
            <Text
              style={[
                PDF_STYLES.regularBold,
                { fontSize: FONT_SIZES[invoiceForm?.invoiceCustomization?.fontSize ?? DEFAULT_FONT_SIZES].regularBold }
              ]}
            >
              {dueDateLabel}:{' '}
            </Text>
            <Text
              style={[
                PDF_STYLES.regular,
                { fontSize: FONT_SIZES[invoiceForm?.invoiceCustomization?.fontSize ?? DEFAULT_FONT_SIZES].regular }
              ]}
            >
              {formatDate(invoiceForm.dueDate, storeSettings.dateFormat)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
export const InvoiceInformationInfo = memo(InvoiceInformationInfoComponent);
