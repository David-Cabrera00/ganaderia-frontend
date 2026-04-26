export const formatNumber = (value: number | null | undefined, options?: Intl.NumberFormatOptions): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('es-CO', options).format(value);
};

export const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${formatNumber(value)}%`;
};
