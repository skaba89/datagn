import { NextRequest, NextResponse } from 'next/server';
import { isSafeUrl } from '@/lib/ssrf';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { dbUrl, dbTable, joins } = body;

        if (!dbUrl || !dbTable) {
            return NextResponse.json({ error: 'Paramètres dbUrl et dbTable requis. Format : postgresql://... ou mysql://...' }, { status: 400 });
        }

        if (!isSafeUrl(dbUrl)) {
            return NextResponse.json({ error: 'URL de connexion non autorisée (Protection réseau interne)' }, { status: 403 });
        }

        const isPostgres = dbUrl.startsWith('postgres');
        const isMysql = dbUrl.startsWith('mysql');

        // Prévention basique contre les injections
        const isValidName = (name: string) => /^[a-zA-Z0-9_.-]+$/.test(name);
        if (!isValidName(dbTable)) {
            return NextResponse.json({ error: 'Nom de table invalide.' }, { status: 400 });
        }

        // Construction de la requête avec Jointures (Star/Snowflake Schema)
        let query = `SELECT * FROM ${dbTable}`;
        if (Array.isArray(joins) && joins.length > 0) {
            joins.forEach((j: any) => {
                if (isValidName(j.toTable) && isValidName(j.col) && isValidName(j.toCol)) {
                    query += ` LEFT JOIN ${j.toTable} ON ${dbTable}.${j.col} = ${j.toTable}.${j.col}`;
                }
            });
        }
        query += ` LIMIT 2000`; // Augmentation de la limite pour BI

        if (isPostgres) {
            const { Client } = await import('pg');
            const client = new Client({ connectionString: dbUrl });
            await client.connect();
            const res = await client.query(query);
            await client.end();
            return NextResponse.json(res.rows);

        } else if (isMysql) {
            const mysql = await import('mysql2/promise');
            const connection = await mysql.createConnection(dbUrl);
            const [rows] = await connection.execute(query);
            await connection.end();
            return NextResponse.json(rows);
        } else {
            return NextResponse.json({ error: 'Protocole non supporté.' }, { status: 400 });
        }
    } catch (err: any) {
        // Zero-Trust Security: Scrub sensitive connection info from errors
        const safeErrorMsg = err.message ? err.message.replace(/postgresql:\/\/[^@]+@/gi, 'postgresql://***:***@').replace(/mysql:\/\/[^@]+@/gi, 'mysql://***:***@') : 'Erreur SQL indéterminée';
        console.error('[Fetch DB Route Error - Zero-Trust Guard]', safeErrorMsg);
        return NextResponse.json({ error: 'Erreur de connexion sécurisée ou requête invalide. Détails masqués pour des raisons de sécurité souveraine.' }, { status: 500 });
    }
}
