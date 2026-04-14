import BankAccount from '../models/BankAccount.js';
export async function generateAccountNumber(type) {
    const prefix = type === 'checking' ? 'C' : 'S';
    // Get the highest account number for this type
    const existingAccounts = await BankAccount.findAll({
        where: { accountType: type },
        attributes: ['accountNumber'],
        order: [['accountNumber', 'DESC']],
        limit: 1,
    });
    let nextNumber = 1;
    if (existingAccounts.length > 0) {
        const lastAccountNumber = existingAccounts[0].accountNumber;
        // Extract the numeric part (e.g., "C0001" -> 1)
        const lastNumber = parseInt(lastAccountNumber.substring(1), 10);
        nextNumber = lastNumber + 1;
    }
    // Format as prefix + 4-digit zero-padded number
    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
}
//# sourceMappingURL=sequenceGenerator.js.map