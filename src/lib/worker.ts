// Web Worker for Data Processing
import { buildViz, detectCols, Row } from './parser';

self.onmessage = (e: MessageEvent) => {
    const { data, type } = e.data;

    if (type === 'PROCESS_DATA') {
        try {
            const targets = e.data.targets || {};
            const cols = detectCols(data);
            const viz = buildViz(data, cols, targets);
            self.postMessage({ type: 'SUCCESS', viz, cols });
        } catch (err) {
            self.postMessage({ type: 'ERROR', error: String(err) });
        }
    }
};
