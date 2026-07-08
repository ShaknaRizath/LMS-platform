import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, { error: "Enter your name." }),
  email: z.email({ error: "Enter a valid email address." }),
  password: z.string().min(8, { error: "Password must be at least 8 characters." }),
  programId: z.string().min(1, { error: "Select your program." }),
  agreeToTerms: z.literal("on", { error: "You must agree to the terms to continue." }),
});

export type SignupInput = z.infer<typeof signupSchema>;
