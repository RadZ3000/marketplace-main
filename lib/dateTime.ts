export function abbreviateDateTimeString(
  relativeDateTime: string
) {
  return relativeDateTime
    .replace('min.', 'm')
    .replace('hr.', 'h')
    .replace('mo.', 'mo')
    .replace('day', 'd')
    .replace('in ', '')
    .replace(' ago', '')
    .replace(' ', '')
}
