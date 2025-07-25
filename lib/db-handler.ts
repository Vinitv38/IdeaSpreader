import { supabase } from "./supabase";

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

  //("Profile created:", data);
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
        description,
        category,
        is_public,
        file_urls,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating idea:", error);
    throw error;
  }

  return data;
}

// ✅ Create Spread Chain
export async function createSpreadChain(
  ideaId: string,
  referrerId: string | null = null,
  email: string
) {
  const { data, error } = await supabase
    .from("spread_chain")
    .insert([
      {
        idea_id: ideaId,
        referrer_id: referrerId,
        referred_email: email,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating spread chain:", error);
    throw error;
  }

  return data;
}

// Get Idea
export async function getIdea(userId: string) {
  const { data, error } = await supabase
    .from("idea")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching ideas:", error);
    throw error;
  }

  return data;
}

// Get Idea Stats
export async function getIdeaStats(ideaId: string) {
  const { data, error } = await supabase
    .from("spread_chain")
    .select("*")
    .eq("idea_id", ideaId);

  if (error) {
    console.error("Error fetching idea stats:", error);
    throw error;
  }

  const stats = {
    total: data.length,
    pending: data.filter((item) => item.status === "pending").length,
    accepted: data.filter((item) => item.status === "accepted").length,
    rejected: data.filter((item) => item.status === "rejected").length,
  };

  return stats;
}

// Get Idea by ID
export async function getIdeaById(id: string) {
  const { data, error } = await supabase
    .from("idea")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching idea:", error);
    throw error;
  }

  return data;
}

// Get Referred Ideas
export async function getReferredIdeas(email: string) {
  try {
    const { data, error } = await supabase
      .from("spread_chain")
      .select("*")
      .eq("referred_email", email)
      .not("referrer_id", "is", null);

    if (error) {
      console.error("Error fetching data:", error);
      return [];
    }

    const uniqueIdeaIds: { idea_id: string; status: string }[] = [];
    const seenIds: Record<string, boolean> = {};

    if (data) {
      data.forEach((item) => {
        const id = item.idea_id;
        if (!seenIds[id]) {
          seenIds[id] = true;
          uniqueIdeaIds.push({
            idea_id: item.idea_id,
            status: item.status,
          });
        }
      });
    }

    //(`Found ${uniqueIdeaIds.length} unique idea IDs`);
    return uniqueIdeaIds;
  } catch (error) {
    console.error("Unexpected error by getReferredIdeas", error);
    return [];
  }
}
