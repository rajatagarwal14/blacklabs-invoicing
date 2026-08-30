import { View } from '@react-pdf/renderer';
import { memo, type FC } from 'react';
import { LayoutType } from '../../../shared/enums/layoutType';
import type { InvoiceFromData, PdfTexts } from '../../../shared/types/invoice';
import type { Settings } from '../../../shared/types/settings';
import { BusinessInfo } from './BusinessInfo';
import { ClientInfo } from './ClientInfo';
import { PDF_STYLES } from './constant';
import { InvoiceInformationInfo } from './InvoiceInformationInfo';
import { LogoInfo } from './LogoInfo';
import { TitleInfo } from './TitleInfo';

interface Props {
  invoiceForm?: InvoiceFromData;
  storeSettings?: Settings;
  logoUrl?: string;
  pdfTexts: PdfTexts;
}
const HeaderInfoComponent: FC<Props> = ({ invoiceForm, storeSettings, logoUrl, pdfTexts }) => {
  return (
    <View style={PDF_STYLES.header}>
      {invoiceForm?.invoiceCustomization?.layout === LayoutType.modern && (
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
      )}
      {invoiceForm?.invoiceCustomization?.layout === LayoutType.compact && (
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
              <BusinessInfo invoiceForm={invoiceForm} logoUrl={logoUrl} />
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
                  dateLabel: pdfTexts.date,
                  pdfINVOICELabel: pdfTexts.pdfINVOICE,
                  pdfQUOTELabel: pdfTexts.pdfQUOTE
                }}
              />
            </View>
          </View>
        </>
      )}
      {invoiceForm?.invoiceCustomization?.layout !== LayoutType.compact && (
        <>
          <View style={[PDF_STYLES.row, PDF_STYLES.spaceBetween, PDF_STYLES.alignStart]}>
            <BusinessInfo invoiceForm={invoiceForm} logoUrl={logoUrl} />
            <InvoiceInformationInfo
              storeSettings={storeSettings}
              invoiceForm={invoiceForm}
              labels={{
                invoiceNoLabel: pdfTexts.invoiceNo,
                quoteNoLabel: pdfTexts.quoteNo,
                dueDateLabel: pdfTexts.dueDate,
                dateLabel: pdfTexts.date,
                pdfINVOICELabel: pdfTexts.pdfINVOICE,
                pdfQUOTELabel: pdfTexts.pdfQUOTE
              }}
            />
          </View>
          <View style={[PDF_STYLES.row, PDF_STYLES.spaceBetween, PDF_STYLES.alignStart, PDF_STYLES.pt20]}>
            <ClientInfo invoiceForm={invoiceForm} billToLabel={pdfTexts.billTo} />
          </View>
        </>
      )}
    </View>
  );
};
export const HeaderInfo = memo(HeaderInfoComponent);
