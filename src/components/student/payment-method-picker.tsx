"use client";

import { useActionState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { PaymentUploadForm } from "@/components/student/payment-upload-form";
import { uploadPaymentReceipt } from "@/lib/actions/student/payment.actions";
import { initiateGatewayPayment } from "@/lib/actions/student/gateway-payment.actions";
import type { ActionState } from "@/lib/actions/action-state";

export function PaymentMethodPicker({
  registrationId,
  studentId,
}: {
  registrationId: string;
  studentId: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    initiateGatewayPayment.bind(null, registrationId),
    undefined
  );

  return (
    <Tabs defaultValue="bank">
      <TabsList>
        <TabsTrigger value="bank">Bank transfer</TabsTrigger>
        <TabsTrigger value="gateway">LMS Payment Gateway</TabsTrigger>
      </TabsList>

      <TabsContent value="bank" className="pt-4">
        <PaymentUploadForm
          action={uploadPaymentReceipt.bind(null, registrationId)}
          studentId={studentId}
        />
      </TabsContent>

      <TabsContent value="gateway" className="pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Pay online</CardTitle>
            <CardDescription>
              You&apos;ll be redirected to the payment gateway to complete your payment securely. Once
              paid, your payment is verified automatically and your registration moves to admin/finance
              review.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {state?.error && <FieldError>{state.error}</FieldError>}
            <form action={formAction}>
              <Button type="submit" disabled={pending}>
                {pending ? "Redirecting..." : "Continue to payment gateway"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
