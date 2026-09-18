export interface TextBlockData {
    html: string;
}

export interface TextBlock {
    id: string;
    type: "text";
    data: TextBlockData;
}

export type ImageBlockSize = "small" | "medium" | "large" | "full";

export interface ImageBlockData {
    url: string;
    alt: string;
    // Absent sur les blocs créés avant l'ajout de ce réglage : à traiter comme "full"
    // partout où ce champ est lu (cf. imageSizeClassName dans image-size.ts).
    size?: ImageBlockSize;
}

export interface ImageBlock {
    id: string;
    type: "image";
    data: ImageBlockData;
}

export type CodeBlockLanguage = "cobol" | "jcl" | "sql" | "json";

export interface CodeBlockData {
    code: string;
    language: CodeBlockLanguage;
}

export interface CodeBlock {
    id: string;
    type: "code";
    data: CodeBlockData;
}

export interface VideoBlockData {
    url: string;
}

export interface VideoBlock {
    id: string;
    type: "video";
    data: VideoBlockData;
}

export type CalloutVariant = "info" | "warning" | "error" | "success";

export type CalloutAlign = "left" | "center";

export interface CalloutBlockData {
    variant: CalloutVariant;
    title: string;
    content: string;
    // Absent sur les blocs créés avant l'ajout de ce réglage : à traiter comme "left"
    // partout où ce champ est lu (cf. calloutAlignClassName dans callout-style.ts).
    align?: CalloutAlign;
}

export interface CalloutBlock {
    id: string;
    type: "callout";
    data: CalloutBlockData;
}

export type LessonBlock = TextBlock | ImageBlock | CodeBlock | VideoBlock | CalloutBlock;

export type LessonBlockType = LessonBlock["type"];
