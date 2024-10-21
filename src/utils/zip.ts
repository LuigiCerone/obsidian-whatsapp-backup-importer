import { promises as fs } from 'fs';
import { BlobReader, Entry, ZipReader, BlobWriter } from '@zip.js/zip.js';

export type CustomZipEntry = {
    path: string;
    content: Buffer | string;
};

export async function readZipEntries(path: string): Promise<CustomZipEntry[]> {

    // Read the file from the filesystem as a Buffer
    const buffer = await fs.readFile(path);

    const blob = new Blob([buffer]);

    const reader = new ZipReader(new BlobReader(blob));

    const entries = await reader.getEntries();

    return await mapEntries(entries)
}


async function mapToCustomZipEntry(entry: Entry): Promise<CustomZipEntry> {
    const blob = await entry.getData!(new BlobWriter());
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    if (entry.filename.endsWith('.txt')) {
        const textContent = new TextDecoder().decode(uint8Array);
        return {
            path: entry.filename,
            content: textContent
        };
    } else {
        return {
            path: entry.filename,
            content: Buffer.from(uint8Array)
        };
    }
}

async function mapEntries(entries: Entry[]): Promise<CustomZipEntry[]> {
    const mappedEntries = await Promise.all(
        entries.map(async (entry: Entry): Promise<CustomZipEntry> => {
            if (typeof entry.getData === 'function' && entry.filename) {
                return mapToCustomZipEntry(entry)
            } else {
                throw new Error(`Invalid entry: missing getData method or filename for entry: ${entry}`);
            }
        })
    );

    return mappedEntries;
}
