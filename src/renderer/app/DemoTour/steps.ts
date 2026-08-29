/**
 * The guided demo script.
 *
 * Each step navigates the real application and narrates what is on screen —
 * nothing is mocked or drawn over. Keep the narration about what the viewer
 * can see happening, not about features in the abstract.
 *
 * Ordered as a sales walkthrough rather than a feature list: set up who you
 * bill and what you sell, raise a document, then show the tracking that is the
 * actual reason to pay for this.
 */
export type TourStep = {
  /** Route to navigate to before the step is shown. */
  path: string;
  title: string;
  body: string;
  /** Milliseconds this step holds before auto-advancing. */
  hold?: number;
};

export const TOUR_STEPS: TourStep[] = [
  {
    path: '/invoices',
    title: 'Everything you have billed',
    body: 'Invoices, newest first, each showing its status at a glance — paid, part-paid, or outstanding. Search, filter and sort all persist between sessions, so the view you work in is the view you come back to.',
    hold: 9000
  },
  {
    path: '/businesses',
    title: 'Bill as more than one entity',
    body: 'Each business carries its own address, logo and details. They are kept separately so one installation can invoice under several trading names, each with its own numbering.',
    hold: 8000
  },
  {
    path: '/clients',
    title: 'Who you bill',
    body: 'Clients hold billing addresses, contacts and reference codes. Every list here supports archiving rather than deletion, so historic invoices never lose the record they were raised against.',
    hold: 8000
  },
  {
    path: '/items',
    title: 'Your rate card',
    body: 'Reusable line items with a unit and a category. Pull them into a document rather than retyping prices, and import or export the whole card as a spreadsheet.',
    hold: 8000
  },
  {
    path: '/banks',
    title: 'How you get paid',
    body: 'Bank details are separate records attached to a document, so the account shown on an invoice is deliberate rather than typed into a notes field.',
    hold: 8000
  },
  {
    path: '/invoices',
    title: 'The invoice itself',
    body: 'Line items, quantities, tax handled per item or on the total, discounts, surcharges and shipping. Partial payments are recorded against the invoice, and the balance due follows automatically.',
    hold: 10000
  },
  {
    path: '/quotes',
    title: 'Quotes convert into invoices',
    body: 'Quotes are a first-class document, not an invoice with a different label. When one is accepted it converts across, keeping its reference so the trail from estimate to payment stays intact.',
    hold: 9000
  },
  {
    path: '/styleProfiles',
    title: 'Branding that is actually yours',
    body: 'Colour, typography, layout, logo, watermark and signature — saved as reusable profiles. This is what makes the PDF look like the client sent it, which is the whole point of a white-label product.',
    hold: 9000
  },
  {
    path: '/reports',
    title: 'What is owed, and by whom',
    body: 'Total billed, collection rate, cash collected and outstanding, with overdue counted separately. Set the range to This year to see the full picture rather than the last thirty days.',
    hold: 11000
  },
  {
    path: '/settings',
    title: 'Set up once, per client',
    body: 'Language, number and date formats, invoice numbering, and which features appear at all. A managed instance ships with US defaults already applied — Letter paper, dollars, month-first dates.',
    hold: 9000
  },
  {
    path: '/invoices',
    title: 'That is the tour',
    body: 'Every screen you just saw is one client instance, isolated with its own database, branded at build time and deployed by a single command. Press Replay to run through it again.',
    hold: 12000
  }
];
