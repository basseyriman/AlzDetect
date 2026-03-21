import { supabase } from "./supabase";

export interface StoredResult {
  id: string;
  user_id: string;
  fileName: string;
  predicted_class: string;
  class_probabilities: Record<string, number>;
  attention_map_url?: string;
  timestamp: string;
  created_at?: string;
}

export const saveResult = async (result: Omit<StoredResult, "id" | "user_id" | "timestamp">): Promise<StoredResult | null> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;

  if (!user) {
    console.error("No authenticated user found for saving result");
    return null;
  }

  const { data, error } = await supabase
    .from("scans")
    .insert([
      {
        user_id: user.id,
        file_name: result.fileName,
        predicted_class: result.predicted_class,
        class_probabilities: result.class_probabilities,
        attention_map_url: result.attention_map_url,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error saving result to Supabase:", error);
    return null;
  }

  return {
    id: data.id,
    user_id: data.user_id,
    fileName: data.file_name,
    predicted_class: data.predicted_class,
    class_probabilities: data.class_probabilities,
    attention_map_url: data.attention_map_url,
    timestamp: data.created_at,
  };
};

export const getResults = async (): Promise<StoredResult[]> => {
  const { data, error } = await supabase
    .from("scans")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching results from Supabase:", error);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    user_id: item.user_id,
    fileName: item.file_name,
    predicted_class: item.predicted_class,
    class_probabilities: item.class_probabilities,
    attention_map_url: item.attention_map_url,
    timestamp: item.created_at,
  }));
};

export const getResultById = async (id: string): Promise<StoredResult | null> => {
  const { data, error } = await supabase
    .from("scans")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching result by ID:", error);
    return null;
  }

  return {
    id: data.id,
    user_id: data.user_id,
    fileName: data.file_name,
    predicted_class: data.predicted_class,
    class_probabilities: data.class_probabilities,
    attention_map_url: data.attention_map_url,
    timestamp: data.created_at,
  };
};

export const clearResults = async (): Promise<boolean> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;

  if (!user) return false;

  const { error } = await supabase
    .from("scans")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    console.error("Error clearing results from Supabase:", error);
    return false;
  }

  return true;
};