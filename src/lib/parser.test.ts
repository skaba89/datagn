import { describe, it, expect } from 'vitest';
import { parseCSV, detectCols, toCSV, Row } from './parser';

describe('parser.ts', () => {
    describe('parseCSV', () => {
        it('should correctly parse standard CSV with comma separator', () => {
            const csv = 'Name,Age,Active\nAlice,30,true\nBob,25,false';
            const result = parseCSV(csv);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ Name: 'Alice', Age: 30, Active: 'true' });
            expect(result[1]).toEqual({ Name: 'Bob', Age: 25, Active: 'false' });
        });

        it('should handle semicolons as separators', () => {
            const csv = 'Product;Price;Stock\nLaptop;1200;10\nPhone;800;50';
            const result = parseCSV(csv);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ Product: 'Laptop', Price: 1200, Stock: 10 });
        });

        it('should clean spaces around values and headers', () => {
            const csv = ' ID , Name \n 1 , Test \n 2 , Test 2 ';
            const result = parseCSV(csv);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ ID: 1, Name: 'Test' });
            expect(result[1]).toEqual({ ID: 2, Name: 'Test 2' });
        });
    });

    describe('detectCols', () => {
        it('should categorize columns correctly', () => {
            const data: Row[] = [
                { ID: '1', Name: 'Alice', Age: 30, Score: 95.5, Date: '2023-01-01', Status: 'Active' },
                { ID: '2', Name: 'Bob', Age: 25, Score: 88, Date: '2023-01-02', Status: 'Inactive' }
            ];

            const cols = detectCols(data);

            expect(cols.num).toContain('Age');
            expect(cols.num).toContain('Score');
            expect(cols.txt).toContain('Status');
            expect(cols.txt).toContain('ID');
            expect(cols.txt).toContain('Name');
        });
    });

    describe('toCSV', () => {
        it('should convert Rows array to CSV string', () => {
            const data: Row[] = [
                { Name: 'Alice', Age: 30 },
                { Name: 'Bob', Age: 25 }
            ];
            const csv = toCSV(data);

            expect(csv).toContain('Name,Age');
            expect(csv).toContain('Alice,30');
            expect(csv).toContain('Bob,25');
        });
    });
});
