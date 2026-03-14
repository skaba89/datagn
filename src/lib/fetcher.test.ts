import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchGSheets, fetchKobo, fetchAPI, fetchCSV, normalizeGSheetsUrl } from './fetcher';

// Mock global fetch
global.fetch = vi.fn();

describe('fetcher.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('normalizeGSheetsUrl', () => {
    it('should extract ID and convert to CSV export URL', () => {
      const url = 'https://docs.google.com/spreadsheets/d/abc123456/edit';
      const result = normalizeGSheetsUrl(url);
      expect(result).toBe('https://docs.google.com/spreadsheets/d/abc123456/export?format=csv&gid=0');
    });

    it('should preserve gid parameter if present', () => {
      const url = 'https://docs.google.com/spreadsheets/d/abc123456/edit?gid=12345';
      const result = normalizeGSheetsUrl(url);
      expect(result).toContain('gid=12345');
    });

    it('should throw error for invalid URL', () => {
      expect(() => normalizeGSheetsUrl('https://invalid-url.com')).toThrow(
        'ID de feuille introuvable'
      );
    });

    it('should return URL as-is if already an export URL', () => {
      const url = 'https://docs.google.com/spreadsheets/d/abc/export?format=csv';
      const result = normalizeGSheetsUrl(url);
      expect(result).toBe(url);
    });
  });

  describe('fetchGSheets', () => {
    it('should fetch and parse CSV from Google Sheets', async () => {
      const mockCsv = 'Name,Age\nAlice,30\nBob,25';
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockCsv),
      });

      const result = await fetchGSheets({
        url: 'https://docs.google.com/spreadsheets/d/abc123/edit',
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ Name: 'Alice', Age: 30 });
      expect(result[1]).toEqual({ Name: 'Bob', Age: 25 });
    });

    it('should throw error if URL is missing', async () => {
      await expect(fetchGSheets({})).rejects.toThrow('URL Google Sheets manquante');
    });

    it('should throw error if sheet is not public', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<!DOCTYPE html><html>...</html>'),
      });

      await expect(
        fetchGSheets({ url: 'https://docs.google.com/spreadsheets/d/abc/edit' })
      ).rejects.toThrow("n'est pas publiée");
    });

    it('should throw error on HTTP error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(
        fetchGSheets({ url: 'https://docs.google.com/spreadsheets/d/abc/edit' })
      ).rejects.toThrow('Erreur 404');
    });
  });

  describe('fetchKobo', () => {
    it('should fetch and clean KoboToolbox data', async () => {
      const mockData = {
        results: [
          { 'group/field1': 'value1', 'group/field2': 42, '_uuid': 'skip-me' },
          { 'group/field1': 'value2', 'group/field2': 24 },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchKobo({
        token: 'test-token',
        formId: 'test-form',
      });

      expect(result).toHaveLength(2);
      expect(result[0]['field1']).toBe('value1');
      expect(result[0]['field2']).toBe(42);
      // Should not have _uuid (starts with _)
      expect(result[0]['_uuid']).toBeUndefined();
    });

    it('should throw error if token is missing', async () => {
      await expect(fetchKobo({ formId: 'test' })).rejects.toThrow(
        'Token API KoboToolbox manquant'
      );
    });

    it('should throw error if formId is missing', async () => {
      await expect(fetchKobo({ token: 'test' })).rejects.toThrow(
        'ID de formulaire KoboToolbox manquant'
      );
    });
  });

  describe('fetchAPI', () => {
    it('should fetch and normalize API data', async () => {
      const mockData = {
        data: [
          { id: 1, name: 'Item 1', price: 100 },
          { id: 2, name: 'Item 2', price: 200 },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchAPI({
        endpoint: 'https://api.example.com/items',
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 1, name: 'Item 1', price: 100 });
    });

    it('should handle array response directly', async () => {
      const mockData = [{ id: 1 }, { id: 2 }];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchAPI({
        endpoint: 'https://api.example.com/items',
      });

      expect(result).toHaveLength(2);
    });

    it('should handle results wrapper', async () => {
      const mockData = {
        results: [{ id: 1 }],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchAPI({
        endpoint: 'https://api.example.com/items',
      });

      expect(result).toHaveLength(1);
    });

    it('should add Authorization header if apiKey provided', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      await fetchAPI({
        endpoint: 'https://api.example.com/items',
        apiKey: 'my-api-key',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/items',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-api-key',
          }),
        })
      );
    });

    it('should preserve Bearer prefix if already present', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      await fetchAPI({
        endpoint: 'https://api.example.com/items',
        apiKey: 'Bearer my-token',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/items',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-token',
          }),
        })
      );
    });

    it('should throw error for empty response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await expect(
        fetchAPI({ endpoint: 'https://api.example.com/items' })
      ).rejects.toThrow('Réponse API vide');
    });
  });

  describe('fetchCSV', () => {
    it('should parse CSV file content', async () => {
      const csvContent = 'Name,Age,Active\nAlice,30,true\nBob,25,false';
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

      const result = await fetchCSV(file);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ Name: 'Alice', Age: 30, Active: 'true' });
      expect(result[1]).toEqual({ Name: 'Bob', Age: 25, Active: 'false' });
    });

    it('should handle semicolon separator', async () => {
      const csvContent = 'Name;Age\nAlice;30\nBob;25';
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

      const result = await fetchCSV(file);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ Name: 'Alice', Age: 30 });
    });

    it('should handle tab separator', async () => {
      const csvContent = 'Name\tAge\nAlice\t30\nBob\t25';
      const file = new File([csvContent], 'test.tsv', { type: 'text/tsv' });

      const result = await fetchCSV(file);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ Name: 'Alice', Age: 30 });
    });

    it('should add source file metadata', async () => {
      const csvContent = 'Name,Age\nAlice,30';
      const file = new File([csvContent], 'data_2024-01.csv', { type: 'text/csv' });

      const result = await fetchCSV(file);

      expect(result[0]['_source_file']).toBe('data_2024-01.csv');
    });

    it('should detect period from filename', async () => {
      const csvContent = 'Name,Age\nAlice,30';
      const file = new File([csvContent], 'data_2024-01_janvier.csv', { type: 'text/csv' });

      const result = await fetchCSV(file);

      expect(result[0]['_period']).toBeDefined();
    });

    it('should handle multiple files', async () => {
      const csv1 = 'Name,Age\nAlice,30';
      const csv2 = 'Name,Age\nBob,25';
      const file1 = new File([csv1], 'file1.csv', { type: 'text/csv' });
      const file2 = new File([csv2], 'file2.csv', { type: 'text/csv' });

      const result = await fetchCSV([file1, file2]);

      expect(result).toHaveLength(2);
    });

    it('should throw error for empty file', async () => {
      const file = new File([''], 'empty.csv', { type: 'text/csv' });

      await expect(fetchCSV(file)).rejects.toThrow('vide');
    });
  });
});
