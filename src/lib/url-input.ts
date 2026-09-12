export function addHttpsPrefix(value: string): string {
  if (!value || /^h/i.test(value)) return value;

  return `https://${value}`;
}
