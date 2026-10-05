'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, clearToken } from '@/lib/api';

type Tenant = {
  tenantId: string;
  displayName: string;
  industry: string | null;
  status: string;
  modules: string[];
};

type ModuleDef = { code: string; name: string; description: string | null; isCore: boolean };

export default function TenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [modules, setModules] = useState<ModuleDef[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [industry, setIndustry] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [createdResult, setCreatedResult] = useState<any>(null);

  async function loadAll() {
    try {
      const [t, m] = await Promise.all([api.listTenants(), api.listModulesCatalog()]);
      setTenants(t);
      setModules(m);
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        router.push('/login');
        return;
      }
      setError(err.message ?? 'Failed to load');
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleModule(code: string) {
    setSelectedModules((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const result = await api.createTenant({
        legalName: legalName || displayName,
        displayName,
        industry: industry || undefined,
        moduleCodes: selectedModules,
        adminEmail,
        adminFirstName,
      });
      setCreatedResult(result);
      setDisplayName('');
      setLegalName('');
      setIndustry('');
      setAdminEmail('');
      setAdminFirstName('');
      setSelectedModules([]);
      await loadAll();
    } catch (err: any) {
      setError(err.message ?? 'Failed to create tenant');
    } finally {
      setCreating(false);
    }
  }

  function handleToggleLive(tenantId: string, moduleCode: string, enabled: boolean) {
    api
      .setTenantModule(tenantId, moduleCode, enabled)
      .then(loadAll)
      .catch((err) => setError(err.message ?? 'Failed to update module'));
  }

  function signOut() {
    clearToken();
    router.push('/login');
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px', color: '#0F172A' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Tenants</h1>
          <p style={{ color: '#64748B', fontSize: 13, margin: '4px 0 0' }}>
            Every company provisioned on HS-Square — live from the API.
          </p>
        </div>
        <button onClick={signOut} style={ghostBtn}>
          Sign out
        </button>
      </div>

      {error && (
        <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 4, marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 4, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
            Active tenants {tenants ? `(${tenants.length})` : ''}
          </h2>
          <button onClick={() => setShowCreate((s) => !s)} style={accentBtn}>
            {showCreate ? 'Close' : '+ New tenant'}
          </button>
        </div>

        {tenants === null ? (
          <div style={{ padding: 24, color: '#64748B', fontSize: 13 }}>Loading…</div>
        ) : tenants.length === 0 ? (
          <div style={{ padding: 24, color: '#64748B', fontSize: 13 }}>No tenants yet — create the first one.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                {['Company', 'Industry', 'Modules', 'Status'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 12, color: '#64748B', fontWeight: 500 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.tenantId} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '12px 20px', fontWeight: 600, fontSize: 13.5 }}>{t.displayName}</td>
                  <td style={{ padding: '12px 20px', fontSize: 13.5 }}>{t.industry ?? '—'}</td>
                  <td style={{ padding: '12px 20px' }}>
                    {modules.map((m) => {
                      const on = t.modules.includes(m.code);
                      return (
                        <button
                          key={m.code}
                          onClick={() => handleToggleLive(t.tenantId, m.code, !on)}
                          title={on ? 'Click to disable' : 'Click to enable'}
                          style={{
                            fontSize: 11.5,
                            padding: '2px 8px',
                            marginRight: 5,
                            marginBottom: 4,
                            borderRadius: 100,
                            cursor: 'pointer',
                            border: `1px solid ${on ? '#16A34A' : '#E2E8F0'}`,
                            background: on ? '#DCFCE7' : '#FFFFFF',
                            color: on ? '#16A34A' : '#64748B',
                          }}
                        >
                          {m.name}
                        </button>
                      );
                    })}
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: 13.5 }}>{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showCreate && (
          <div style={{ padding: 22, borderTop: '1px solid #E2E8F0' }}>
            <form onSubmit={handleCreate}>
              <Field label="Company name">
                <input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Legal name (optional, defaults to company name)">
                <input value={legalName} onChange={(e) => setLegalName(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Industry (optional)">
                <input value={industry} onChange={(e) => setIndustry(e.target.value)} style={inputStyle} placeholder="e.g. Distribution" />
              </Field>

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Services to enable</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxWidth: 480 }}>
                  {modules.map((m) => {
                    const on = selectedModules.includes(m.code);
                    return (
                      <div
                        key={m.code}
                        onClick={() => toggleModule(m.code)}
                        style={{
                          border: `1px solid ${on ? '#2563EB' : '#E2E8F0'}`,
                          background: on ? 'rgba(37,99,235,0.06)' : '#F8FAFC',
                          borderRadius: 4,
                          padding: '9px 12px',
                          fontSize: 12.5,
                          cursor: 'pointer',
                        }}
                      >
                        {m.name}
                      </div>
                    );
                  })}
                </div>
              </div>

              <Field label="Primary admin first name">
                <input required value={adminFirstName} onChange={(e) => setAdminFirstName(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Primary admin email">
                <input required type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} style={inputStyle} />
              </Field>

              <button type="submit" disabled={creating || selectedModules.length === 0} style={primaryBtn}>
                {creating ? 'Creating…' : 'Create account'}
              </button>
            </form>

            {createdResult && (
              <div style={{ marginTop: 18, padding: '14px 18px', border: '1px solid #16A34A', background: '#DCFCE7', borderRadius: 4, fontSize: 13 }}>
                Account created for <b>{createdResult.displayName}</b> (slug: <code>{createdResult.slug}</code>).<br />
                Temporary login for <b>{createdResult.admin.email}</b>:{' '}
                <code>{createdResult.admin.temporaryPassword}</code>
                <br />
                <span style={{ color: '#64748B' }}>
                  This is shown once. A production build would email this as a set-password link instead.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 8 };

const inputStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 360,
  fontSize: 13.5,
  padding: '9px 12px',
  border: '1px solid #E2E8F0',
  borderRadius: 3,
  background: '#F8FAFC',
  color: '#0F172A',
  boxSizing: 'border-box',
};

const accentBtn: React.CSSProperties = {
  background: '#2563EB',
  color: '#FFFFFF',
  border: 'none',
  fontWeight: 600,
  fontSize: 13,
  padding: '9px 16px',
  borderRadius: 3,
  cursor: 'pointer',
};

const primaryBtn: React.CSSProperties = {
  background: '#0F172A',
  color: '#FFFFFF',
  border: 'none',
  fontWeight: 600,
  fontSize: 13,
  padding: '10px 18px',
  borderRadius: 3,
  cursor: 'pointer',
};

const ghostBtn: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid #E2E8F0',
  color: '#0F172A',
  fontSize: 12.5,
  padding: '7px 13px',
  borderRadius: 3,
  cursor: 'pointer',
};
