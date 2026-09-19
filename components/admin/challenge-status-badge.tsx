import { Badge } from "@/components/ui/badge";
import { todayIsoDate } from "@/components/challenges/types";

interface ChallengeStatusBadgeProps {
    isPublished: boolean;
    startsAt: string;
    // Vrai pour le challenge actuellement mis en avant côté étudiants ("challenge de la semaine")
    isFeatured?: boolean;
    className?: string;
}

// Draft = jamais visible ; Scheduled = publié mais date de début pas encore atteinte ;
// Published = visible dans l'historique ; This week = visible et mis en avant.
export function ChallengeStatusBadge({ isPublished, startsAt, isFeatured = false, className = "" }: ChallengeStatusBadgeProps) {
    let label = "Draft";
    let color = "bg-amber-100 text-amber-700 hover:bg-amber-100";

    if (isPublished && startsAt > todayIsoDate()) {
        label = "Scheduled";
        color = "bg-blue-100 text-blue-700 hover:bg-blue-100";
    } else if (isPublished && isFeatured) {
        label = "This week";
        color = "bg-purple-100 text-purple-700 hover:bg-purple-100";
    } else if (isPublished) {
        label = "Published";
        color = "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
    }

    return <Badge className={`border-none ${color} ${className}`}>{label}</Badge>;
}
