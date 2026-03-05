// src/hooks/useProfile.js
import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";

export const useProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    // If there is no user ID yet, don't try to fetch
    if (!userId) {
      setLoadingProfile(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("username, expectations")
          .eq("id", userId)
          .maybeSingle(); // We only expect one profile per user

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err.message);
        setProfileError(err.message);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [userId]); // Re-run this if the userId changes

  return { profile, loadingProfile, profileError };
};
