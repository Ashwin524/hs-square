export const metadata = {
  title: 'HS-Square Technologies',
  description: 'CRM + ERP platform admin',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#F8FAFC' }}>
        {children}
      </body>
    </html>
  );
}
