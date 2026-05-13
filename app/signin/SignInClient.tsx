"use client";

import * as React from "react";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";

type Step = "email" | "code";
type Status = "idle" | "sending" | "success" | "error";

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function SignInClient() {
    const [step, setStep] = React.useState<Step>("email");
    const [email, setEmail] = React.useState("");
    const [code, setCode] = React.useState("");
    const [status, setStatus] = React.useState<Status>("idle");
    const [message, setMessage] = React.useState("");

    const destination =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("next") || "/"
            : "/";

    async function sendCode(e: React.FormEvent) {
        e.preventDefault();
        if (!isValidEmail(email)) {
            setStatus("error");
            setMessage("Please enter a valid email address.");
            return;
        }
        setStatus("sending");
        setMessage("");
        const { error } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: { shouldCreateUser: true },
        });
        if (error) {
            setStatus("error");
            setMessage(error.message);
            return;
        }
        setStatus("idle");
        setStep("code");
    }

    async function verifyCode(e: React.FormEvent) {
        e.preventDefault();
        if (code.trim().length !== 6) {
            setStatus("error");
            setMessage("Please enter the 6-digit code from your email.");
            return;
        }
        setStatus("sending");
        setMessage("");
        const { data, error } = await supabase.auth.verifyOtp({
            email: email.trim(),
            token: code.trim(),
            type: "email",
        });
        if (error) {
            setStatus("error");
            setMessage("Code is invalid or expired — request a new one.");
            return;
        }
        const token = data.session?.access_token;
        if (token) {
            fetch("/api/stripe/ensure-customer", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            }).catch(() => {});
        }
        setStatus("success");
        setMessage("Signed in. Redirecting…");
        window.location.href = destination;
    }

    async function resendCode() {
        setStatus("sending");
        setMessage("");
        const { error } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: { shouldCreateUser: true },
        });
        if (error) {
            setStatus("error");
            setMessage(error.message);
        } else {
            setStatus("idle");
            setMessage("New code sent — check your inbox.");
        }
    }

    const { ref: pageRef, inView: pageIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />

            <main
                ref={pageRef}
                className='mx-auto flex max-w-6xl flex-col items-center px-6 py-14 sm:py-20'>
                <FadeIn
                    inView={pageIn}
                    delayMs={100}>
                    <div className='w-[350px] max-w-md'>
                        <Card className='rounded-3xl'>
                            <CardHeader>
                                <CardTitle className='text-2xl'>
                                    {step === "email"
                                        ? "Sign in"
                                        : "Check your email"}
                                </CardTitle>
                                <CardDescription>
                                    {step === "email"
                                        ? "Enter your email and we'll send you a sign-in code. No password needed."
                                        : `We sent a 6-digit code to ${email}. It expires in 15 minutes.`}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className='space-y-6'>
                                {step === "email" ? (
                                    <form
                                        onSubmit={sendCode}
                                        className='space-y-4'>
                                        <div className='space-y-2'>
                                            <Label htmlFor='email'>Email</Label>
                                            <Input
                                                id='email'
                                                type='email'
                                                autoComplete='email'
                                                placeholder='you@example.com'
                                                value={email}
                                                onChange={e =>
                                                    setEmail(e.target.value)
                                                }
                                                disabled={status === "sending"}
                                            />
                                        </div>
                                        <Button
                                            type='submit'
                                            className='w-full'
                                            disabled={
                                                status === "sending" ||
                                                !isValidEmail(email)
                                            }>
                                            {status === "sending"
                                                ? "Sending…"
                                                : "Send code"}
                                        </Button>
                                    </form>
                                ) : (
                                    <form
                                        onSubmit={verifyCode}
                                        className='space-y-4'>
                                        <div className='space-y-2'>
                                            <Label htmlFor='code'>
                                                6-digit code
                                            </Label>
                                            <Input
                                                id='code'
                                                type='text'
                                                inputMode='numeric'
                                                autoComplete='one-time-code'
                                                placeholder='123456'
                                                maxLength={6}
                                                value={code}
                                                onChange={e =>
                                                    setCode(
                                                        e.target.value.replace(
                                                            /\D/g,
                                                            "",
                                                        ),
                                                    )
                                                }
                                                disabled={status === "sending"}
                                                className='text-center tracking-[0.4em] text-lg'
                                            />
                                        </div>
                                        <Button
                                            type='submit'
                                            className='w-full'
                                            disabled={
                                                status === "sending" ||
                                                code.trim().length !== 6
                                            }>
                                            {status === "sending"
                                                ? "Verifying…"
                                                : "Sign in"}
                                        </Button>
                                        <div className='flex items-center justify-between text-sm'>
                                            <button
                                                type='button'
                                                className='underline underline-offset-4'
                                                onClick={() => {
                                                    setStep("email");
                                                    setCode("");
                                                    setStatus("idle");
                                                    setMessage("");
                                                }}>
                                                Wrong email?
                                            </button>
                                            <button
                                                type='button'
                                                className='underline underline-offset-4'
                                                onClick={resendCode}
                                                disabled={
                                                    status === "sending"
                                                }>
                                                Resend code
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {message && (
                                    <Alert
                                        className={
                                            status === "error"
                                                ? "bg-red-400"
                                                : status === "success"
                                                  ? "bg-green-400"
                                                  : ""
                                        }>
                                        <AlertDescription className='text-foreground'>
                                            {message}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </FadeIn>
            </main>
        </div>
    );
}
