export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateAmount(amount: unknown): boolean {
  if (typeof amount !== 'number') return false;
  if (amount <= 0) return false;
  // Check if it has at most 2 decimal places
  if (!Number.isFinite(amount)) return false;
  const decimals = (amount.toString().split('.')[1] || '').length;
  return decimals <= 2;
}

export function validateAccountType(type: unknown): boolean {
  return type === 'checking' || type === 'savings';
}

export function validateState(state: unknown): boolean {
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  ];
  return typeof state === 'string' && states.includes(state);
}
