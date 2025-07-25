import { supabase } from "./supabase";

export interface PlatformStats {
  activeSpreaders: number;
  ideasShared: number;
  livesReached: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    console.log("Fetching platform stats...");

    // Get active spreaders (users who have shared at least one idea)
    // Note: Using 'idea' table since that's what's defined in database.types.ts
    // Get count of unique referrers
    const { count: uniqueReferrers, error: referrersError } = await supabase
      .from("spread_chain")
      .select("referrer_id", { count: "exact", head: true })
      .not('referrer_id', 'is', null);

    console.log("Number of unique referrers:", uniqueReferrers);
    // Get count of users who have shared at least one idea
    // const { count: activeSpreaders, error: activeSpreadersError } =
    //   await supabase
    //     .from("idea")
    //     .select('user_id', { count: 'exact', head: true })
    //     .not('user_id', 'is', null);

    // console.log("Active spreaders query:", {
    //   activeSpreaders,
    //   activeSpreadersError,
    // });

    // Get total ideas shared
    const { count: ideasShared, error: ideasSharedError } = await supabase
      .from("idea")
      .select("*", { count: "exact", head: true });

    console.log("Ideas shared query:", { ideasShared, ideasSharedError });

    // Get total lives reached (sum of reach from all ideas)
    const { count: reachData, error: reachError } = await supabase
      .from("spread_chain")
      .select("referred_email", {count: "exact", head: true});

    console.log("Reach data query:", { reachData, reachError });

    // const livesReached =
    //   reachData?.reduce((sum, idea) => {
    //     const reach = Number(idea.reach) || 0;
    //     console.log("Processing idea reach:", { ideaId: idea.id, reach });
    //     return sum + reach;
    //   }, 0) || 0;

    console.log("Calculated lives reached:", reachData);

    const result = {
      activeSpreaders: uniqueReferrers || 0,
      ideasShared: ideasShared || 0,
      livesReached: reachData || 0,
    };

    console.log("Final stats result:", result);
    return result;
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    // Return default values in case of error
    return {
      activeSpreaders: 0,
      ideasShared: 0,
      livesReached: 0,
    };
  }
}
