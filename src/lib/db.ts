import { PrismaClient, Prisma } from '@prisma/client'

const prismaClientSingleton = () => {
    return new PrismaClient().$extends({
        model: {
            $allModels: {
                async findManyWithContext<T, A>(
                    this: T,
                    args: Prisma.Args<T, 'findMany'> & { context?: { workspaceId: string } }
                ) {
                    const { context, ...rest } = args as any;
                    const client = Prisma.getExtensionContext(this);
                    if (context?.workspaceId) {
                        await (client as any).$baseClient.$executeRawUnsafe(`SET app.current_workspace_id = '${context.workspaceId}'`);
                    } else {
                        await (client as any).$baseClient.$executeRawUnsafe(`SET app.current_workspace_id = ''`);
                    }
                    return (this as any).findMany(rest);
                },
            },
        },
    })
}

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
