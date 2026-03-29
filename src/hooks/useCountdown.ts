"use client";

import { useState, useEffect } from "react";
import { getCountdown } from "@/lib/utils";

export function useCountdown(targetDate: string | null) {
    const [countdown, setCountdown] = useState(() => getCountdown(targetDate));

    useEffect(() => {
        if (!targetDate) return;

        const timer = setInterval(() => {
            setCountdown(getCountdown(targetDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return countdown;
}
