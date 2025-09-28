import "./styles/globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Metaverse Demo",
  description: "Multi-user metaverse demo with Next.js + Three"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
