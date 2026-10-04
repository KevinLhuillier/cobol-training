import { Download, FileText, Paperclip } from "lucide-react";
import { attachmentDownloadUrl, formatAttachmentSize } from "./attachment-size";
import type { AttachmentsBlockData } from "./types";

interface AttachmentsBlockViewProps {
    data: AttachmentsBlockData;
}

export function AttachmentsBlockView({ data }: AttachmentsBlockViewProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <p className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Paperclip className="h-4 w-4 text-slate-500" />
                {data.title?.trim() || (data.files.length > 1 ? "Attachments" : "Attachment")}
            </p>
            <ul className="space-y-2">
                {data.files.map((file) => (
                    <li key={file.id}>
                        <a
                            href={attachmentDownloadUrl(file.url, file.name)}
                            className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 hover:bg-slate-100 hover:border-slate-200 transition-colors"
                        >
                            <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="flex-1 min-w-0 truncate text-sm font-medium text-slate-900">{file.name}</span>
                            <span className="text-xs text-slate-400 shrink-0">{formatAttachmentSize(file.size)}</span>
                            <Download className="h-4 w-4 text-slate-400 group-hover:text-slate-900 shrink-0 transition-colors" />
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
