import { App, Setting, Modal, Platform } from 'obsidian';

export class InputModal extends Modal {
    selectedId: number = 0;
    outputLocation: string;

    constructor(app: App) {
		super(app);
		this.titleEl.setText('Import Whatsapp backup into Obsidian');
		this.modalEl.addClass('mod-importer');
	}

    onOpen() {
        const { contentEl } = this;
		contentEl.empty();


        new Setting(contentEl)
			.setName('Output folder')
			.setDesc('Choose a folder in the vault to put the imported files. Leave empty to output to vault root.')
			.addText(text => text
				.onChange(value => this.outputLocation = value));
        
        let fileLocationSetting = new Setting(contentEl)
			.setName('Backup file to import')
			.setDesc('Pick the file that you want to import.')
			.addButton(button => button
				.setButtonText('Choose file')
				.onClick(async () => {
					if (Platform.isDesktopApp) {
						let properties = ['openFile', 'dontAddToRecent'];
						let filePaths: string[] = window.electron.remote.dialog.showOpenDialogSync({
							title: 'Pick files to import', properties,
							filters: [{ extensions: ['zip'] }],
						});

						// if (filePaths && filePaths.length > 0) {
						//	this.files = filePaths.map((filepath: string) => new NodePickedFile(filepath));
						//	updateFiles();
						//}
					}
				}));
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty(); // Clean up modal content on close
    }
}
