import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import schema from "../../docs/schemas/content-contract.schema.json" with {
  type: "json",
};

export interface ContentRecord {
  recordType: string;
  id: string;
  revision: number;
  [key: string]: unknown;
}

export const registry: ContentRecord[] = [
  {
    recordType: "subject",
    id: "subject.naval-operations",
    title: "Naval Operations",
    collection: "manual",
    revision: 1,
  },
  {
    recordType: "claim",
    id: "claim.case-three-source-audit",
    revision: 1,
    statement:
      "The selected trainer source, behavior, rights, and procedural applicability have not been verified.",
    evidenceClass: "unresolved",
    applicability: {
      scope: "synthetic",
      notes: "Research-status record; not an aviation procedure.",
    },
    sourceIds: [],
    resolution: "unresolved",
  },
  {
    recordType: "manualEntry",
    id: "manual.case-three-tomcat",
    title: "Case III Tomcat carrier trainer",
    collection: "manual",
    subjectIds: ["subject.naval-operations"],
    objective:
      "Canonical Naval Operations entry for the owner-selected trainer; its learning objective and factual applicability remain unresolved pending source audit.",
    applicability: {
      scope: "synthetic",
      notes: "Development record only; aircraft and simulator applicability are unknown.",
    },
    revision: 1,
    maturity: "Outlined",
    claimIds: ["claim.case-three-source-audit"],
    sourceIds: [],
    experienceIds: ["experience.case-three-tomcat"],
    blocks: [
      {
        id: "block.case-three-trainer",
        type: "trainer",
        claimIds: ["claim.case-three-source-audit"],
        experienceId: "experience.case-three-tomcat",
      },
    ],
    publication: {
      status: "excluded",
      reason:
        "Prototype export, provenance, reuse rights, primary-source mapping, and qualified technical review are outstanding.",
    },
  },
  {
    recordType: "experience",
    id: "experience.case-three-tomcat",
    title: "Case III Tomcat carrier trainer — source-gated preview",
    revision: 1,
    version: "0.1.0",
    manualEntryId: "manual.case-three-tomcat",
    objective:
      "Placeholder for the audited Case III experience. The local arithmetic exercise is synthetic and does not teach or assess a Case III procedure.",
    prerequisiteIds: [],
    applicability: {
      scope: "synthetic",
      notes: "No aircraft, simulator, procedure, or prototype behavior is represented.",
    },
    inputSchema: {
      type: "object",
      required: ["angleDeg", "rateDegPerSecond", "estimateSeconds"],
      properties: {
        angleDeg: { type: "number", minimum: 0, maximum: 360 },
        rateDegPerSecond: { type: "number", exclusiveMinimum: 0 },
        estimateSeconds: { type: "number", minimum: 0 },
      },
      additionalProperties: false,
    },
    modelVersion: "synthetic-turn-clock-v1",
    claimIds: ["claim.case-three-source-audit"],
    maturity: "Outlined",
    publication: {
      status: "excluded",
      reason:
        "The source audit and primary-source evidence are incomplete; this synthetic exercise is not Case III guidance.",
    },
  },
];

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateRecord = ajv.compile<{ records: ContentRecord[] }>(schema);

const strings = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

const field = (record: ContentRecord, key: string): unknown => record[key];

export function validateRegistry(records: readonly ContentRecord[]) {
  const errors: string[] = [];
  const ids = new Map<string, ContentRecord>();

  for (const record of records) {
    if (!validateRecord({ records: [record] })) {
      errors.push(
        ...((validateRecord.errors ?? []).map(
          (error) => `${record.id}: ${error.instancePath || "/"} ${error.message}`,
        )),
      );
    }
    if (ids.has(record.id)) errors.push(`Duplicate record ID: ${record.id}`);
    ids.set(record.id, record);
  }

  const requireKind = (
    ownerId: string,
    references: string[],
    expectedKind: string,
  ) => {
    for (const id of references) {
      const target = ids.get(id);
      if (!target) errors.push(`${ownerId} references missing record ${id}`);
      else if (target.recordType !== expectedKind) {
        errors.push(`${ownerId} references ${id}, expected ${expectedKind}`);
      }
    }
  };
  const requireReferences = (ownerId: string, references: string[]) => {
    for (const id of references) {
      if (!ids.has(id)) errors.push(`${ownerId} references missing record ${id}`);
    }
  };

  const experiences = records.filter(
    (record) => record.recordType === "experience",
  );

  for (const record of records) {
    const owner = record.id;
    if (record.recordType === "manualEntry") {
      requireReferences(owner, strings(field(record, "prerequisiteIds")));
      requireKind(owner, strings(field(record, "subjectIds")), "subject");
      requireKind(owner, strings(field(record, "claimIds")), "claim");
      requireKind(owner, strings(field(record, "sourceIds")), "source");
      requireKind(owner, strings(field(record, "experienceIds")), "experience");
      for (const claimId of strings(field(record, "claimIds"))) {
        const claim = ids.get(claimId);
        for (const sourceId of claim
          ? strings(field(claim, "sourceIds"))
          : []) {
          if (!strings(field(record, "sourceIds")).includes(sourceId)) {
            errors.push(`${owner} does not link source ${sourceId} for ${claimId}`);
          }
        }
      }
      const linked = strings(field(record, "experienceIds")).sort();
      const blocks = field(record, "blocks");
      const blockRecords = Array.isArray(blocks)
        ? blocks.filter(
            (block): block is Record<string, unknown> =>
              Boolean(block) && typeof block === "object",
          )
        : [];
      const blockIds = blockRecords.flatMap((block) =>
        typeof block.id === "string" ? [block.id] : [],
      );
      const blockExperienceIds = blockRecords.flatMap((block) =>
        typeof block.experienceId === "string" ? [block.experienceId] : [],
      );
      if (new Set(blockIds).size !== blockIds.length) {
        errors.push(`${owner} has duplicate block IDs`);
      }
      if (linked.join("|") !== blockExperienceIds.sort().join("|")) {
        errors.push(`${owner} experience links and blocks do not agree`);
      }
      for (const block of Array.isArray(blocks) ? blocks : []) {
        if (!block || typeof block !== "object" || !("claimIds" in block)) {
          continue;
        }
        for (const claimId of strings(block.claimIds)) {
          if (!strings(field(record, "claimIds")).includes(claimId)) {
            errors.push(`${owner} does not link block claim ${claimId}`);
          }
        }
      }
    }

    if (record.recordType === "experience") {
      requireReferences(owner, strings(field(record, "prerequisiteIds")));
      requireKind(owner, [String(field(record, "manualEntryId"))], "manualEntry");
      requireKind(owner, strings(field(record, "claimIds")), "claim");
      const manual = ids.get(String(field(record, "manualEntryId")));
      if (
        manual &&
        !strings(field(manual, "experienceIds")).includes(record.id)
      ) {
        errors.push(`${owner} is not linked by its manual entry`);
      }
      for (const claimId of strings(field(record, "claimIds"))) {
        if (
          manual &&
          !strings(field(manual, "claimIds")).includes(claimId)
        ) {
          errors.push(`${owner} claim ${claimId} is not linked by its manual entry`);
        }
      }
    }

    if (record.recordType === "claim") {
      requireKind(owner, strings(field(record, "sourceIds")), "source");
      for (const sourceId of strings(field(record, "sourceIds"))) {
        const source = ids.get(sourceId);
        const refs = source && field(source, "claimRefs");
        if (
          !Array.isArray(refs) ||
          !refs.some(
            (ref) =>
              ref &&
              typeof ref === "object" &&
              "claimId" in ref &&
              ref.claimId === record.id &&
              "location" in ref &&
              typeof ref.location === "string" &&
              ref.location.length > 0,
          )
        ) {
          errors.push(`${sourceId} lacks a precise reference for ${owner}`);
        }
      }
    }

    if (record.recordType === "source") {
      const claimRefs = field(record, "claimRefs");
      for (const ref of Array.isArray(claimRefs) ? claimRefs : []) {
        if (!ref || typeof ref !== "object" || !("claimId" in ref)) continue;
        const claimId = String(ref.claimId);
        requireKind(owner, [claimId], "claim");
        const claim = ids.get(claimId);
        if (claim && !strings(field(claim, "sourceIds")).includes(owner)) {
          errors.push(`${claimId} does not link back to ${owner}`);
        }
      }
    }
  }

  const isEligible = (record: ContentRecord): boolean => {
    if (errors.length > 0) return false;
    const publication = field(record, "publication");
    const validation = field(record, "validation");
    if (!publication || typeof publication !== "object") return false;
    if (!validation || typeof validation !== "object") return false;
    if (!("status" in publication) || publication.status !== "approved") {
      return false;
    }
    if (
      !("revision" in record) ||
      !("reviewedRevision" in validation) ||
      validation.reviewedRevision !== record.revision ||
      !("accessibilityReviewedRevision" in publication) ||
      publication.accessibilityReviewedRevision !== record.revision ||
      !("maturity" in record) ||
      !["Technically Validated", "Published"].includes(
        String(record.maturity),
      )
    ) {
      return false;
    }
    if (
      record.maturity === "Published" &&
      (!("release" in record) || !record.release)
    ) {
      return false;
    }

    const claimIds = strings(field(record, "claimIds"));
    if (claimIds.length === 0) return false;
    const recordSourceIds = strings(field(record, "sourceIds"));
    if (
      !recordSourceIds.every((sourceId) => {
        const source = ids.get(sourceId);
        const rights = source && field(source, "rights");
        return (
          source !== undefined &&
          rights !== undefined &&
          rights !== null &&
          typeof rights === "object" &&
          "status" in rights &&
          rights.status === "permitted"
        );
      })
    ) {
      return false;
    }
    if (record.recordType === "experience") {
      const manual = ids.get(String(field(record, "manualEntryId")));
      if (!manual || !isEligible(manual)) return false;
    }
    return claimIds.every((claimId) => {
      const claim = ids.get(claimId);
      if (
        !claim ||
        field(claim, "resolution") !== "resolved" ||
        strings(field(claim, "sourceIds")).length === 0
      ) {
        return false;
      }
      return strings(field(claim, "sourceIds")).every((sourceId) => {
        const source = ids.get(sourceId);
        const rights = source && field(source, "rights");
        return (
          source !== undefined &&
          rights !== undefined &&
          rights !== null &&
          typeof rights === "object" &&
          "status" in rights &&
          rights.status === "permitted"
        );
      });
    });
  };

  return {
    errors,
    isEligible,
    eligibleExperiences: experiences.filter(isEligible),
  };
}

export const registryValidation = validateRegistry(registry);
