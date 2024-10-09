import { App, Notice, TFolder, Vault } from "obsidian";
import { CustomZipEntry, readZip } from "./utils/zip";


const IMAGE_FOLDER: string = "images"
const VIDEO_FOLDER: string = "videos"

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

		if (!this.outputFolder) {
			new Notice('Please select a location to export to.');
			return;
		}

        const zipEntries = await readZip(this.inputArchivePath)

		await this.copyDataInVault(zipEntries);
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
			await this.createNestedFolder(`${folderPath}/${IMAGE_FOLDER}`);
			await this.createNestedFolder(`${folderPath}/${VIDEO_FOLDER}`);
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

		for (let entry of entries){
			let path: string = ""
			if (entry.path.endsWith('jpg')) {
				path = `${this.outputFolder?.path}/${IMAGE_FOLDER}/${entry.path}`
			} else if (entry.path.endsWith('mp4')) {
				path = `${this.outputFolder?.path}/${VIDEO_FOLDER}/${entry.path}`
			}

            await vault.createBinary(path, entry.content);
		}
	}
}