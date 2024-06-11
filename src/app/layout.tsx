import "./globals.css";

import { ReactNode } from "react";
import Header from "@/src/components/Header";
import StytchProvider from "@/src/components/StytchProvider";
import { AccountProvider } from "../components/AccountContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <StytchProvider>
      <AccountProvider>
        <html lang="en">
          <title>Barclays Banking</title>
          <meta
            name="description"
            content="An demo Barclays bank application."
          />
          <body>
            <Header />
            <main>
              <div className="container">{children}</div>
            </main>
          </body>
        </html>
      </AccountProvider>
    </StytchProvider>
  );
}
