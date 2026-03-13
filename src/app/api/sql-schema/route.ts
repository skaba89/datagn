import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import mysql from 'mysql2/promise';
import { isSafeUrl } from '@/lib/ssrf';

export async function POST(req: NextRequest) {
    try {
        const { dbUrl } = await req.json();
        if (!dbUrl) return NextResponse.json({ error: 'URL manquante' }, { status: 400 });

        if (!isSafeUrl(dbUrl)) {
            return NextResponse.json({ error: 'URL de connexion non autorisée (Protection réseau interne)' }, { status: 403 });
        }

        const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
        const isMysql = dbUrl.startsWith('mysql://');

        if (isPostgres) {
            const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
            const { rows: tables } = await pool.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            `);

            const schema: any = {};
            for (const t of tables) {
                const { rows: cols } = await pool.query(`
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = '${t.table_name}'
                `);

                // Détection des Clés Étrangères pour suggérer des jointures (Analytic Schema)
                const { rows: fks } = await pool.query(`
                    SELECT kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name 
                    FROM information_schema.key_column_usage AS kcu
                    JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = kcu.constraint_name
                    WHERE kcu.table_name = '${t.table_name}'
                `);

                schema[t.table_name] = {
                    columns: cols.map((c: any) => ({ name: c.column_name, type: c.data_type })),
                    joins: fks.map((f: any) => ({ col: f.column_name, toTable: f.foreign_table_name, toCol: f.foreign_column_name }))
                };
            }
            await pool.end();
            return NextResponse.json({ tables: schema });
        }

        if (isMysql) {
            const connection = await mysql.createConnection(dbUrl);
            const [tableRows]: any = await connection.execute('SHOW TABLES');
            const tableNames = tableRows.map((r: any) => Object.values(r)[0]);

            const schema: any = {};
            for (const t of tableNames) {
                const [cols]: any = await connection.execute(`DESCRIBE ${t}`);
                schema[t] = cols.map((c: any) => ({ name: c.Field, type: c.Type }));
            }
            await connection.end();
            return NextResponse.json({ tables: schema });
        }

        return NextResponse.json({ error: 'Dialecte non supporté ou URL invalide' }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
