import { TFolder } from "obsidian";
import { IMAGE_FOLDER_NAME, VIDEO_FOLDER_NAME } from "./constant";

export type Message = {
    author: string;
    date: Date;
    message: string;
    attachment?: { fileName: string };
}

const DEFAULT_MESSAGE_SEPARATOR = '\n---\n';

function formatDate(msg: Message): string {
    return msg.date.toLocaleString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

function cleanMessageHeader(msg: Message): string {
    const formattedDate: string = formatDate(msg);
    return `### ${msg.author} - ${formattedDate}\n\n`;
}

function cleanMessageBody(msg: Message): string {
    let messageText: string = msg.message;
    if (msg.attachment && msg.message.includes(msg.attachment.fileName)) {
        messageText = messageText.replace(msg.attachment.fileName, '').trim();
    }

    return messageText;
}

function handleAttachmentLink(outputFolder: TFolder, msg: Message): string {
    let link: string = "";
    const fileName = msg.attachment!.fileName;
    if (fileName.endsWith('.jpg')) {
        link = `\n**Attachment:** ![${fileName}](${outputFolder!.path}/${IMAGE_FOLDER_NAME}/${fileName})\n`;
    } else if (fileName.endsWith('.mp4')) {
        link = `\n**Attachment:** ![${fileName}](${outputFolder!.path}/${VIDEO_FOLDER_NAME}/${fileName})\n`;
    } else {
        link = `\n**Attachment:** ${fileName}\n`;
    }

    return link;
}

export function formatMessageToMarkdown(outputFolder: TFolder, msg: Message): string {
    let markdown: string = "";

    markdown += `${cleanMessageHeader(msg)}`;
    markdown += `${cleanMessageBody(msg)}\n`;

    if (msg.attachment) {
        markdown += handleAttachmentLink(outputFolder, msg)
    }

    markdown += DEFAULT_MESSAGE_SEPARATOR;

    return markdown;
}
