"use client";

import { useState, useEffect } from "react";
import { getCountdown } from "@/lib/utils";

export function useCountdown(targetDate: string | null, timezone?: string | null) {
    const [countdown, setCountdown] = useState(() => getCountdown(targetDate, timezone));

    useEffect(() => {
        if (!targetDate) return;

        const timer = setInterval(() => {
            setCountdown(getCountdown(targetDate, timezone));
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate, timezone]);

    return countdown;
}
