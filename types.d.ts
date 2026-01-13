declare module 'pdf2json' {
    import { EventEmitter } from 'events';

    export default class PDFParser extends EventEmitter {
        constructor(context?: any, needRawText?: number);
        parseBuffer(buffer: Buffer): void;
        getRawTextContent(): string;
    }
}
