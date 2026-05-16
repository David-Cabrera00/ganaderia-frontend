const COLOMBIA_TIME_ZONE = 'America/Bogota';

function normalizeUtcIso(value: string): string {
  const trimmed = value.trim();

  if (
    trimmed.endsWith('Z') ||
    /[+-]\d{2}:\d{2}$/.test(trimmed)
  ) {
    return trimmed;
  }

  return `${trimmed}Z`;
}

function toDateFromBackend(value: string | null | undefined): Date | null {
  if (!value) return null;

  const date = new Date(normalizeUtcIso(value));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export const formatDate = (iso: string | null | undefined): string => {
  const date = toDateFromBackend(iso);

  if (!date) return '—';

  return new Intl.DateTimeFormat('es-CO', {
    timeZone: COLOMBIA_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (iso: string | null | undefined): string => {
  const date = toDateFromBackend(iso);

  if (!date) return '—';

  const parts = new Intl.DateTimeFormat('es-CO', {
    timeZone: COLOMBIA_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const day = parts.find((part) => part.type === 'day')?.value ?? '00';
  const month = parts.find((part) => part.type === 'month')?.value ?? '00';
  const year = parts.find((part) => part.type === 'year')?.value ?? '0000';
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '00';
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00';

  return `${day}/${month}/${year} · ${hour}:${minute}`;
};

export const formatBackendDateTimeInText = (
  value: string | null | undefined,
): string => {
  if (!value) return '';

  return value.replace(
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g,
    (match) => formatDateTime(match),
  );
};