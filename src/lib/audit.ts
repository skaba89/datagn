import prisma from './db';

export async function logAudit(userId: string, action: string, workspaceId: string, entityType: string, entityId?: string, metaJson?: any) {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                workspaceId,
                action,
                entityType,
                entityId,
                metaJson
            }
        });
    } catch (error) {
        console.error('[AUDIT_LOG_ERROR]', error);
    }
}

