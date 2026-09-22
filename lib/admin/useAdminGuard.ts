'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export function useAdminGuard() {
    const router = useRouter();
    const [ready, setReady] = React.useState(false);
    const [unauthorized, setUnauthorized] = React.useState(false);

    React.useEffect(() => {
        const run = async () => {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;

            if (!token) {
                const next = window.location.pathname + window.location.search;
                router.replace(`/signin?next=${encodeURIComponent(next)}`);
                return;
            }

            const res = await fetch('/api/admin/me', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const json = await res.json();
            if (!res.ok || !json.isAdmin) {
                // Surface this instead of silently bouncing to "/" -- a
                // signed-in-but-not-admin visitor otherwise sees the admin
                // page flash blank and land back on the homepage with zero
                // explanation of what happened.
                setUnauthorized(true);
                return;
            }

            setReady(true);
        };

        run();
    }, [router]);

    return { ready, unauthorized };
}
