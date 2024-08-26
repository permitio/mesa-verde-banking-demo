import "./globals.css";

import { ReactNode } from "react";
import Header from "@/src/components/Header";
import StytchProvider from "@/src/components/StytchProvider";
import { AccountProvider } from "../components/AccountContext";
import { AbilityLoader } from "../components/AbilityContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <StytchProvider>
      <AccountProvider>
        <AbilityLoader>
          <html lang="en">
            <title>Mesa Verde Bank</title>
            <meta
              name="description"
              content="Banking application that demonstrate fintech fine-grained access control features."
            />
            <body>
              <Header />
              <main>
                <div className="container">{children}</div>
              </main>
            </body>
          </html>
        </AbilityLoader>
      </AccountProvider>
    </StytchProvider>
  );
}
