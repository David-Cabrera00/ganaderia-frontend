const MOJIBAKE_REPLACEMENTS: Record<string, string> = {
  'Ã¡': 'á',
  'Ã©': 'é',
  'Ã­': 'í',
  'Ã³': 'ó',
  'Ãº': 'ú',
  'Ã': 'Á',
  'Ã‰': 'É',
  'Ã': 'Í',
  'Ã“': 'Ó',
  'Ãš': 'Ú',
  'Ã±': 'ñ',
  'Ã‘': 'Ñ',
  'Ã¼': 'ü',
  'Ãœ': 'Ü',
  'Â¿': '¿',
  'Â¡': '¡',
  'Â°': '°',
  'Â': '',
};

export function formatDisplayText(value: string | null | undefined): string {
  if (!value) return '—';

  return Object.entries(MOJIBAKE_REPLACEMENTS).reduce(
    (text, [broken, fixed]) => text.replaceAll(broken, fixed),
    value,
  );
}