import { SessionProvider } from "next-auth/react";
import { I18nProvider } from "@/i18n/I18nContext";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <I18nProvider>
            <ThemeProvider>
                <SessionProvider>
                    {children}
                </SessionProvider>
            </ThemeProvider>
        </I18nProvider>
    );
}
