import { Notice, Plugin } from 'obsidian';
import { InputModal } from 'src/Modal';

export default class WhatsappBackupPlugin extends Plugin {

	async onload() {

		this.addCommand({
			id: 'open-whatsapp-backup-importer',
			name: 'Import whatsapp backup',
			callback: () => {
				new InputModal(this.app).open();
			}
		});
	}

	onunload() {}
}
