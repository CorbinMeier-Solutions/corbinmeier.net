// Last-resort fallback. Deliberately styled with literal inline values rather
// than Tailwind classes or theme custom properties: if the failure being
// caught is itself a stylesheet problem, anything that reads from the design
// tokens would render invisibly and we would be back to a blank page.
export default function RootFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#0a0e17',
        color: '#c9d1d9',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      }}
    >
      <p style={{ fontSize: '1.125rem' }}>This page failed to load in your browser.</p>
      <p style={{ color: '#8b96a5' }}>
        Reloading may fix it. If it keeps happening, email{' '}
        <a href="mailto:corbinmeier.solutions@gmail.com" style={{ color: '#3b82f6' }}>
          corbinmeier.solutions@gmail.com
        </a>{' '}
        with your device and browser version.
      </p>
    </div>
  );
}
