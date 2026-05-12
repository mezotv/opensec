import { auth } from "@opensec/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getGithubUsernameForUserId } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export default async function MyProfileRedirectPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const githubUsername = await getGithubUsernameForUserId(session.user.id);

  if (!githubUsername) {
    notFound();
  }

  redirect(`/users/${githubUsername}`);
}
