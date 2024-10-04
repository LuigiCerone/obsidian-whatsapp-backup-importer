import { App, Setting, Modal, Platform } from 'obsidian';
import { Importer } from './Importer';

declare global {
    interface Window {
        electron: any;
    }
}

export class InputModal extends Modal {
    outputLocation: string = '';
    inputArchivePath: string = '';
    importer: Importer;

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

        let outputLocation = new Setting(contentEl)
            .setName('Backup file to import')
            .setDesc('Pick the ZIP file that you want to import.')
            .addButton(button => button
                .setButtonText('Choose file')
                .onClick(async () => {
                    if (Platform.isDesktopApp) {
                        let properties = ['openFile', 'dontAddToRecent'];
                        let filePath: string[] = window.electron.remote.dialog.showOpenDialogSync({
                            title: 'Pick files to import', properties,
                            filters: [{ name: 'ZIP Files', extensions: ['zip'] }],
                        });

                        console.log(filePath);

                        if (filePath && filePath.length == 1) {
                        	this.inputArchivePath = filePath[0];
                        }
                    }
                }));
        
        if (outputLocation) {
            contentEl.createDiv('modal-button-container', el => {
                el.createEl('button', { cls: 'mod-cta', text: 'Import' }, el => {
                    el.addEventListener('click', async () => {
                        contentEl.empty();
                        this.importer = new Importer(this.app, this.inputArchivePath, this.outputLocation);

                        const spinnerDiv = contentEl.createDiv({ cls: "spinner-container" });

                        spinnerDiv.createDiv({ cls: "spinner" });
                        spinnerDiv.createEl('p', { cls: "spinner-message", text: "Wait while I import..." });
                        
                        try {
                            await this.importer.run();
                        }
                        finally {
                            this.close();
                        }
                    });
                });
            });
        }
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty(); // Clean up modal content on close
    }
}
