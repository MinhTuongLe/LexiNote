export function toCsv(
  headers: readonly string[],
  rows: readonly Record<string, unknown>[],
): string {
  const lines = [
    headers.map((header) => escapeCsvValue(header)).join(','),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header])).join(','),
    ),
  ];

  return `\uFEFF${lines.join('\r\n')}\r\n`;
}

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';

  let text: string;
  if (typeof value === 'bigint') {
    text = value.toString();
  } else if (typeof value === 'object') {
    text =
      JSON.stringify(value, (_, nestedValue: unknown) =>
        typeof nestedValue === 'bigint' ? nestedValue.toString() : nestedValue,
      ) ?? '';
  } else {
    text = JSON.stringify(value) ?? '';
  }

  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
