import { useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { useCurrentUser } from '../context/CurrentUserContext';
import { userService } from '../services/userService';
import Avatar from '../components/Avatar';

// Auto-dismiss success messages after 5 seconds
const AUTO_DISMISS_DELAY = 5000;

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const inputCls =
  'w-full sm:w-72 text-sm text-right border border-transparent hover:border-gray-300 focus:border-[#CC5500] focus:outline-none focus:ring-2 focus:ring-[#CC5500]/30 rounded-md px-2 py-1 bg-transparent';

function memberSince(iso?: string | null): string {
  if (!iso) return 'Welcome';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Welcome';
  return `Member since ${d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
}

function shortAccountId(sub?: string): string {
  if (!sub) return '#U-00000';
  // Take last 5 hex-ish chars to mimic the mockup's #U-00421 style.
  const tail = sub.replace(/-/g, '').slice(-5).toUpperCase();
  return `#U-${tail}`;
}

export const Profile: React.FC = () => {
  const { user, isLoading, error, refresh } = useCurrentUser();
  const { signOut } = useAuthContext();

  const initial = useMemo(
    () => ({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
      address: user?.address ?? '',
      city: user?.city ?? '',
      state: user?.state ?? '',
      zipCode: user?.zipCode ?? '',
      dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
    }),
    [user]
  );

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const set = <K extends keyof typeof form>(key: K, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setMessage(null);
    const digits = form.phone.replace(/\D/g, '');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setMessage({ tone: 'err', text: 'First and last name are required' });
      return;
    }
    if (form.phone && digits.length !== 10) {
      setMessage({ tone: 'err', text: 'Phone must be a 10-digit US number' });
      return;
    }
    if (form.zipCode && !/^\d{5}(-\d{4})?$/.test(form.zipCode.trim())) {
      setMessage({ tone: 'err', text: 'Zip must be 5 digits or ZIP+4' });
      return;
    }
    if (form.state && !US_STATES.includes(form.state)) {
      setMessage({ tone: 'err', text: 'Invalid state' });
      return;
    }

    setSaving(true);
    try {
      await userService.updateMe({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: digits || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state || undefined,
        zipCode: form.zipCode.trim() || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
      });
      setMessage({ tone: 'ok', text: 'Changes successfully saved' });
      // Auto-dismiss success message after 5 seconds
      setTimeout(() => setMessage(null), AUTO_DISMISS_DELAY);
      // Refresh in background without blocking UI
      refresh();
    } catch (err) {
      const apiMessage =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setMessage({
        tone: 'err',
        text: apiMessage || (err instanceof Error ? err.message : 'Failed to save'),
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="text-center py-20 text-gray-600">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;
  if (!user) return <div className="text-center py-20 text-gray-600">User not found</div>;

  const fullName = `${form.firstName || user.firstName} ${form.lastName || user.lastName}`.trim();

  return (
    <div className="max-w-3xl mx-auto">
      {message && (
        <div
          className={`mb-4 text-sm rounded-md px-3 py-2 border animate-in fade-in ${
            message.tone === 'ok'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        onClick={() => history.back()}
        className="mb-4 text-[#CC5500] hover:text-[#b34600] text-sm font-medium"
      >
        ← Back to My Banking
      </button>

      <div className="flex items-center gap-4 mb-6">
        <Avatar firstName={form.firstName} lastName={form.lastName} size="lg" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{fullName || 'Your Profile'}</h1>
          <p className="text-sm text-gray-500">{memberSince(user.dateOfBirth ?? undefined)}</p>
        </div>
      </div>

      {/* Personal information */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm mb-5">
        <header className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Personal information</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#CC5500] hover:bg-[#b34600] text-white text-sm font-semibold px-3 py-1.5 rounded-md transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </header>

        <dl className="divide-y divide-gray-100">
          <Row label="First name">
            <input
              className={inputCls}
              value={form.firstName}
              onChange={(e) => set('firstName', e.target.value)}
              disabled={saving}
              maxLength={100}
            />
          </Row>
          <Row label="Last name">
            <input
              className={inputCls}
              value={form.lastName}
              onChange={(e) => set('lastName', e.target.value)}
              disabled={saving}
              maxLength={100}
            />
          </Row>
          <Row label="Date of birth">
            <input
              type="date"
              className={inputCls}
              value={form.dateOfBirth}
              onChange={(e) => set('dateOfBirth', e.target.value)}
              disabled={saving}
              max={new Date().toISOString().slice(0, 10)}
            />
          </Row>
          <Row label="Phone">
            <input
              type="tel"
              placeholder="(555) 123-4567"
              className={inputCls}
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              disabled={saving}
              maxLength={20}
            />
          </Row>
          <Row label="Address">
            <input
              className={inputCls}
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              disabled={saving}
              maxLength={200}
            />
          </Row>
          <Row label="City">
            <input
              className={inputCls}
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              disabled={saving}
              maxLength={100}
            />
          </Row>
          <Row label="State">
            <select
              className={inputCls}
              value={form.state}
              onChange={(e) => set('state', e.target.value)}
              disabled={saving}
            >
              <option value="">--</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Row>
          <Row label="Zip code">
            <input
              className={inputCls}
              placeholder="12345"
              value={form.zipCode}
              onChange={(e) => set('zipCode', e.target.value)}
              disabled={saving}
              maxLength={10}
            />
          </Row>
          <Row label="Account ID">
            <span className="text-sm font-medium text-gray-700">{shortAccountId(user.userId)}</span>
          </Row>
        </dl>
      </section>

      {/* Login & security */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
        <header className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Login &amp; security</h2>
        </header>
        <dl className="divide-y divide-gray-100">
          <Row label="Email">
            <span className="text-sm font-medium text-gray-700">{user.email}</span>
          </Row>
          <Row label="Authentication">
            <span className="text-sm font-medium text-gray-700">Asgardeo SSO</span>
          </Row>
        </dl>
      </section>

      <div className="flex justify-end">
        <button
          onClick={() => signOut()}
          className="bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 transition px-4 py-2 rounded-md text-sm font-medium shadow-sm"
        >
          Log out
        </button>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between px-5 py-3 gap-4">
    <dt className="text-sm text-gray-600">{label}</dt>
    <dd className="flex-1 flex justify-end">{children}</dd>
  </div>
);

export default Profile;
