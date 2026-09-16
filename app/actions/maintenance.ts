"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

/**
 * Lit l'état actuel du mode maintenance (ligne singleton app_settings, id=1).
 */
export async function getMaintenanceMode(): Promise<boolean> {
    const supabase = await createClient();

    const { data } = await supabase
        .from("app_settings")
        .select("maintenance_mode")
        .eq("id", 1)
        .single();

    return data?.maintenance_mode ?? false;
}

/**
 * Active/désactive le mode maintenance pour tout le site (cf. proxy.ts, qui lit ce même flag
 * à chaque requête). Réservé aux admins.
 */
export async function setMaintenanceMode(enabled: boolean) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "ADMIN") throw new Error("Forbidden");

    const { error } = await supabase
        .from("app_settings")
        .update({ maintenance_mode: enabled })
        .eq("id", 1);

    if (error) throw new Error("Failed to update maintenance mode.");

    revalidatePath("/dashboard/admin");

    return { maintenanceMode: enabled };
}
