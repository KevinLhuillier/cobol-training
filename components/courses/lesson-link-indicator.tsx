"use client";

import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";

// À placer à l'intérieur d'un <Link> : remplace l'icône par un spinner tant que la navigation
// est en cours. Le changement de leçon ne modifie que le search param `lessonId`, donc aucun
// loading.js ne se déclenche — sans cet indicateur le clic n'a aucun retour visuel.
export function LessonLinkIndicator({ children }: { children: React.ReactNode }) {
    const { pending } = useLinkStatus();

    return pending ? <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> : <>{children}</>;
}
