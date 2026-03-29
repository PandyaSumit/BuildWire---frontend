export const FILE_TYPE_CARD_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  pdf: {
    label: 'PDF',
    className: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20',
  },
  spreadsheet: {
    label: 'XLS',
    className:
      'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20',
  },
  doc: {
    label: 'DOC',
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  },
  other: {
    label: 'FILE',
    className: 'bg-muted/30 text-muted border-border',
  },
};
