import { PageLoader } from "@/components/page-loader";

// Le lecteur de cours s'affiche en plein écran sur fond slate-100 (cf. DashboardLayoutWrapper) :
// le fallback reprend le même fond pour éviter un flash blanc à l'entrée dans un cours.
export default function Loading() {
    return <PageLoader fullScreen className="bg-slate-100" />;
}
