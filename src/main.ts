import { Notice, Plugin } from 'obsidian';
import { InputModal } from 'src/Modal';

export default class WhatsappBackupPlugin extends Plugin {

	async onload() {

		this.addCommand({
			id: 'open-whatsapp-backup-importer',
			name: 'Open Whatsapp backup importer',
			callback: () => {
				new InputModal(this.app).open();
			}
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {}
}
