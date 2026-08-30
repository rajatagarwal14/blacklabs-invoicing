import { View } from '@react-pdf/renderer';
import { memo, type FC } from 'react';
import type { InvoiceFromData, PdfTexts } from '../../../../../shared/types/invoice';
import type { Settings } from '../../../../../shared/types/settings';
import { PDF_STYLES } from '../../constant';
import { PaymentInfo } from '../PaymentInfo';
import { BusinessInfo } from './BusinessInfo';
import { ClientInfo } from './ClientInfo';
import { InvoiceInformationInfo } from './InvoiceInformationInfo';

interface Props {
  invoiceForm?: InvoiceFromData;
  storeSettings?: Settings;
  logoUrl?: string;
  pdfTexts: PdfTexts;
}
const HeaderInfoComponent: FC<Props> = ({ invoiceForm, storeSettings, logoUrl, pdfTexts }) => {
  return (
    <View style={PDF_STYLES.header}>
      <View style={[PDF_STYLES.row, PDF_STYLES.spaceBetween, PDF_STYLES.alignStart]}>
        <BusinessInfo invoiceForm={invoiceForm} logoUrl={logoUrl} />
        <InvoiceInformationInfo
          storeSettings={storeSettings}
          invoiceForm={invoiceForm}
          labels={{
            dueDateLabel: pdfTexts.dueDate,
            dateLabel: pdfTexts.date,
            pdfINVOICELabel: pdfTexts.pdfINVOICE,
            pdfQUOTELabel: pdfTexts.pdfQUOTE
          }}
        />
      </View>
      <View style={[PDF_STYLES.row, PDF_STYLES.spaceBetween, PDF_STYLES.alignStart, PDF_STYLES.pt20]}>
        <ClientInfo invoiceForm={invoiceForm} billToLabel={pdfTexts.billTo} />
        <View style={PDF_STYLES.flexGrow} />
        <PaymentInfo invoiceForm={invoiceForm} paymentInfoLabel={pdfTexts.paymentInfo} />
      </View>
    </View>
  );
};
export const HeaderInfo = memo(HeaderInfoComponent);
