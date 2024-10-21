import { App, Setting, Modal, Platform, Notice } from 'obsidian';
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

    createSettingForOutputFolder(contentEl: HTMLElement) {
        new Setting(contentEl)
            .setName('Output folder')
            .setDesc('Choose a folder in the vault to put the imported files. Leave empty to output to vault root.')
            .addText(text => text
                .onChange(value => this.outputLocation = value));
    }

    createSettingForInputZipFile(contentEl: HTMLElement) {
        new Setting(contentEl)
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

                        if (filePath && filePath.length == 1) {
                            this.inputArchivePath = filePath[0];
                        }
                    }
                }));
    }

    showSpinner(contentEl: HTMLElement) {
        const spinnerDiv = contentEl.createDiv({ cls: "spinner-container" });
        spinnerDiv.createDiv({ cls: "spinner" });
        spinnerDiv.createEl('p', { cls: "spinner-message", text: "Wait while I import..." });
    }

    createSubmitButton(contentEl: HTMLElement) {
        contentEl.createDiv('modal-button-container', el => {
            el.createEl('button', { cls: 'mod-cta', text: 'Import' }, el => {
                el.addEventListener('click', async () => {
                    if (!this.inputArchivePath || ! this.outputLocation) {
                        new Notice('Please insert the required parameters');
                        return;
                    }

                    contentEl.empty();
                    this.showSpinner(contentEl)

                    this.importer = new Importer(this.app, this.inputArchivePath, this.outputLocation);

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

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        this.createSettingForOutputFolder(contentEl);

        this.createSettingForInputZipFile(contentEl);

        this.createSubmitButton(contentEl);
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
