import { Text, View } from '@react-pdf/renderer';
import { memo, type FC } from 'react';
import type { InvoiceFromData } from '../../../../shared/types/invoice';
import { DEFAULT_FONT_SIZES, FONT_SIZES, PDF_STYLES } from './../constant';

interface Props {
  invoiceForm?: InvoiceFromData;
  paymentInfoLabel: string;
}

const PaymentInfoComponent: FC<Props> = ({ invoiceForm, paymentInfoLabel }) => {
  if (!invoiceForm?.invoiceBusinessSnapshot?.businessPaymentInformation) return null;

  return (
    <View style={[PDF_STYLES.alignStart, PDF_STYLES.gap4, PDF_STYLES.maxw50]}>
      <Text
        style={[
          PDF_STYLES.regularBold,
          { fontSize: FONT_SIZES[invoiceForm?.invoiceCustomization?.fontSize ?? DEFAULT_FONT_SIZES].regularBold }
        ]}
      >
        {paymentInfoLabel}:
      </Text>
      <Text
        style={[
          PDF_STYLES.businessText,
          { fontSize: FONT_SIZES[invoiceForm?.invoiceCustomization?.fontSize ?? DEFAULT_FONT_SIZES].businessText }
        ]}
      >
        {invoiceForm?.invoiceBusinessSnapshot?.businessPaymentInformation}
      </Text>
    </View>
  );
};
export const PaymentInfo = memo(PaymentInfoComponent);
