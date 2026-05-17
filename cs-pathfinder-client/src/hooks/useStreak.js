// src/hooks/useStreak.js
import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";

export const useStreak = (user) => {
  const [streak, setStreak] = useState(0);
  const [totalDone, setTotalDone] = useState(0);
  const [activityDates, setActivityDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStreak = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const res = await fetch("http://localhost:5000/api/progress/history", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch history");
        const rows = await res.json();

        if (!rows.length) {
          setLoading(false);
          return;
        }

        setTotalDone(rows.length);

        // Unique "YYYY-MM-DD" dates sorted ascending
        const dates = [
          ...new Set(
            rows.map((r) =>
              new Date(r.completed_at).toISOString().slice(0, 10),
            ),
          ),
        ].sort();

        setActivityDates(dates);

        // Compute streak walking backwards from today
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .slice(0, 10);
        const dateSet = new Set(dates);

        if (!dateSet.has(today) && !dateSet.has(yesterday)) {
          setStreak(0);
          setLoading(false);
          return;
        }

        let count = 0;
        let checking = today;
        while (dateSet.has(checking)) {
          count++;
          checking = new Date(new Date(checking).getTime() - 86400000)
            .toISOString()
            .slice(0, 10);
        }

        setStreak(count);
      } catch (err) {
        console.error("Error computing streak:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, [user]);

  return { streak, totalDone, activityDates, loading };
};
