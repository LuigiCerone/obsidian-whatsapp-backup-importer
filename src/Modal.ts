import { App, Notice, TextComponent, ButtonComponent, FuzzySuggestModal, TFile } from 'obsidian';

export class InputModal extends FuzzySuggestModal<TFile> {
    destination_file: TFile;
    extra_input_el: HTMLInputElement;

    constructor(app: App) {
        super(app);
    }

    getItems(): TFile[] {
        return this.app.vault.getFiles()
    }

    getItemText(item: TFile): string {
        return item.path;  // You can choose to show the file path or just the file name (item.name)
    }

    onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent) {
        // For example, open the file when it's selected
        // this.app.workspace.openLinkText(item.path, item.path, true);
        this.destination_file = item
    }

    onOpen() {
        const { contentEl } = this;

        // Create a new input element
        this.extra_input_el = contentEl.createEl("input", { type: "text" });
        this.extra_input_el.placeholder = "Enter additional text...";

        // Optionally add some styling
        this.extra_input_el.style.marginBottom = "10px";
        this.extra_input_el.style.width = "100%";
        this.extra_input_el.style.padding = "8px";

        // Insert the new input at the top of the modal, before the search box
        contentEl.prepend(this.extra_input_el);

        // Optionally, you can focus on the new input by default
        this.extra_input_el.focus();
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty(); // Clean up modal content on close
    }
}
