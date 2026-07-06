import { z } from "zod";

export const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, { error: "Enter a valid amount." }),
  receiptUrl: z.url({ error: "Upload a receipt first." }),
  receiptFileName: z.string().optional(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
