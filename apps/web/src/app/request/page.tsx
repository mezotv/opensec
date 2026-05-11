import { auth } from "@opensec/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@opensec/ui/components/card";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { RequestReviewForm } from "@/components/request-review-form";

export const metadata: Metadata = {
  title: "Request a Review",
  description:
    "Submit a public GitHub repository for a private donated security review on OpenSec.",
  alternates: {
    canonical: "/request",
  },
};

export default async function RequestPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Request a security review</CardTitle>
          <CardDescription>
            Submit a public GitHub repository. The full report will stay private to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RequestReviewForm />
        </CardContent>
      </Card>
    </main>
  );
}
