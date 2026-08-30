export interface Currency {
  id?: number;
  code: string;
  symbol: string;
  text: string;
  format: string;
  subunit: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  invoiceCount: number;
  quotesCount: number;
}
