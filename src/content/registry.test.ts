import { describe, expect, it } from "vitest";
import { registry, validateRegistry, type ContentRecord } from "./registry";

function publishableRegistry(): ContentRecord[] {
  const validation = {
    reviewedRevision: 1,
    reviewer: "Qualified reviewer",
    qualification: "Representative test fixture only",
    reviewedOn: "2026-10-22",
    findings: [],
  };
  const publication = {
    status: "approved",
    approvedBy: "Owner",
    approvedOn: "2026-10-22",
    accessibilityReviewedRevision: 1,
  };
  const claimId = "claim.test-fact";
  const sourceId = "source.test-reference";
  const manualId = "manual.test-entry";
  const experienceId = "experience.test-experience";

  return [
    {
      recordType: "subject",
      id: "subject.test",
      title: "Test",
      collection: "manual",
      revision: 1,
    },
    {
      recordType: "claim",
      id: claimId,
      revision: 1,
      statement: "A test claim.",
      evidenceClass: "verified fact/procedure",
      applicability: { scope: "general" },
      sourceIds: [sourceId],
      resolution: "resolved",
    },
    {
      recordType: "source",
      id: sourceId,
      revision: 1,
      title: "Test source",
      publisher: "Test publisher",
      edition: "Test edition",
      location: "Section 1, page 1",
      accessedOn: "2026-10-22",
      rights: { status: "permitted", notes: "Fixture" },
      claimRefs: [{ claimId, location: "Section 1, page 1" }],
    },
    {
      recordType: "manualEntry",
      id: manualId,
      title: "Test entry",
      collection: "manual",
      subjectIds: ["subject.test"],
      objective: "Test objective",
      applicability: { scope: "general" },
      revision: 1,
      maturity: "Technically Validated",
      validation,
      publication,
      claimIds: [claimId],
      sourceIds: [sourceId],
      experienceIds: [experienceId],
      blocks: [
        {
          id: "block.test-experience",
          type: "trainer",
          claimIds: [claimId],
          experienceId,
        },
      ],
    },
    {
      recordType: "experience",
      id: experienceId,
      title: "Test experience",
      revision: 1,
      version: "1",
      manualEntryId: manualId,
      objective: "Test objective",
      prerequisiteIds: [],
      applicability: { scope: "general" },
      inputSchema: { type: "object" },
      modelVersion: "1",
      claimIds: [claimId],
      maturity: "Technically Validated",
      validation,
      publication,
    },
  ];
}

describe("content registry", () => {
  it("validates the Case III metadata and links one canonical experience", () => {
    expect(validateRegistry(registry).errors).toEqual([]);
    const entry = registry.find(
      (record) => record.id === "manual.case-three-tomcat",
    );
    const experience = registry.find(
      (record) => record.id === "experience.case-three-tomcat",
    );
    expect(entry?.experienceIds).toEqual([experience?.id]);
    expect(experience?.manualEntryId).toBe(entry?.id);
  });

  it("excludes unresolved, unapproved Case III records", () => {
    expect(validateRegistry(registry).eligibleExperiences).toEqual([]);
  });

  it("allows a complete, linked, current approved test fixture", () => {
    const result = validateRegistry(publishableRegistry());
    expect(result.errors).toEqual([]);
    expect(result.eligibleExperiences.map((record) => record.id)).toEqual([
      "experience.test-experience",
    ]);
  });

  it("fails closed on stale review and uncleared source rights", () => {
    const records = publishableRegistry().map((record) => ({ ...record }));
    const experience = records.find(
      (record) => record.recordType === "experience",
    );
    if (experience) {
      experience.validation = {
        ...(experience.validation as object),
        reviewedRevision: 0,
      };
    }
    const source = records.find((record) => record.recordType === "source");
    if (source) source.rights = { status: "unknown", notes: "Not cleared" };
    expect(validateRegistry(records).eligibleExperiences).toEqual([]);
  });

  it("fails closed on broken canonical links", () => {
    const records = publishableRegistry().map((record) => ({ ...record }));
    const entry = records.find(
      (record) => record.recordType === "manualEntry",
    );
    if (entry) entry.experienceIds = [];
    const result = validateRegistry(records);
    expect(result.errors).toContain(
      "manual.test-entry experience links and blocks do not agree",
    );
    expect(result.eligibleExperiences).toEqual([]);
  });

  it("requires entry source and claim links to cover the canonical experience", () => {
    const records = publishableRegistry().map((record) => ({ ...record }));
    const entry = records.find(
      (record) => record.recordType === "manualEntry",
    );
    if (entry) entry.sourceIds = [];
    const result = validateRegistry(records);
    expect(result.errors).toContain(
      "manual.test-entry does not link source source.test-reference for claim.test-fact",
    );
    expect(result.eligibleExperiences).toEqual([]);
  });
});
