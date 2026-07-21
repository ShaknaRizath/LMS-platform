import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TimeSeriesChart } from "@/components/analytics/time-series-chart";
import { COORDINATOR_PALETTE } from "@/components/coordinator/palette";
import type { DocumentIssueTrendPoint } from "@/lib/examinations/dashboard";

export function DocumentIssueTrendCard({ data }: { data: DocumentIssueTrendPoint[] }) {
  const totalCertificates = data.reduce((sum, point) => sum + point.certificates, 0);
  const totalTranscripts = data.reduce((sum, point) => sum + point.transcripts, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Issue Trend</CardTitle>
        <CardDescription>Certificates &amp; transcripts issued, last 30 days</CardDescription>
      </CardHeader>
      <div className="flex flex-col gap-2 px-(--card-spacing) pb-(--card-spacing)">
        <p className="text-2xl font-semibold text-foreground">{totalCertificates + totalTranscripts} issued</p>
        {data.length > 0 ? (
          <TimeSeriesChart
            data={data}
            series={[
              { key: "certificates", label: "Certificates", color: COORDINATOR_PALETTE[0].accent },
              { key: "transcripts", label: "Transcripts", color: COORDINATOR_PALETTE[2].accent },
            ]}
          />
        ) : (
          <p className="text-sm text-muted-foreground">No documents issued in this window yet.</p>
        )}
      </div>
    </Card>
  );
}
