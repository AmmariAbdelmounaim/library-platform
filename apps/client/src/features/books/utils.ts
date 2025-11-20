import type { AuthorResponseDto } from '@/api/generated/model';

export const asOptionalString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return undefined;
};

export const formatDate = (value?: string): string => {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatDateTime = (value?: string): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatAuthorName = (author: AuthorResponseDto): string => {
  const parts = [author.firstName, author.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : `Author #${author.id}`;
};

export const formatAuthorLifespan = (author: AuthorResponseDto): string => {
  const birth = author.birthDate
    ? formatDate(author.birthDate)
    : 'Unknown birth date';
  const death = author.deathDate
    ? formatDate(author.deathDate)
    : 'Living / unknown';
  return `${birth} — ${death}`;
};

export const formatMetadataValue = (value: unknown, fallback = '—'): string => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return fallback;
  }
};
