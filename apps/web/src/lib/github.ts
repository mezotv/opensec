import { env } from "@opensec/env/server";

const OWNER_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
const REPO_PATTERN = /^[a-zA-Z0-9_.-]{1,100}$/;
const INVALID_FORMAT_MESSAGE =
  "Use a GitHub repository like https://github.com/owner/repo or owner/repo.";

export function parseGithubRepoUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(INVALID_FORMAT_MESSAGE);
  }

  let path: string;

  if (/^https?:\/\//i.test(trimmed)) {
    let url: URL;
    try {
      url = new URL(trimmed);
    } catch {
      throw new Error(INVALID_FORMAT_MESSAGE);
    }

    if (url.hostname.toLowerCase() !== "github.com") {
      throw new Error("Use a github.com repository URL.");
    }

    path = url.pathname;
  } else {
    path = trimmed.replace(/^(?:www\.)?github\.com\//i, "");
  }

  const segments = path.replace(/^\/+/, "").replace(/\/+$/, "").split("/");

  if (segments.length !== 2) {
    throw new Error(INVALID_FORMAT_MESSAGE);
  }

  const [owner, rawRepo] = segments;
  const repoName = rawRepo.replace(/\.git$/i, "");

  if (
    !owner ||
    !repoName ||
    repoName === "." ||
    repoName === ".." ||
    !OWNER_PATTERN.test(owner) ||
    !REPO_PATTERN.test(repoName)
  ) {
    throw new Error(INVALID_FORMAT_MESSAGE);
  }

  const canonicalOwner = owner.toLowerCase();
  const canonicalRepo = repoName.toLowerCase();

  return {
    owner: canonicalOwner,
    repo: canonicalRepo,
    slug: `${canonicalOwner}-${canonicalRepo}`,
    repoUrl: `https://github.com/${canonicalOwner}/${canonicalRepo}`,
  };
}

type GithubRepoResponse = {
  private: boolean;
  visibility?: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics?: string[];
  license: { spdx_id: string | null } | null;
  default_branch: string | null;
  pushed_at: string | null;
  homepage: string | null;
  archived: boolean;
  owner: {
    avatar_url: string | null;
    type: string | null;
  };
};

export async function fetchGithubRepoMetadata(owner: string, repo: string) {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    if (env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as GithubRepoResponse;

    return {
      isPrivate: data.private,
      visibility: data.visibility ?? (data.private ? "private" : "public"),
      ghDescription: data.description,
      ghStars: data.stargazers_count,
      ghForks: data.forks_count,
      ghOpenIssues: data.open_issues_count,
      ghLanguage: data.language,
      ghTopics: data.topics ?? [],
      ghLicense: data.license?.spdx_id ?? null,
      ghDefaultBranch: data.default_branch,
      ghPushedAt: data.pushed_at ? new Date(data.pushed_at) : null,
      ghOwnerAvatarUrl: data.owner.avatar_url,
      ghOwnerType: data.owner.type,
      ghHomepage: data.homepage,
      ghArchived: data.archived,
      ghFetchedAt: new Date(),
    };
  } catch {
    return null;
  }
}

type GithubPermissionResponse = GithubRepoResponse & {
  permissions?: {
    admin?: boolean;
    maintain?: boolean;
    push?: boolean;
    triage?: boolean;
    pull?: boolean;
  };
};

export async function fetchGithubRepoPermission(
  owner: string,
  repo: string,
  accessToken?: string | null,
) {
  if (!accessToken) {
    return { permission: "unknown" as const, verificationLevel: "unverified" as const };
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { permission: "unknown" as const, verificationLevel: "unverified" as const };
    }

    const data = (await response.json()) as GithubPermissionResponse;
    const permissions = data.permissions;

    if (!permissions) {
      return { permission: "unknown" as const, verificationLevel: "unverified" as const };
    }

    if (permissions.admin) {
      return { permission: "admin" as const, verificationLevel: "maintainer" as const };
    }

    if (permissions.maintain) {
      return { permission: "maintain" as const, verificationLevel: "maintainer" as const };
    }

    if (permissions.push) {
      return { permission: "write" as const, verificationLevel: "contributor" as const };
    }

    if (permissions.triage) {
      return { permission: "triage" as const, verificationLevel: "contributor" as const };
    }

    if (permissions.pull) {
      return { permission: "read" as const, verificationLevel: "unverified" as const };
    }

    return { permission: "none" as const, verificationLevel: "unverified" as const };
  } catch {
    return { permission: "unknown" as const, verificationLevel: "unverified" as const };
  }
}
