import { BlobReader, ZipReader } from '@zip.js/zip.js';

export async function readZip(file: string): Promise<void> {
	console.log('ehere')
    const reader = new ZipReader(new BlobReader(new Blob([file])));
    const entries = await reader.getEntries({ filenameEncoding: 'utf-8' });
    console.log(entries); // or handle entries as needed
}