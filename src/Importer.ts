import { App, Notice, TFolder, Vault } from "obsidian";
import { readZip } from "./utils/zip";

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

        readZip(this.inputArchivePath)
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
			return folder;
		}

		return null;
	}

}