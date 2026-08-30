import { View } from '@react-pdf/renderer';
import { memo, type FC } from 'react';
import type { InvoiceFromData, PdfTexts } from '../../../../../shared/types/invoice';
import type { Settings } from '../../../../../shared/types/settings';
import { PDF_STYLES } from './../../constant';
import { LogoInfo } from './../../LogoInfo';
import { TitleInfo } from './../../TitleInfo';
import { PaymentInfo } from './../PaymentInfo';
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
      <View style={[PDF_STYLES.row, PDF_STYLES.spaceBetween, PDF_STYLES.alignStart, PDF_STYLES.pb20]}>
        <TitleInfo
          invoiceForm={invoiceForm}
          labels={{
            pdfINVOICELabel: pdfTexts.pdfINVOICE,
            pdfQUOTELabel: pdfTexts.pdfQUOTE
          }}
        />
        <LogoInfo invoiceForm={invoiceForm} logoUrl={logoUrl} />
      </View>

      <>
        <View style={[PDF_STYLES.row, PDF_STYLES.spaceBetween, PDF_STYLES.alignStart]}>
          <BusinessInfo invoiceForm={invoiceForm} />
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
        <View style={[PDF_STYLES.row, PDF_STYLES.spaceBetween, PDF_STYLES.alignStart, PDF_STYLES.pt20]}>
          <ClientInfo invoiceForm={invoiceForm} billToLabel={pdfTexts.billTo} />
          <View style={PDF_STYLES.flexGrow} />
          <PaymentInfo invoiceForm={invoiceForm} paymentInfoLabel={pdfTexts.paymentInfo} />
        </View>
      </>
    </View>
  );
};
export const HeaderInfo = memo(HeaderInfoComponent);
