import { useMemo, useState } from 'react';
import type { User, UserUpdatePayload } from '../services/userService';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

interface ProfileFormProps {
  user: User;
  onSubmit: (payload: UserUpdatePayload) => Promise<void>;
  submitLabel: string;
  onCancel?: () => void;
  cancelLabel?: string;
}

// Controlled form bound to a current User. Email is read-only because
// it is owned by Asgardeo and must be changed there.
export const ProfileForm: React.FC<ProfileFormProps> = ({
  user,
  onSubmit,
  submitLabel,
  onCancel,
  cancelLabel = 'Cancel',
}) => {
  const initial = useMemo(
    () => ({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phone: user.phone ?? '',
      address: user.address ?? '',
      city: user.city ?? '',
      state: user.state ?? '',
      zipCode: user.zipCode ?? '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
    }),
    [user]
  );

  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedPhoneDigits = form.phone.replace(/\D/g, '');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First and last name are required');
      return;
    }
    if (trimmedPhoneDigits.length !== 10) {
      setError('Phone must be a 10-digit US number');
      return;
    }
    if (!form.address.trim()) {
      setError('Address is required');
      return;
    }
    if (!form.city.trim()) {
      setError('City is required');
      return;
    }
    if (!US_STATES.includes(form.state)) {
      setError('Please select a state');
      return;
    }
    if (!/^\d{5}(-\d{4})?$/.test(form.zipCode.trim())) {
      setError('Zip code must be 5 digits or ZIP+4');
      return;
    }
    if (!form.dateOfBirth) {
      setError('Date of birth is required');
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: trimmedPhoneDigits,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state,
        zipCode: form.zipCode.trim(),
        dateOfBirth: form.dateOfBirth,
      });
    } catch (err) {
      const apiMessage =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(apiMessage || (err instanceof Error ? err.message : 'Failed to save profile'));
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls =
    'w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#CC5500]';
  const labelCls = 'block text-xs font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelCls}>Email (managed by Asgardeo)</label>
        <input
          type="email"
          value={user.email}
          disabled
          className={`${inputCls} bg-gray-100 cursor-not-allowed`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>First Name</label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            disabled={isSaving}
            className={inputCls}
            maxLength={100}
          />
        </div>
        <div>
          <label className={labelCls}>Last Name</label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            disabled={isSaving}
            className={inputCls}
            maxLength={100}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Phone</label>
        <input
          type="tel"
          placeholder="(555) 123-4567"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          disabled={isSaving}
          className={inputCls}
          maxLength={20}
        />
      </div>

      <div>
        <label className={labelCls}>Address</label>
        <input
          type="text"
          placeholder="123 Main St"
          value={form.address}
          onChange={(e) => set('address', e.target.value)}
          disabled={isSaving}
          className={inputCls}
          maxLength={200}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>City</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            disabled={isSaving}
            className={inputCls}
            maxLength={100}
          />
        </div>
        <div>
          <label className={labelCls}>State</label>
          <select
            value={form.state}
            onChange={(e) => set('state', e.target.value)}
            disabled={isSaving}
            className={inputCls}
          >
            <option value="">--</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Zip Code</label>
          <input
            type="text"
            placeholder="12345 or 12345-6789"
            value={form.zipCode}
            onChange={(e) => set('zipCode', e.target.value)}
            disabled={isSaving}
            className={inputCls}
            maxLength={10}
          />
        </div>
        <div>
          <label className={labelCls}>Date of Birth</label>
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => set('dateOfBirth', e.target.value)}
            disabled={isSaving}
            className={inputCls}
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 py-2 rounded-md text-sm font-medium transition disabled:opacity-50"
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 bg-[#CC5500] hover:bg-[#b34600] text-white py-2 rounded-md text-sm font-semibold transition disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
