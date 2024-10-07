import { promises as fs } from 'fs';
import { BlobReader, Entry, ZipReader } from '@zip.js/zip.js';

export async function readZip(path: string): Promise<Entry[]> {

    // Read the file from the filesystem as a Buffer
    const buffer = await fs.readFile(path);

    // Convert the Buffer to a Blob (which zip.js understands)
    const blob = new Blob([buffer]);

    const reader = new ZipReader(new BlobReader(blob));

    return await reader.getEntries();
}