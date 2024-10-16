import { App, FileSystemAdapter, Notice, TFolder, Vault } from "obsidian";
import { CustomZipEntry, readZip } from "./utils/zip";

import * as fs from 'fs';
import * as whatsapp from 'whatsapp-chat-parser';

const IMAGE_FOLDER_NAME: string = "images"
const VIDEO_FOLDER_NAME: string = "videos"
const CHAT_FILE_NAME: string = "chats.md";

type Message = {
	author: string;
	date: Date;
	message: string;
	attachment?: { fileName: string };
}

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
		let { vault } = this.app;

        this.outputFolder = await this.getOutputFolder();

		if (!this.outputFolder) {
			new Notice('Please select a location to export to.');
			return;
		}

        const zipEntries = await readZip(this.inputArchivePath)

		await this.copyDataInVault(zipEntries);
		const formattedFile: string = await this.processChatFile();
		console.log(formattedFile);

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
			// Create nested folder for images and videos.
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

	formatMessageToMarkdown(msg: Message): string {
		const formattedDate = msg.date.toLocaleString('it-IT', {
			weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
		  });
	  
		  // If the message contains the attachment filename, remove it from the message text
		  let messageText = msg.message;
		  if (msg.attachment && msg.message.includes(msg.attachment.fileName)) {
			messageText = messageText.replace(msg.attachment.fileName, '').trim();
		  }
	  
		  let markdown = `### ${msg.author} - ${formattedDate}\n\n`;
		  markdown += `${messageText}\n`;
	  
		  // If there's an attachment, create a link to it if it's a jpg or mp4
		  if (msg.attachment) {
			const fileName = msg.attachment.fileName;
			if (fileName.endsWith('.jpg')) {
			  markdown += `\n**Attachment:** ![${fileName}](${this.outputFolder?.path}/${IMAGE_FOLDER_NAME}/${fileName})\n`;
			} else if (fileName.endsWith('.mp4')) {
				markdown += `\n**Attachment:** ![${fileName}](${this.outputFolder?.path}/${VIDEO_FOLDER_NAME}/${fileName})\n`;
			} else {
			  markdown += `\n**Attachment:** ${fileName}\n`;
			}
		  }
	  
		  markdown += '\n---\n';  // Add a separator between messages
		  return markdown;
	}

	async processChatFile(): Promise<string> {
		const adapter = this.app.vault.adapter as FileSystemAdapter;

		const text = fs.readFileSync(`${adapter.getBasePath()}/${this.outputFolder?.path}/${CHAT_FILE_NAME}`, 'utf8');
		const messages = whatsapp.parseString(text, {
			parseAttachments: true
		}) as Message[];

		return messages.map(msg => this.formatMessageToMarkdown(msg)).join('');
	}
}