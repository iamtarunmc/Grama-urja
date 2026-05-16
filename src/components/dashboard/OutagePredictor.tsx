"use client";

import { useState, useMemo } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { predictPowerOutages, PredictPowerOutagesOutput } from "@/ai/flows/predict-power-outages-flow";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Calendar, Brain, Loader2, CheckCircle2, Clock, RefreshCcw } from "lucide-react";

export function OutagePredictor({ villageId, villageName }: { villageId: string; villageName: string }) {
  const db = useFirestore();
  const [prediction, setPrediction] = useState<PredictPowerOutagesOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const logsQuery = useMemo(() => {
    return query(
      collection(db, "historical_logs", villageId, "events"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
  }, [db, villageId]);

  const { data: logs = [] } = useCollection(logsQuery);

  const handlePredict = async () => {
    setLoading(true);
    setError("");
    try {
      const historicalData = logs.map((log: any) => ({
        villageName,
        status: log.status,
        timestamp: log.timestamp,
        durationMinutes: log.durationMinutes || 0
      }));

      if (historicalData.length === 0) {
        historicalData.push({
          villageName,
          status: "ON" as const,
          timestamp: new Date(Date.now() - 86400000).toISOString()
        });
      }

      const result = await predictPowerOutages({
        historicalData,
        currentTime: new Date().toISOString()
      });

      setPrediction(result);
    } catch (err) {
      console.error("Prediction error:", err);
      setError("Unable to process grid history at this time.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border shadow-md rounded-2xl overflow-hidden">
      <CardHeader className="bg-secondary/30">
        <div className="flex items-center gap-2 text-primary">
          <Brain className="h-5 w-5" />
          <CardTitle className="text-xl">Outage Predictor</CardTitle>
        </div>
        <CardDescription>
          AI-powered forecast based on historical grid strain and maintenance logs.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {!prediction && !loading && (
          <div className="text-center py-6 space-y-4">
            <p className="text-muted-foreground">Analyze recent logs to forecast potential outages.</p>
            <Button onClick={handlePredict} className="rounded-xl px-8 h-12 font-bold text-lg">
              <TrendingUp className="h-5 w-5 mr-2" />
              Generate Prediction
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="font-medium text-muted-foreground">Consulting grid history...</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 p-4 rounded-xl text-destructive text-center font-medium">
            {error}
          </div>
        )}

        {prediction && !loading && (
          <div className="space-y-6">
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 italic text-primary font-medium">
              "{prediction.summary}"
            </div>

            {prediction.predictions.length > 0 ? (
              <div className="space-y-4">
                {prediction.predictions.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl border-l-4 border-l-accent bg-background shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 font-bold text-accent">
                        <AlertTriangle className="h-5 w-5" />
                        Potential Outage Window
                      </div>
                      {p.confidenceScore && (
                        <Badge variant="outline" className="text-accent border-accent">
                          {p.confidenceScore}% Confidence
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                      <div className="space-y-1">
                        <span className="text-muted-foreground uppercase text-[10px] tracking-widest">Start Time</span>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(p.predictedStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground uppercase text-[10px] tracking-widest">End Time</span>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {new Date(p.predictedEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-foreground bg-accent/5 p-2 rounded border border-accent/10">
                      <strong>Reason:</strong> {p.reason}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl text-primary font-bold">
                <CheckCircle2 className="h-6 w-6" />
                No critical outages predicted for the next 24 hours.
              </div>
            )}

            <Button variant="ghost" className="w-full text-muted-foreground hover:bg-primary/5 rounded-xl" onClick={handlePredict}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh Prediction
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
