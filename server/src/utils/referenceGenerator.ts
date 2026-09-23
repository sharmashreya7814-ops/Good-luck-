/**
 * Generates an elegant, readable customer reference code (e.g. 'GLS-8492')
 */
export function generateBookingReference(prefix: string = 'GLS'): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${randomPart}`;
}
