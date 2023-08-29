import { createHmac, randomUUID } from "crypto";

export const sha256 = (str: string, salt?: string) =>
  createHmac('sha256', salt ?? randomUUID())
    .update(str, 'utf8')
    .digest('hex');