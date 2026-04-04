'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase/client';

type AdminStatus =
    | { loading: true; signedIn: boolean; isAdmin: boolean }
    | { loading: false; signedIn: boolean; isAdmin: boolean };

// Module-level cache — survives re-renders, cleared on sign-out
let cachedToken: string | null = null;
let cachedIsAdmin: boolean | null = null;

export function useAdminStatus(): AdminStatus {
    const [state, setState] = React.useState<AdminStatus>({
        loading: true,
        signedIn: false,
        isAdmin: false,
    });

    React.useEffect(() => {
        let cancelled = false;

        async function refresh(forceRefresh = false) {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token ?? null;

            if (!token) {
                cachedToken = null;
                cachedIsAdmin = null;
                if (!cancelled) {
                    setState({
                        loading: false,
                        signedIn: false,
                        isAdmin: false,
                    });
                }
                return;
            }

            // Cache hit — same token, skip the API call
            if (
                !forceRefresh &&
                token === cachedToken &&
                cachedIsAdmin !== null
            ) {
                if (!cancelled) {
                    setState({
                        loading: false,
                        signedIn: true,
                        isAdmin: cachedIsAdmin,
                    });
                }
                return;
            }

            // Cache miss — fetch and store
            const res = await fetch('/api/admin/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = (await res.json()) as { isAdmin?: boolean };
            const isAdmin = Boolean(json.isAdmin) && res.ok;

            cachedToken = token;
            cachedIsAdmin = isAdmin;

            if (!cancelled) {
                setState({ loading: false, signedIn: true, isAdmin });
            }
        }

        refresh();

        const { data: sub } = supabase.auth.onAuthStateChange(event => {
            if (event === 'SIGNED_OUT') {
                cachedToken = null;
                cachedIsAdmin = null;
            }
            // Only force re-fetch on actual sign-in, not token refreshes
            refresh(event === 'SIGNED_IN');
        });

        return () => {
            cancelled = true;
            sub.subscription.unsubscribe();
        };
    }, []);

    return state;
}
