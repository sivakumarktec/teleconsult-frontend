import "./globals.css";

export const metadata = {
  title: "TeleConsult - Video Consultation Platform",
  description: "Professional healthcare video consultations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
