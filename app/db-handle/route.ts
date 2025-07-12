import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

// ✅ Create Profile
export async function createProfile(user: any) {
  if (!user) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase.from("profiles").insert([
    {
      user_id: user.id,
      name: user.name || "",
      email: user.email || "",
      avatar_url: "",
    },
  ]);

  if (error) {
    console.error("Error creating profile:", error.message);
    throw error;
  }

  console.log("Profile created:", data);
  return data;
}

// ✅ Create Idea
export async function createIdea(
  title: string,
  description: string,
  category: string,
  is_public: boolean = false,
  file_urls: string[] = []
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("idea")
    .insert([
      {
        user_id: user.id,
        title,
        category,
        description,
        is_public,
        views: 0,
        file_urls,
      },
    ])
    .select();

  if (error) {
    console.error("Error creating idea:", error.message);
    throw error;
  }

  // console.log("Idea created:", data[0]);
  return data[0];
}

// ✅ Create Spread Chain
export async function createSpreadChain(
  ideaId: string,
  referrerId: string | null = null,
  email: string
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User not authenticated");
  }

  // console.log(
  //   ideaId,
  //   "--------------------------",
  //   email,
  //   "-------------------------"
  // );
  const { data, error } = await supabase.from("spread_chain").insert([
    {
      idea_id: ideaId,
      referred_email: email,
      referrer_id: referrerId, // nullable for original creator
      status: "pending",
    },
  ]);

  if (error) {
    console.error("Error creating spread_chain entry:", error.message);
    throw error;
  }

  // console.log("Spread chain created:", data);
  return data;
}

export async function getIdea(userId: string) {
  const { data, error } = await supabase
    .from("idea")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error(error.message);
    throw error;
  }

  if (!data) {
    console.error("No Data returned");
    return;
  }

  console.log(`Data fetched for user ${userId}: `, data);
  return data;
}

export async function getIdeaStats(ideaId: string) {
  try {
    // 👁️ Fetch views directly from idea table
    const { data: ideaData, error: ideaError } = await supabase
      .from("idea")
      .select("views")
      .eq("id", ideaId)
      .single();

    if (ideaError) throw ideaError;

    // 🔁 Count referrals
    const { count: referralsCount, error: referralsError } = await supabase
      .from("spread_chain")
      .select("*", { count: "exact", head: true })
      .eq("idea_id", ideaId);

    if (referralsError) throw referralsError;

    // 🌍 Count unique reach
    const { data: reachData, error: reachError } = await supabase
      .from("spread_chain")
      .select("*", { count: "exact", head: true });

    if (reachError) throw reachError;

    const uniqueReach = reachData?.length || 0;

    return {
      views: ideaData?.views || 0,
      referrals: referralsCount || 0,
      reach: uniqueReach,
    };
  } catch (error: any) {
    console.error("Error fetching idea stats:", error.message);
    throw error;
  }
}

// Fetching Idea using id
export async function getIdeaById(id: string) {
  try {
    const { data, error } = await supabase
      .from("idea") // Make sure this matches your table name exactly
      .select("*")
      .eq("id", id)
      .single(); // This ensures we get a single record

    if (error) {
      console.error("Error fetching idea:", error);
      return null;
    }

    if (!data) {
      console.log("No idea found with ID:", id);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in getIdeaById:", error);
    return null;
  }
}

export async function getReferredIdeas(email: string) {
  try {
    // Most direct solution using JavaScript Set
    const { data, error } = await supabase
      .from("spread_chain")
      .select("idea_id, status")
      .eq("referred_email", email)
      // .eq("status", 'pending')
      .not("referrer_id", "is", null);

    if (error) {
      console.error("Error fetching data:", error);
      return [];
    }

    // TypeScript-friendly way to get unique values
    const uniqueIdeaIds: {idea_id: string, status: string}[] = [];
    const seenIds: Record<string, boolean> = {};

    console.log(data)

    // Loop through data and collect unique IDs
    if (data) {
      data.forEach((item) => {
        const id = item.idea_id;
        if (!seenIds[id]) {
          seenIds[id] = true;
          uniqueIdeaIds.push({
            idea_id: item.idea_id,
            status: item.status
          });
        }
      });
    }

    // Now uniqueIdeaIds contains an array of unique idea_id values
    console.log(`Found ${uniqueIdeaIds.length} unique idea IDs`);

    if (!data) {
      console.log("No idea found with email", email);
      return [];
    }

    const ids = data.map((row) => row.idea_id);
    return uniqueIdeaIds;
  } catch (error) {
    console.error("Unexpected error by getReferredIdeas", error);
    return [];
  }
}
