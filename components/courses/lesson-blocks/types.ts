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
    // Titre facultatif affiché centré au-dessus de l'image. Absent sur les blocs créés avant l'ajout
    // de ce champ : à traiter comme "pas de titre".
    caption?: string;
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

export type DividerShape = "line" | "dashed" | "dotted" | "double" | "dots";

export interface DividerBlockData {
    shape: DividerShape;
    // Espace (en px) ajouté au-dessus / en dessous du séparateur, en plus de l'espacement
    // standard entre deux blocs (cf. dividerSpacing dans divider-style.ts pour la validation).
    marginTop: number;
    marginBottom: number;
}

export interface DividerBlock {
    id: string;
    type: "divider";
    data: DividerBlockData;
}

export type LessonBlock = TextBlock | ImageBlock | CodeBlock | VideoBlock | CalloutBlock | DividerBlock;

export type LessonBlockType = LessonBlock["type"];
