import { Text, View } from '@react-pdf/renderer';
import { memo, type FC } from 'react';
import type { InvoiceFromData } from '../../../../../shared/types/invoice';
import { DEFAULT_FONT_SIZES, FONT_SIZES, PDF_STYLES } from '../../constant';
import { LogoInfo } from '../../LogoInfo';

interface Props {
  invoiceForm?: InvoiceFromData;
  logoUrl?: string;
}
const BusinessInfoComponent: FC<Props> = ({ invoiceForm, logoUrl }) => {
  return (
    <View style={[PDF_STYLES.row, PDF_STYLES.alignStart, PDF_STYLES.gap5]}>
      <LogoInfo invoiceForm={invoiceForm} logoUrl={logoUrl} />

      <View style={[PDF_STYLES.gap4, PDF_STYLES.alignStart, PDF_STYLES.w50]}>
        <Text
          style={[
            PDF_STYLES.business,
            { fontSize: FONT_SIZES[invoiceForm?.invoiceCustomization?.fontSize ?? DEFAULT_FONT_SIZES].business }
          ]}
        >
          {invoiceForm?.invoiceBusinessSnapshot?.businessName}
        </Text>
        {invoiceForm?.invoiceBusinessSnapshot?.businessRole && (
          <Text
            style={[
              PDF_STYLES.businessText,
              { fontSize: FONT_SIZES[invoiceForm?.invoiceCustomization?.fontSize ?? DEFAULT_FONT_SIZES].businessText }
            ]}
          >
            {invoiceForm?.invoiceBusinessSnapshot?.businessRole}
          </Text>
        )}
        {invoiceForm?.invoiceBusinessSnapshot?.businessAddress && (
          <Text
            style={[
              PDF_STYLES.businessText,
              {
                fontSize: FONT_SIZES[invoiceForm?.invoiceCustomization?.fontSize ?? DEFAULT_FONT_SIZES].businessText
              }
            ]}
          >
            {invoiceForm?.invoiceBusinessSnapshot?.businessAddress}
          </Text>
        )}
        {invoiceForm?.invoiceBusinessSnapshot?.businessEmail && (
          <Text
            style={[
              PDF_STYLES.businessText,
              {
                fontSize: FONT_SIZES[invoiceForm?.invoiceCustomization?.fontSize ?? DEFAULT_FONT_SIZES].businessText
              }
            ]}
          >
            {invoiceForm?.invoiceBusinessSnapshot?.businessEmail}
          </Text>
        )}
        {invoiceForm?.invoiceBusinessSnapshot?.businessPhone && (
          <Text
            style={[
              PDF_STYLES.businessText,
              {
                fontSize: FONT_SIZES[invoiceForm?.invoiceCustomization?.fontSize ?? DEFAULT_FONT_SIZES].businessText
              }
            ]}
          >
            {invoiceForm?.invoiceBusinessSnapshot?.businessPhone}
          </Text>
        )}
        {invoiceForm?.invoiceBusinessSnapshot?.businessAdditional && (
          <Text
            style={[
              PDF_STYLES.businessText,
              {
                fontSize: FONT_SIZES[invoiceForm?.invoiceCustomization?.fontSize ?? DEFAULT_FONT_SIZES].businessText
              }
            ]}
          >
            {invoiceForm?.invoiceBusinessSnapshot?.businessAdditional}
          </Text>
        )}
      </View>
    </View>
  );
};
export const BusinessInfo = memo(BusinessInfoComponent);
