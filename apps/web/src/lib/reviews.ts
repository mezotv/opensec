import { db } from "@opensec/db";
import { repository, reviewReport, reviewRequestSubmission, user } from "@opensec/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const activeSubmission = alias(reviewRequestSubmission, "active_submission");
const requester = alias(user, "requester");
const donor = alias(user, "donor");

export async function getLandingData() {
  const pending = await db
    .select({
      id: repository.id,
      repoSlug: repository.repoSlug,
      repoOwner: repository.repoOwner,
      repoName: repository.repoName,
      description: activeSubmission.description,
      verificationLevel: repository.verificationLevel,
      locTotal: repository.locTotal,
      locFiles: repository.locFiles,
      ghDescription: repository.ghDescription,
      ghStars: repository.ghStars,
      ghLanguage: repository.ghLanguage,
      ghOwnerAvatarUrl: repository.ghOwnerAvatarUrl,
      createdAt: repository.createdAt,
      requesterName: requester.name,
      requesterImage: requester.image,
    })
    .from(repository)
    .leftJoin(activeSubmission, eq(repository.activeSubmissionId, activeSubmission.id))
    .leftJoin(requester, eq(activeSubmission.requesterId, requester.id))
    .where(eq(repository.status, "pending"))
    .orderBy(desc(repository.ghStars), desc(repository.createdAt))
    .limit(6);

  const completed = await db
    .select({
      id: repository.id,
      repoSlug: repository.repoSlug,
      repoOwner: repository.repoOwner,
      repoName: repository.repoName,
      ghOwnerAvatarUrl: repository.ghOwnerAvatarUrl,
      ghLanguage: repository.ghLanguage,
      ghStars: repository.ghStars,
      locTotal: repository.locTotal,
      locFiles: repository.locFiles,
      completedAt: repository.completedAt,
      donorId: reviewReport.donorId,
      donorName: donor.name,
      provider: reviewReport.provider,
      criticalCount: reviewReport.criticalCount,
      highCount: reviewReport.highCount,
      mediumCount: reviewReport.mediumCount,
      lowCount: reviewReport.lowCount,
      informationalCount: reviewReport.informationalCount,
      totalCount: reviewReport.totalCount,
    })
    .from(repository)
    .innerJoin(reviewReport, eq(repository.id, reviewReport.repositoryId))
    .innerJoin(donor, eq(reviewReport.donorId, donor.id))
    .where(eq(repository.status, "completed"))
    .orderBy(desc(repository.completedAt))
    .limit(6);

  const topDonors = await getTopDonors(6);

  return { pending, completed, topDonors };
}

export async function getTopDonors(limit?: number) {
  const query = db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      reviews: count(reviewReport.id),
    })
    .from(reviewReport)
    .innerJoin(user, eq(reviewReport.donorId, user.id))
    .groupBy(user.id, user.name, user.image)
    .orderBy(desc(count(reviewReport.id)));

  return limit ? query.limit(limit) : query;
}

export async function getPendingReviews() {
  return db
    .select({
      id: repository.id,
      repoSlug: repository.repoSlug,
      repoUrl: repository.repoUrl,
      repoOwner: repository.repoOwner,
      repoName: repository.repoName,
      description: activeSubmission.description,
      securityNotes: activeSubmission.securityNotes,
      verificationLevel: repository.verificationLevel,
      locTotal: repository.locTotal,
      locFiles: repository.locFiles,
      ghDescription: repository.ghDescription,
      ghStars: repository.ghStars,
      ghForks: repository.ghForks,
      ghOpenIssues: repository.ghOpenIssues,
      ghLanguage: repository.ghLanguage,
      ghTopics: repository.ghTopics,
      ghLicense: repository.ghLicense,
      ghPushedAt: repository.ghPushedAt,
      ghOwnerAvatarUrl: repository.ghOwnerAvatarUrl,
      ghArchived: repository.ghArchived,
      createdAt: repository.createdAt,
      requesterId: activeSubmission.requesterId,
      requesterName: requester.name,
      requesterImage: requester.image,
    })
    .from(repository)
    .leftJoin(activeSubmission, eq(repository.activeSubmissionId, activeSubmission.id))
    .leftJoin(requester, eq(activeSubmission.requesterId, requester.id))
    .where(eq(repository.status, "pending"))
    .orderBy(desc(repository.ghStars), desc(repository.createdAt));
}

export async function getReviewDetail(id: string) {
  const repoRecord = await db.query.repository.findFirst({
    where: eq(repository.id, id),
    with: {
      activeSubmission: {
        with: {
          requester: true,
        },
      },
      report: {
        with: {
          donor: true,
        },
      },
    },
  });

  if (!repoRecord) {
    return null;
  }

  const submissions = await db.query.reviewRequestSubmission.findMany({
    where: eq(reviewRequestSubmission.repositoryId, id),
    with: {
      requester: true,
    },
    orderBy: desc(reviewRequestSubmission.createdAt),
  });

  return {
    request: {
      ...repoRecord,
      description: repoRecord.activeSubmission?.description ?? "",
      securityNotes: repoRecord.activeSubmission?.securityNotes ?? null,
      requesterId: repoRecord.activeSubmission?.requesterId ?? null,
      requesterName: repoRecord.activeSubmission?.requester.name ?? "Unknown requester",
    },
    report: repoRecord.report
      ? {
          ...repoRecord.report,
          donorName: repoRecord.report.donor.name,
        }
      : null,
    submissions,
  };
}

export async function getReviewDetailBySlug(slug: string) {
  const repoRecord = await db.query.repository.findFirst({
    where: eq(repository.repoSlug, slug),
    with: {
      activeSubmission: {
        with: {
          requester: true,
        },
      },
      report: {
        with: {
          donor: true,
        },
      },
    },
  });

  if (!repoRecord) {
    return null;
  }

  const submissions = await db.query.reviewRequestSubmission.findMany({
    where: eq(reviewRequestSubmission.repositoryId, repoRecord.id),
    with: {
      requester: true,
    },
    orderBy: desc(reviewRequestSubmission.createdAt),
  });

  return {
    request: {
      ...repoRecord,
      description: repoRecord.activeSubmission?.description ?? "",
      securityNotes: repoRecord.activeSubmission?.securityNotes ?? null,
      requesterId: repoRecord.activeSubmission?.requesterId ?? null,
      requesterName: repoRecord.activeSubmission?.requester.name ?? "Unknown requester",
    },
    report: repoRecord.report
      ? {
          ...repoRecord.report,
          donorName: repoRecord.report.donor.name,
        }
      : null,
    submissions,
  };
}

export async function getUserProfile(id: string) {
  const profile = await db.query.user.findFirst({
    where: eq(user.id, id),
  });

  if (!profile) {
    return null;
  }

  const donated = await db
    .select({
      repositoryId: repository.id,
      repoSlug: repository.repoSlug,
      repoOwner: repository.repoOwner,
      repoName: repository.repoName,
      provider: reviewReport.provider,
      totalCount: reviewReport.totalCount,
      criticalCount: reviewReport.criticalCount,
      highCount: reviewReport.highCount,
      createdAt: reviewReport.createdAt,
    })
    .from(reviewReport)
    .innerJoin(repository, eq(reviewReport.repositoryId, repository.id))
    .where(eq(reviewReport.donorId, id))
    .orderBy(desc(reviewReport.createdAt));

  const requested = await db
    .select({
      id: repository.id,
      repoSlug: repository.repoSlug,
      repoOwner: repository.repoOwner,
      repoName: repository.repoName,
      status: repository.status,
      verificationLevel: reviewRequestSubmission.verificationLevel,
      createdAt: reviewRequestSubmission.createdAt,
    })
    .from(reviewRequestSubmission)
    .innerJoin(repository, eq(reviewRequestSubmission.repositoryId, repository.id))
    .where(eq(reviewRequestSubmission.requesterId, id))
    .orderBy(desc(reviewRequestSubmission.createdAt));

  return { profile, donated, requested };
}
