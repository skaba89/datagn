// src/lib/ssrf.ts

export function isSafeUrl(urlString: string): boolean {
    try {
        const url = new URL(urlString);
        const host = url.hostname;

        // Bloquer localhost et les IPs internes en production
        if (process.env.NODE_ENV === 'production') {
            const forbiddenHosts = ['localhost', '127.0.0.1', '::1', '169.254.169.254'];
            if (forbiddenHosts.includes(host)) {
                return false;
            }

            // Bloquer les plages d'IP privées (10.x.x.x, 172.16.x.x - 172.31.x.x, 192.168.x.x)
            if (/^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(host)) {
                return false;
            }
        }

        return true;
    } catch {
        // Si l'URL ne peut pas être parsée, on la considère comme dangereuse
        return false;
    }
}
