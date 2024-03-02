import { spgConfig } from "./generated/spg";

export function mintAndRegisterIp() {
  const { useWriteSPGMintAndRegisterIP } = spgConfig
  return useWriteSPGMintAndRegisterIP();
}
