import { arg, core } from "nexus";

export const dateTimeArg = (
  opts: Omit<core.NexusArgConfig<'DateTime'>, 'type'>
) => arg({ ...opts, type: "DateTime" })
