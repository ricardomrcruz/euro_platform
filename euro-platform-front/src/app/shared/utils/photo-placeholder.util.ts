export function placeholder(label: string, bg = 'CBD5E1', fg = '1E293B', size = '800x600'): string {
  return `https://placehold.co/${size}/${bg}/${fg}?text=${encodeURIComponent(label)}`;
}
