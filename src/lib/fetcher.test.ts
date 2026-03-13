import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchGSheets, fetchAPI, fetchCSV, SourceConfig } from './fetcher';
import { Row } from './parser';

describe('fetcher.ts', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('fetchGSheets', () => {
        it('should throw an error if URL is missing', async () => {
            const cfg: SourceConfig = {};
            await expect(fetchGSheets(cfg)).rejects.toThrow('URL Google Sheets manquante');
        });

        it('should normalize and fetch Google Sheets URL', async () => {
            const mockCsv = 'Name,Age\nAlice,30\nBob,25';
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                text: async () => mockCsv,
            });

            const cfg: SourceConfig = { url: 'https://docs.google.com/spreadsheets/d/123XYZ/edit#gid=0' };
            const result = await fetchGSheets(cfg);

            expect(global.fetch).toHaveBeenCalledWith(
                'https://docs.google.com/spreadsheets/d/123XYZ/export?format=csv&gid=0',
                { cache: 'no-store' }
            );
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ Name: 'Alice', Age: 30 });
        });
    });

    describe('fetchAPI', () => {
        it('should throw an error if endpoint is missing', async () => {
            const cfg: SourceConfig = {};
            await expect(fetchAPI(cfg)).rejects.toThrow('URL de l\'endpoint manquante');
        });

        it('should fetch and parse standard JSON array', async () => {
            const mockJson = [
                { id: 1, name: 'Test 1' },
                { id: 2, name: 'Test 2' }
            ];

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => mockJson,
            });

            const cfg: SourceConfig = { endpoint: 'https://api.example.com/data' };
            const result = await fetchAPI(cfg);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ id: 1, name: 'Test 1' });
        });

        it('should add Authorization header if apiKey is provided', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => [{ id: 1 }],
            });

            const cfg: SourceConfig = { endpoint: 'https://api.example.com/data', apiKey: 'secret_token' };
            await fetchAPI(cfg);

            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.example.com/data',
                {
                    headers: { Authorization: 'Bearer secret_token' },
                    cache: 'no-store'
                }
            );
        });
    });

    describe('fetchCSV', () => {
        it('should read File object and parse CSV', async () => {
            const mockCsv = 'Name,Score\nAlice,95\nBob,80';
            const mockFile = {
                text: async () => mockCsv
            } as any as File;

            const result = await fetchCSV(mockFile);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ Name: 'Alice', Score: 95 });
        });
    });
});
