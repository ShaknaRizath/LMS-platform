export type ActionState =
  | { error?: string; fieldErrors?: Record<string, string[] | undefined> }
  | undefined;
