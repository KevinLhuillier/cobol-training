import { Preview } from "@/components/preview";
import { imageSizeClassName } from "./image-size";
import { CodeBlockView } from "./code-block-view";
import { VideoBlockView } from "./video-block-view";
import { CalloutBlockView } from "./callout-block-view";
import { DividerBlockView } from "./divider-block-view";
import type { LessonBlock } from "./types";

interface LessonBlocksViewProps {
    blocks: LessonBlock[];
}

export function LessonBlocksView({ blocks }: LessonBlocksViewProps) {
    return (
        <div className="space-y-6">
            {blocks.map((block) => {
                switch (block.type) {
                    case "text":
                        return <Preview key={block.id} value={block.data.html} />;
                    case "image":
                        if (!block.data.url) return null;
                        return (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                key={block.id}
                                src={block.data.url}
                                alt={block.data.alt}
                                className={`block mx-auto rounded-2xl ${imageSizeClassName(block.data.size)}`}
                            />
                        );
                    case "code":
                        if (!block.data.code) return null;
                        return <CodeBlockView key={block.id} code={block.data.code} language={block.data.language} />;
                    case "video":
                        if (!block.data.url) return null;
                        return <VideoBlockView key={block.id} url={block.data.url} />;
                    case "callout":
                        if (!block.data.title && !block.data.content) return null;
                        return <CalloutBlockView key={block.id} data={block.data} />;
                    case "divider":
                        return <DividerBlockView key={block.id} data={block.data} />;
                    default:
                        return null;
                }
            })}
        </div>
    );
}
