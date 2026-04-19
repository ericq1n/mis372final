export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
export function validateAmount(amount) {
    if (typeof amount !== 'number')
        return false;
    if (amount <= 0)
        return false;
    // Check if it has at most 2 decimal places
    if (!Number.isFinite(amount))
        return false;
    const decimals = (amount.toString().split('.')[1] || '').length;
    return decimals <= 2;
}
export function validateAccountType(type) {
    return type === 'checking' || type === 'savings';
}
// US phone: accept 10 digits, optionally formatted. Normalized by caller.
export function validatePhone(phone) {
    if (typeof phone !== 'string')
        return false;
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10;
}
// US zip: 5 digits or ZIP+4 (5-4).
export function validateZipCode(zip) {
    if (typeof zip !== 'string')
        return false;
    return /^\d{5}(-\d{4})?$/.test(zip.trim());
}
// Date of birth: must parse to a real date in the past.
export function validateDateOfBirth(dob) {
    if (typeof dob !== 'string' || dob.trim() === '')
        return false;
    const d = new Date(dob);
    if (Number.isNaN(d.getTime()))
        return false;
    return d.getTime() < Date.now();
}
export function validateState(state) {
    const states = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    ];
    return typeof state === 'string' && states.includes(state);
}
//# sourceMappingURL=validators.js.map