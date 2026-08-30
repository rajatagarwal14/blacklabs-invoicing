import { View } from '@react-pdf/renderer';
import { memo, type FC } from 'react';
import type { InvoiceFromData, PdfTexts } from '../../../../../shared/types/invoice';
import type { Settings } from '../../../../../shared/types/settings';
import { PDF_STYLES } from './../../constant';
import { TitleInfo } from './../../TitleInfo';
import { BusinessInfo } from './BusinessInfo';
import { ClientInfo } from './ClientInfo';
import { InvoiceInformationInfo } from './InvoiceInformationInfo';

interface Props {
  invoiceForm?: InvoiceFromData;
  storeSettings?: Settings;
  logoUrl?: string;
  pdfTexts: PdfTexts;
}
const HeaderInfoComponent: FC<Props> = ({ invoiceForm, storeSettings, pdfTexts }) => {
  return (
    <View style={PDF_STYLES.header}>
      <>
        <View style={[PDF_STYLES.alignCenter, PDF_STYLES.pb20]}>
          <TitleInfo
            invoiceForm={invoiceForm}
            labels={{
              pdfINVOICELabel: pdfTexts.pdfINVOICE,
              pdfQUOTELabel: pdfTexts.pdfQUOTE
            }}
          />
        </View>
        <View style={[PDF_STYLES.row, PDF_STYLES.spaceBetween, PDF_STYLES.alignStart, PDF_STYLES.gap10]}>
          <View style={[PDF_STYLES.w40]}>
            <BusinessInfo invoiceForm={invoiceForm} />
          </View>
          <View style={[PDF_STYLES.w40]}>
            <ClientInfo invoiceForm={invoiceForm} billToLabel={pdfTexts.billTo} />
          </View>
          <View style={[PDF_STYLES.w20]}>
            <InvoiceInformationInfo
              storeSettings={storeSettings}
              invoiceForm={invoiceForm}
              labels={{
                invoiceNoLabel: pdfTexts.invoiceNo,
                quoteNoLabel: pdfTexts.quoteNo,
                dueDateLabel: pdfTexts.dueDate,
                dateLabel: pdfTexts.date
              }}
            />
          </View>
        </View>
      </>
    </View>
  );
};
export const HeaderInfo = memo(HeaderInfoComponent);
