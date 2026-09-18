import { Award, Trophy, Medal, Star, Shield, Crown, Zap, Flame, Sparkles, Gem, type LucideIcon } from "lucide-react";

// Choix volontairement restreint : un simple <select> admin plutôt qu'un uploader d'image
// (cf. components/courses/course-image-form.tsx pour l'alternative "URL libre", jugée trop
// lourde pour un badge qui n'a besoin que d'un pictogramme).
export const BADGE_ICONS: Record<string, LucideIcon> = {
    Award,
    Trophy,
    Medal,
    Star,
    Shield,
    Crown,
    Zap,
    Flame,
    Sparkles,
    Gem,
};

export const BADGE_ICON_NAMES = Object.keys(BADGE_ICONS);

export function BadgeIcon({ icon, className }: { icon: string; className?: string }) {
    const Icon = BADGE_ICONS[icon] || Award;
    return <Icon className={className} />;
}
