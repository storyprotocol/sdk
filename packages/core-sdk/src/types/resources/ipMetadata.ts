import { Address, Hash } from "viem";

export type AIMetadata = {
  /**
   * Url to the character file.
   *
   * @example https://github.com/elizaOS/characterfile/blob/main/examples/example.character.json
   */
  characterFileUrl: string;
  /**
   * Hash of the character file using SHA-256 hashing algorithm.
   */
  characterFileHash: Hash;
};

/**
 * IPA Metadata Standard Parameters
 *
 * This is the metadata that is associated with an IP Asset,
 * and gets stored inside of an IP Account.
 *
 * @see {@link https://docs.story.foundation/docs/ipa-metadata-standard|IPA Metadata Standard Docs}
 */
export type IpMetadata = {
  /** Title of the IP. Required for Story Explorer. */
  title?: string;
  /** Description of the IP. Required for Story Explorer. */
  description?: string;
  /**
   * Date/Time that the IP was created (either ISO8601 or unix format).
   *
   * This field can be used to specify historical dates that aren’t on-chain.
   * For example, Harry Potter was published on June 26.
   *
   * Required for Story Explorer.
   *
   * @example "1728401700"
   */
  createdAt?: string;
  /** An image for the IP. Required for Story Explorer. */
  image?: string;
  /**
   * Hash of your `image` using SHA-256 hashing algorithm.
   * See {@link https://docs.story.foundation/docs/ipa-metadata-standard#hashing-content|here} for how that is done.
   *
   * Required for Story Explorer.
   */
  imageHash?: Hash;
  /**
   * An array of information about the creators.
   *
   * Required for Story Explorer.
   */
  creators?: IpCreator[];
  /**
   * Url to the actual media file (ex video, audio, image, etc).
   * Used for infringement checking.
   *
   * Required for Commercial Infringement Check
   *
   * @example https://ipfs.io/ipfs/QmSamy4zqP91X42k6wS7kLJQVzuYJuW2EN94couPaq82A8
   */
  mediaUrl?: string;
  /**
   * Hashed string of the media using SHA-256 hashing algorithm.
   *
   * Required for Commercial Infringement Check
   *
   * @example 0x21937ba9d821cb0306c7f1a1a2cc5a257509f228ea6abccc9af1a67dd754af6e
   */
  mediaHash?: Hash;
  /**
   * Type of media (audio, video, image), based on mimeType.
   *
   * See {@link https://docs.story.foundation/docs/ipa-metadata-standard#media-types|here}
   * for all the allowed media types.
   *
   * Required for Commercial Infringement Check
   */
  mediaType?: string;
  /**
   * Used for registering & displaying AI Agent Metadata.
   *
   * Required for AI Agents
   */
  aiMetadata?: AIMetadata;

  /**
   * Any other fields can be included in the metadata.
   */
  [key: string]: unknown;
} & IpMetadataExperimentalAttributes;

/**
 * Experimental ip metadata fields that are not required but may be
 * considered for future use.
 */
export type IpMetadataExperimentalAttributes = {
  /**
   * **Experimental**: Type of the IP Asset, can be defined arbitrarily by the
   * creator. I.e. “character”, “chapter”, “location”, “items”, "music", etc
   */
  ipType?: string;
  /**
   * **Experimental**: The detailed relationship info with the IPA’s direct parent asset,
   * such as APPEARS_IN, FINETUNED_FROM, etc
   */
  relationships?: IpRelationship[];
  /**
   * **Experimental**: A separate image with your watermark already applied.
   * This way apps choosing to use it can render this version of the image (with watermark applied).
   */
  watermarkImg?: string;
  /**
   * **Experimental**: An array of supporting media
   */
  media?: IpMedia[];
  /**
   * **Experimental**: This is assigned to verified application from
   * Story Protocol directly (on a request basis so far).
   */
  app?: StoryProtocolApp;
  /**
   * **Experimental**: Any tags that can help surface this IPA
   */
  tags?: string[];
  /**
   * **Experimental**: Allows you to set Do Not Train for a specific agent
   */
  robotTerms?: IPRobotTerms;
};

export type IPRobotTerms = {
  userAgent: string;
  allow: string;
};

export type StoryProtocolApp = {
  id: string;
  name: string;
  website: string;
  action?: string;
};

export type IpMedia = {
  name: string;
  url: string;
  mimeType: string;
};

export type IpRelationship = {
  parentIpId: Address;
  /**
   * Type of relationship between the parent and child IP.
   *
   * @see {@link https://docs.story.foundation/docs/ipa-metadata-standard#relationship-types|Relationship Types} for all relationship types.
   *
   * @example StoryRelationship.APPEARS_IN
   */
  type: StoryRelationship | AIRelationship;
};

export type IpCreator = {
  /**
   * Name of the creator.
   *
   * @example "Story Foundation"
   */
  name: string;
  address: Address;
  description?: string;
  image?: string;
  socialMedia?: IpCreatorSocial[];
  role?: string;
  /**
   * Contribution percent of the creator.
   *
   * Total contribution percent of all creators should add up to 100.
   */
  contributionPercent: number;
};

export type IpCreatorSocial = {
  /**
   * Social media platform.
   *
   * @example "Discord"
   */
  platform: string;
  url: string;
};

/**
 * Enum representing the various relationship types in a story narrative.
 */
export enum StoryRelationship {
  /** A character appears in a chapter. */
  APPEARS_IN = "APPEARS_IN",
  /** A chapter belongs to a book. */
  BELONGS_TO = "BELONGS_TO",
  /** A book is part of a series. */
  PART_OF = "PART_OF",
  /** A chapter continues from the previous one. */
  CONTINUES_FROM = "CONTINUES_FROM",
  /** An event leads to a consequence. */
  LEADS_TO = "LEADS_TO",
  /** An event foreshadows future developments. */
  FORESHADOWS = "FORESHADOWS",
  /** A character conflicts with another character. */
  CONFLICTS_WITH = "CONFLICTS_WITH",
  /** A decision results in a significant change. */
  RESULTS_IN = "RESULTS_IN",
  /** A subplot depends on the main plot. */
  DEPENDS_ON = "DEPENDS_ON",
  /** A prologue sets up the story. */
  SETS_UP = "SETS_UP",
  /** A chapter follows from the previous one. */
  FOLLOWS_FROM = "FOLLOWS_FROM",
  /** A twist reveals that something unexpected occurred. */
  REVEALS_THAT = "REVEALS_THAT",
  /** A character develops over the course of the story. */
  DEVELOPS_OVER = "DEVELOPS_OVER",
  /** A chapter introduces a new character or element. */
  INTRODUCES = "INTRODUCES",
  /** A conflict resolves in a particular outcome. */
  RESOLVES_IN = "RESOLVES_IN",
  /** A theme connects to the main narrative. */
  CONNECTS_TO = "CONNECTS_TO",
  /** A subplot relates to the central theme. */
  RELATES_TO = "RELATES_TO",
  /** A scene transitions from one setting to another. */
  TRANSITIONS_FROM = "TRANSITIONS_FROM",
  /** A character interacted with another character. */
  INTERACTED_WITH = "INTERACTED_WITH",
  /** An event leads into the climax. */
  LEADS_INTO = "LEADS_INTO",
  /** Story happening in parallel or around the same timeframe. */
  PARALLEL = "PARALLEL",
}

/**
 * Enum representing the different relationship types for AI-related metadata.
 */
export enum AIRelationship {
  /** A model is trained on a dataset. */
  TRAINED_ON = "TRAINED_ON",
  /** A model is finetuned from a base model. */
  FINETUNED_FROM = "FINETUNED_FROM",
  /** An image is generated from a fine-tuned model. */
  GENERATED_FROM = "GENERATED_FROM",
  /** A model requires data for training. */
  REQUIRES_DATA = "REQUIRES_DATA",
  /** A remix is based on a specific workflow. */
  BASED_ON = "BASED_ON",
  /** Sample data influences model output. */
  INFLUENCES = "INFLUENCES",
  /** A pipeline creates a fine-tuned model. */
  CREATES = "CREATES",
  /** A workflow utilizes a base model. */
  UTILIZES = "UTILIZES",
  /** A fine-tuned model is derived from a base model. */
  DERIVED_FROM = "DERIVED_FROM",
  /** A model produces generated images. */
  PRODUCES = "PRODUCES",
  /** A remix modifies the base workflow. */
  MODIFIES = "MODIFIES",
  /** An AI-generated image references original data. */
  REFERENCES = "REFERENCES",
  /** A model is optimized by specific algorithms. */
  OPTIMIZED_BY = "OPTIMIZED_BY",
  /** A fine-tuned model inherits features from the base model. */
  INHERITS = "INHERITS",
  /** A fine-tuning process applies to a model. */
  APPLIES_TO = "APPLIES_TO",
  /** A remix combines elements from multiple datasets. */
  COMBINES = "COMBINES",
  /** A model generates variants of an image. */
  GENERATES_VARIANTS = "GENERATES_VARIANTS",
  /** A fine-tuning process expands on base capabilities. */
  EXPANDS_ON = "EXPANDS_ON",
  /** A workflow configures a model’s parameters. */
  CONFIGURES = "CONFIGURES",
  /** A fine-tuned model adapts to new data. */
  ADAPTS_TO = "ADAPTS_TO",
}
