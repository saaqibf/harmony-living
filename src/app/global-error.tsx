'use client';

export default function GlobalRootError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: '#F2E6E0', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#1c1b1b' }}>Something went wrong</h1>
          <button onClick={reset} style={{ padding: '0.625rem 1.25rem', background: '#1c1916', color: '#fff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
