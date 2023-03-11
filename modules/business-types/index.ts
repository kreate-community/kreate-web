import { JSONContent } from "@tiptap/core";
import { TxHash } from "lucid-cardano";

import { formatLovelaceAmount } from "@/modules/bigint-utils";

export type Address = string;
export type TimestampInMilliseconds = number;
export type LovelaceAmount = number | bigint;
export type MicroTeikiAmount = number | bigint;

export type ProjectDescription = {
  body: JSONContent;
};

export type ProjectImage = {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  // TODO: change to ProjectImage = { url: string, crop: { x, y, w, h }}
};

export type ProjectBasics = {
  title: string;
  slogan: string;
  customUrl: string; // TODO: When customUrl = "", we should define it as null
  tags: string[];
  summary: string;
  coverImages: ProjectImage[];
  logoImage: ProjectImage | null;
};

export type ProjectMilestone = {
  id: string;
  date: number;
  name: string;
  description: string;
  funding?: LovelaceAmount;
  isCompleted: boolean;
};

export type ProjectRoadmap = ProjectMilestone[];
// TODO: change to ProjectRoadmap = { milestones: ProjectMilestone[] }

export type FrequentlyAskedQuestion = {
  question: string;
  answer: string;
};

export type ProjectCommunity = {
  socialChannels: string[];
  frequentlyAskedQuestions: FrequentlyAskedQuestion[];
};

export type ProjectBenefits = {
  perks: JSONContent;
};

// TODO: `roadmap` is temporarily hidden from the UI (not removed)
export type Project = {
  description: ProjectDescription;
  basics: ProjectBasics;
  roadmap?: ProjectRoadmap;
  benefits?: ProjectBenefits;
  community: ProjectCommunity;
};

export type ProjectAnnouncement = {
  title: string;
  body: JSONContent;
  summary: string;
  createdAt?: TimestampInMilliseconds;
  createdBy?: Address;
  announcementCid?: string;
  /**
   * `id` (usually a UUID v4) is a unique identifier of this object.
   * This field is generated by BE.
   */
  id?: string;
  /**
   * `sequenceNumber` is an auto-increasing number, started from 1.
   * This field is for displaying purpose
   * (as in `"Community Update ${sequenceNumber}"`).
   *
   * This field is generated by BE. When creating a new object, BE should
   * find the largest existing value of `sequenceNumber` (in the project),
   * then plus one to achieve the new value of `sequenceNumber`.
   */
  sequenceNumber?: number;
  /**
   * `censorship` indicates list of inappropriate fields.
   */
  censorship?: string[];
};

/** @deprecated Please rename to `ProjectAnnouncement` */
export type ProjectCommunityUpdate = ProjectAnnouncement;

export type UnixTimestamp = number;
export type ProjectId = string; // Hex

export type ProjectGeneralInfo = {
  // NOTE: @sk-kitsune: Most of the fields here are optional. Reasons:
  //
  // 1. The data is sent from BE to FE. As a receiver, FE should be more tolerant.
  // 2. At this time, not all the data is available, e.g. numLovelacesStaked
  // 3. In the future, we might add or remove fields in this type. By having
  // fields optional, we have more freedom to decide the deployment sequence.
  id: ProjectId;
  basics: ProjectBasics;
  community: ProjectCommunity;
  history: {
    createdBy?: Address;
    createdAt?: UnixTimestamp;
    updatedAt?: UnixTimestamp;
    closedAt?: UnixTimestamp;
    delistedAt?: UnixTimestamp;
  };
  stats: {
    numSupporters?: number;
    numLovelacesStaked?: LovelaceAmount;
    numLovelacesWithdrawn?: LovelaceAmount;
    numLovelacesAvailable?: LovelaceAmount;
    numLovelacesRaised?: LovelaceAmount;
    averageMillisecondsBetweenProjectUpdates?: number;
  };
  categories: {
    featured?: boolean;
    sponsor?: boolean;
  };
  match?: number;
  censorship: string[];
  // This should be grouped into its own field
  sponsorshipAmount?: LovelaceAmount;
  sponsorshipUntil?: UnixTimestamp;
};

export type SupporterInfo = {
  address: Address;
  lovelaceAmount: number | bigint;
};

// Contains all data needed for ProjectDetails page
// The same as the above `ProjectDetails` since it's
// duplicated with the <ProjectDetails> component
export type ProjectDetailsInfo = {
  generalInfo: ProjectGeneralInfo;
  description: ProjectDescription;
  roadmap: ProjectRoadmap;
  community: ProjectCommunity;
  communityUpdates: ProjectCommunityUpdate[];
  activities: ProjectActivity[];
  topSupporters?: SupporterInfo[];
};

export type ProtocolStatistics = {
  numLovelaceRaised: LovelaceAmount | null;
  numProjects: number | null;
  numSupporters: number | null;
  numLovelaceStakedActive: LovelaceAmount | null;
  numProjectsActive: number | null;
  numSupportersActive: number | null;
  averageMillisecondsBetweenProjectUpdates?: number | null;
  numPosts: number | null;
  numProtocolTransactions: number | null;
};

// Fields that can be updated by project owner (description, slogan, ...)
export const PROJECT_UPDATE_SCOPE = [
  "description",
  "benefits",
  "title",
  "slogan",
  "customUrl",
  "tags",
  "summary",
  "coverImages",
  "logoImage",
  "roadmap",
  "community",
  "sponsorship",
] as const;

export type ProjectUpdateScope =
  | { type: "description" }
  | { type: "benefits" }
  | { type: "title" }
  | { type: "slogan" }
  | { type: "customUrl" }
  | { type: "tags" }
  | { type: "summary" }
  | { type: "coverImages" }
  | { type: "logoImage" }
  | { type: "roadmap" }
  | { type: "community" }
  | { type: "sponsorship"; sponsorshipAmount: LovelaceAmount };

export function formatScope(scope: ProjectUpdateScope): string {
  switch (scope.type) {
    case "description":
      return "description";
    case "benefits":
      return "benefits";
    case "roadmap":
      return "roadmap";
    case "community":
      return "community info";
    case "title":
      return "title";
    case "slogan":
      return "tagline";
    case "customUrl":
      return "custom URL";
    case "tags":
      return "tags";
    case "summary":
      return "summary";
    case "coverImages":
      return "banners";
    case "logoImage":
      return "logo";
    case "sponsorship":
      return `sponsorship (extended the Teiki sponsorship to 
          ${formatLovelaceAmount(scope.sponsorshipAmount, {
            compact: true,
            includeCurrencySymbol: true,
          })})`;
    default:
      return "";
  }
}

// TODO: Add other types of actions (announcement, update, milestone reached, ...)
export type ProjectActivityAction =
  | {
      type: "back";
      createdBy: Address;
      lovelaceAmount: LovelaceAmount;
      message: string | null;
      message$ModeratedTags?: string[];
      createdTx: TxHash; // @sk-yagi: Lift this to `ProjectActivity` if needed
    }
  | {
      type: "unback";
      createdBy: Address;
      lovelaceAmount: LovelaceAmount;
      message: string | null;
      message$ModeratedTags?: string[];
      createdTx: TxHash; // @sk-yagi: Lift this to `ProjectActivity` if needed
    }
  | {
      type: "announcement";
      projectTitle: string;
      title: string | null;
      message: string | null;
    }
  | {
      type: "project_update";
      projectTitle: string;
      scope: ProjectUpdateScope[];
      message: string | null;
    }
  | {
      type: "protocol_milestone_reached";
      projectTitle: string;
      milestonesSnapshot: number;
      message: string | null;
    }
  | {
      type: "project_creation";
      projectTitle: string;
      sponsorshipAmount: LovelaceAmount | null;
      message: string | null;
    };

export type ProjectActivity = {
  createdAt: UnixTimestamp;
  createdBy: string;
  projectId?: string;
  action: ProjectActivityAction;
};

export type Podcast = {
  id: number; // unique id returned from backend to uniquely identify the items
  pid: string;
  pbasics: ProjectBasics;
  cid: string;
  title: string;
  completedAt: number;
  censorship?: string[];
};

/** Project with all possible fields */
export type DetailedProject = {
  id: ProjectId;
  description?: ProjectDescription;
  roadmap?: ProjectRoadmap; // Note: We are hiding Roadmap from UI, this field will be deprecated soon
  benefits?: ProjectBenefits;
  basics?: ProjectBasics;
  community?: ProjectCommunity;
  history?: ProjectGeneralInfo["history"];
  stats?: ProjectGeneralInfo["stats"];
  categories?: ProjectGeneralInfo["categories"];
  match?: ProjectGeneralInfo["match"];
  announcements?: ProjectAnnouncement[];
  activities?: ProjectActivity[];
  topSupporters?: SupporterInfo[];
  censorship?: string[];
  sponsorshipAmount?: LovelaceAmount;
  sponsorshipUntil?: UnixTimestamp;
};

/** History of backer backing a project
 * Update fields for more information
 */
export type BackingHistory = {
  projectId: ProjectId;
  backerAddress: Address;
  numLovelaceBacked: LovelaceAmount;
  numMicroTeikiUnclaimed: MicroTeikiAmount;
};
