"use client";

import { Button } from "@opensec/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@opensec/ui/components/card";
import { Github } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import Loader from "@/components/loader";

export default function LoginPage() {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Loader />;
  }

  if (session) {
    router.push("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign in to OpenSec</CardTitle>
          <CardDescription>
            Use GitHub to request and donate open source security reviews.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            disabled={isSigningIn}
            onClick={async () => {
              setIsSigningIn(true);
              await authClient.signIn.social(
                {
                  provider: "github",
                  callbackURL: "/",
                },
                {
                  onError: (error) => {
                    setIsSigningIn(false);
                    toast.error(error.error.message || error.error.statusText);
                  },
                },
              );
            }}
          >
            <Github className={isSigningIn ? "size-4 animate-pulse" : "size-4"} />
            {isSigningIn ? "Redirecting to GitHub..." : "Continue with GitHub"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
