"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/useAuth";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { LibraryTab } from "@/components/site/LibraryTab";
import { HairProfileTab } from "@/components/site/HairProfileTab";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Status = "idle" | "saving" | "success" | "error";

export default function AccountClient() {
    const router = useRouter();

    const { signedIn, loading } = useAuth();

    const [tab, setTab] = React.useState("library");

    // profile state
    const [displayName, setDisplayName] = React.useState("");
    const [email, setEmail] = React.useState("");

    const [newEmail, setNewEmail] = React.useState("");

    const [status, setStatus] = React.useState<Status>("idle");
    const [message, setMessage] = React.useState("");

    // Read tab once on mount
    React.useEffect(() => {
        const t =
            new URLSearchParams(window.location.search).get("tab") || "library";
        setTab(t);
    }, []);

    // Load user
    React.useEffect(() => {
        const run = async () => {
            const { data } = await supabase.auth.getUser();
            const user = data.user;
            if (!user) return;

            setEmail(user.email ?? "");
            setNewEmail(user.email ?? "");
            setDisplayName((user.user_metadata as any)?.display_name ?? "");
        };

        if (!loading) run();
    }, [loading]);

    // Guard
    React.useEffect(() => {
        if (!loading && !signedIn) {
            router.replace(
                `/signin?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
            );
        }
    }, [loading, signedIn, router]);

    // Keep URL in sync
    React.useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tab);
        window.history.replaceState({}, "", url.toString());
    }, [tab]);

    async function onSaveDisplayName(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus("saving");
        setMessage("");

        try {
            const { error } = await supabase.auth.updateUser({
                data: { display_name: displayName.trim() || null },
            });
            if (error) throw error;

            setStatus("success");
            setMessage("Profile updated.");
        } catch (err: any) {
            setStatus("error");
            setMessage(err?.message ?? "Could not update profile.");
        }
    }

    async function onChangeEmail(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus("saving");
        setMessage("");

        try {
            const nextEmail = newEmail.trim();
            if (!nextEmail.includes("@")) {
                setStatus("error");
                setMessage("Enter a valid email address.");
                return;
            }

            const { error } = await supabase.auth.updateUser({
                email: nextEmail,
            });
            if (error) throw error;

            setStatus("success");
            setMessage("Check your email to confirm the change.");
        } catch (err: any) {
            setStatus("error");
            setMessage(err?.message ?? "Could not update email.");
        }
    }

    async function onSignOut() {
        await supabase.auth.signOut();
        router.replace("/");
    }

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />

            <main className='mx-auto max-w-6xl px-6 py-10'>
                <div className='bg-background/50 rounded-3xl p-6 flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-4'>
                        <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-base font-semibold select-none'>
                            {(displayName || email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className='text-xl font-semibold tracking-tight'>
                                {displayName
                                    ? `Hi, ${displayName.split(" ")[0]}`
                                    : "My account"}
                            </h1>
                            <p className='text-sm'>
                                {email}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant='secondary'
                        size='sm'
                        onClick={onSignOut}>
                        Sign out
                    </Button>
                </div>

                <div className='mt-8'>
                    <Tabs
                        value={tab}
                        onValueChange={setTab}
                        className='w-full'>
                        <TabsList className='grid w-full grid-cols-2'>
                            <TabsTrigger value='library'>Library</TabsTrigger>
                            <TabsTrigger value='profile'>Profile</TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value='library'
                            className='mt-6'>
                            <LibraryTab />
                        </TabsContent>

                        <TabsContent
                            value='hair-profile'
                            className='mt-6'>
                            <HairProfileTab />
                        </TabsContent>

                        <TabsContent
                            value='profile'
                            className='mt-6 space-y-6'>
                            <Card className='rounded-3xl'>
                                <CardHeader>
                                    <CardTitle className='text-base'>
                                        Display name
                                    </CardTitle>
                                    <CardDescription>
                                        How you appear across the site.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        onSubmit={onSaveDisplayName}
                                        className='space-y-4'>
                                        <div className='space-y-2 w-full sm:w-1/2 lg:w-1/4'>
                                            <Label htmlFor='displayName'>
                                                Name
                                            </Label>
                                            <Input
                                                id='displayName'
                                                value={displayName}
                                                onChange={e =>
                                                    setDisplayName(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder='Your name'
                                                disabled={status === "saving"}
                                            />
                                        </div>
                                        <Button
                                            type='submit'
                                            disabled={status === "saving"}>
                                            {status === "saving"
                                                ? "Saving…"
                                                : "Save"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card className='rounded-3xl'>
                                <CardHeader>
                                    <CardTitle className='text-base'>
                                        Email address
                                    </CardTitle>
                                    <CardDescription>
                                        You&apos;ll receive a confirmation link
                                        when you change this.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        onSubmit={onChangeEmail}
                                        className='space-y-4'>
                                        <div className='space-y-2 w-full sm:w-1/2 lg:w-1/4'>
                                            <Label htmlFor='newEmail'>
                                                Email
                                            </Label>
                                            <Input
                                                id='newEmail'
                                                type='email'
                                                value={newEmail}
                                                onChange={e =>
                                                    setNewEmail(e.target.value)
                                                }
                                                disabled={status === "saving"}
                                            />
                                        </div>
                                        <Button
                                            type='submit'
                                            disabled={status === "saving"}>
                                            {status === "saving"
                                                ? "Saving…"
                                                : "Update email"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {status !== "idle" ? (
                                <Alert
                                    className={
                                        status === "error"
                                            ? "bg-red-400"
                                            : "bg-green-400"
                                    }>
                                    <AlertTitle>
                                        {status === "error"
                                            ? "Couldn't save"
                                            : "Saved"}
                                    </AlertTitle>
                                    <AlertDescription className='text-foreground'>
                                        {message}
                                    </AlertDescription>
                                </Alert>
                            ) : null}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
