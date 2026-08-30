import { InvoiceType } from '../../shared/enums/invoiceType';
import { InvoicesPage } from '../invoices';

export const QuotesPage = () => <InvoicesPage type={InvoiceType.quotation} />;
