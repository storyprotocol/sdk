import { getAddress, parseAbi } from "viem";
import { formatAbi } from "abitype";
import * as dotenv from "dotenv";

import StoryProtocolABI from "./json/StoryProtocol.abi";
import errorsJson from "./json/Errors.json";

if (typeof process !== "undefined") {
  dotenv.config();
}

export const storyProtocolAbi = StoryProtocolABI;
export const ErrorsAbi = errorsJson;

const storyProtocolMerged = [...storyProtocolAbi, ...ErrorsAbi];

export const storyProtocolReadable = formatAbi(storyProtocolMerged);

export const storyProtocolConfig = {
  abi: parseAbi(storyProtocolReadable),
  address: getAddress(process.env.NEXT_PUBLIC_STORY_PROTOCOL_CONTRACT!),
};
