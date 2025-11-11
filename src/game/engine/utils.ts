import { randomUUID } from "crypto";

export function generateBattleId(): string {
    return randomUUID();
}
