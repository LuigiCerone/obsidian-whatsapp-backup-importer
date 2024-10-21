import { App, FileSystemAdapter, TFolder, Vault } from "obsidian";
import { CustomZipEntry, readZipEntries } from "./utils/zip";

import * as fs from 'fs';
import * as whatsapp from 'whatsapp-chat-parser';
import { CHAT_FILE_NAME, IMAGE_FOLDER_NAME, VIDEO_FOLDER_NAME } from "./utils/constant";
import { formatMessageToMarkdown, Message } from "./utils/format";

export class Importer {
	app: App;
	vault: Vault;

	outputLocation: string;
	inputArchivePath: string;

	outputFolder: TFolder | null;

	constructor(app: App, inputArchivePath: string, outputLocation: string) {
		this.app = app;
		this.inputArchivePath = inputArchivePath;
		this.outputLocation = outputLocation;
	}

	async run() {
		this.outputFolder = await this.getOutputFolder();

		const zipEntries = await readZipEntries(this.inputArchivePath)
		await this.copyDataInVault(zipEntries);
		await this.createVaultChatFile();
	}

	async createVaultChatFile() {
		let { vault } = this.app;

		const formattedFile: string = await this.formatChatFile();

		const path = `${this.outputFolder?.path}/clean_${CHAT_FILE_NAME}`;
		await vault.create(path, formattedFile);
	}

	async getOutputFolder(): Promise<TFolder | null> {
		let { vault } = this.app;

		let folderPath = this.outputLocation;
		if (folderPath === '') {
			folderPath = '/';
		}

		let folder = vault.getAbstractFileByPath(folderPath);

		if (folder === null || !(folder instanceof TFolder)) {
			await vault.createFolder(folderPath);
			folder = vault.getAbstractFileByPath(folderPath);
		}

		if (folder instanceof TFolder) {
			// Create nested folders for images and videos.
			await this.createNestedFolder(`${folderPath}/${IMAGE_FOLDER_NAME}`);
			await this.createNestedFolder(`${folderPath}/${VIDEO_FOLDER_NAME}`);
			return folder;
		}

		return null;
	}

	async createNestedFolder(fullFolderPath: string) {
		let { vault } = this.app;

		const folderExists = await this.app.vault.adapter.exists(fullFolderPath);

		if (!folderExists) {
			return vault.createFolder(fullFolderPath);
		}
	}

	async copyDataInVault(entries: CustomZipEntry[]) {
		let { vault } = this.app;

		for (let entry of entries) {
			let path: string = "";

			if (entry.path.endsWith('txt') && entry.path.toLowerCase().includes('chat')) {
				path = `${this.outputFolder?.path}/${CHAT_FILE_NAME}`;
				await vault.create(path, entry.content as string);

			} else if (entry.path.endsWith('jpg') || entry.path.endsWith('png')) {
				path = `${this.outputFolder?.path}/${IMAGE_FOLDER_NAME}/${entry.path}`;
				await vault.createBinary(path, entry.content as Buffer);

			} else if (entry.path.endsWith('mp4')) {
				path = `${this.outputFolder?.path}/${VIDEO_FOLDER_NAME}/${entry.path}`;
				await vault.createBinary(path, entry.content as Buffer);
			}
		}
	}

	async formatChatFile(): Promise<string> {
		const adapter = this.app.vault.adapter as FileSystemAdapter;

		const text = fs.readFileSync(`${adapter.getBasePath()}/${this.outputFolder?.path}/${CHAT_FILE_NAME}`, 'utf8');
		const messages = whatsapp.parseString(text, {
			parseAttachments: true
		}) as Message[];

		return messages.map(msg => formatMessageToMarkdown(this.outputFolder!, msg)).join('');
	}
}
