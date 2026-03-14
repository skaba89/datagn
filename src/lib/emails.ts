import { resend } from './resend';

export async function sendInvitationEmail(to: string, workspaceName: string, invitedBy: string) {
    try {
        await resend.emails.send({
            from: 'DataGN <noreply@datagn.com>',
            to,
            subject: `Invitation à rejoindre le Workspace ${workspaceName}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Bonjour !</h2>
                    <p><strong>${invitedBy}</strong> vous a invité à rejoindre le workspace <strong>${workspaceName}</strong> sur DataGN.</p>
                    <p>DataGN est la plateforme d'intelligence de données souveraine pour la Guinée.</p>
                    <div style="margin: 30px 0;">
                        <a href="${process.env.NEXTAUTH_URL}/login" style="background: #EDB025; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Accepter l'invitation
                        </a>
                    </div>
                    <p style="font-size: 12px; color: #666;">Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email.</p>
                </div>
            `
        });
    } catch (error) {
        console.error('[EMAIL_ERROR]', error);
    }
}

export async function sendAlertEmail(to: string, indicatorName: string, value: string, threshold: string) {
    try {
        await resend.emails.send({
            from: 'DataGN Alerte <alerts@datagn.com>',
            to,
            subject: `🚨 ALERTE CRITIQUE : ${indicatorName}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333; border: 2px solid #EF4444; border-radius: 12px;">
                    <h2 style="color: #EF4444;">Alerte de Seuil Dépassé</h2>
                    <p>L'indicateur <strong>${indicatorName}</strong> a atteint une valeur critique.</p>
                    <div style="background: #FEE2E2; padding: 16px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;">Valeur actuelle : <strong>${value}</strong></p>
                        <p style="margin: 5px 0;">Seuil configuré : <strong>${threshold}</strong></p>
                    </div>
                    <p>Veuillez vous connecter au dashboard pour analyser la situation.</p>
                    <div style="margin: 30px 0;">
                        <a href="${process.env.NEXTAUTH_URL}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Voir le Dashboard
                        </a>
                    </div>
                </div>
            `
        });
    } catch (error) {
        console.error('[EMAIL_ERROR]', error);
    }
}
