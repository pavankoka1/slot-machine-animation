import "./globals.css";

export const metadata = {
  title: "Slot Machine Animation",
  description: "WebGL slot machine animation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

