const eventSources = [
  {
    user: "mezotv",
    action: "donated a review to",
    repo: "getpaykit/paykit",
    time: "5m ago",
  },
  {
    user: "janburzinski",
    action: "submitted findings for",
    repo: "generalaction/emdash",
    time: "42m ago",
  },
  {
    user: "maxktz",
    action: "donated a review to",
    repo: "usenotra/notra",
    time: "2h ago",
  },
  {
    user: "bekacru",
    action: "requested a review for",
    repo: "better-auth/better-auth",
    time: "4h ago",
  },
  {
    user: "shadcn",
    action: "donated a review to",
    repo: "shadcn-ui/ui",
    time: "6h ago",
  },
] as const;

type GithubUser = {
  avatar_url: string;
  login: string;
  name: string | null;
};

type GithubRepo = {
  full_name: string;
  owner: {
    avatar_url: string;
  };
};

async function fetchGitHub<T>(path: string): Promise<T | null> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
    },
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<T>;
}

export async function EventTicker() {
  const events = await Promise.all(
    eventSources.map(async (event) => {
      const [user, repo] = await Promise.all([
        fetchGitHub<GithubUser>(`/users/${event.user}`),
        fetchGitHub<GithubRepo>(`/repos/${event.repo}`),
      ]);

      return {
        ...event,
        user: user?.name || user?.login || event.user,
        userAvatar: user?.avatar_url || `https://github.com/${event.user}.png`,
        repo: repo?.full_name || event.repo,
        repoAvatar: repo?.owner.avatar_url || `https://github.com/${event.repo.split("/")[0]}.png`,
      };
    }),
  );

  return (
    <section
      className="max-w-screen overflow-hidden border-y border-border bg-background py-3"
      aria-label="Latest activity"
    >
      <div className="opensec-event-ticker flex w-max gap-8 whitespace-nowrap">
        {[...events, ...events].map((event, index) => (
          <div
            key={`${event.repo}-${index}`}
            className="flex items-center gap-2 font-mono text-xs text-muted-foreground"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" className="size-5 border border-border" src={event.userAvatar} />
            <span className="text-foreground">{event.user}</span>
            <span>{event.action}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" className="size-5 border border-border" src={event.repoAvatar} />
            <span className="text-foreground">{event.repo}</span>
            <span className="text-border">///</span>
            <span>{event.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
