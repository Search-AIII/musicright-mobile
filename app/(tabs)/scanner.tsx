import { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius, fontSize } from "../../lib/theme";

const SCAN_STEPS = [
  "Checking PRO registrations...",
  "Scanning MLC database...",
  "Cross-referencing SoundExchange...",
  "Checking international registrations...",
  "Analyzing streaming data...",
];

const GAPS = [
  { source: "The MLC", amount: 1240, severity: "high", desc: "Mechanical royalties unclaimed", fix: "Register at themlc.com" },
  { source: "SoundExchange", amount: 890, severity: "high", desc: "Digital performance royalties", fix: "Register at soundexchange.com" },
  { source: "PRS (UK)", amount: 1560, severity: "medium", desc: "International performance royalties", fix: "Register via Global Registration" },
  { source: "Publisher Share", amount: 1070, severity: "medium", desc: "Publishing royalties uncollected", fix: "Set up admin publishing" },
];

export default function Scanner() {
  const [step, setStep] = useState<"start" | "scanning" | "results">("start");
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const startScan = () => {
    setStep("scanning");
    setCurrentStep(0);
    setCompletedSteps([]);

    let i = 0;
    const interval = setInterval(() => {
      setCompletedSteps((prev) => [...prev, i]);
      i++;
      setCurrentStep(i);
      if (i >= SCAN_STEPS.length) {
        clearInterval(interval);
        setTimeout(() => setStep("results"), 800);
      }
    }, 1200);
  };

  const totalUnclaimed = GAPS.reduce((sum, g) => sum + g.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Royalty Gap Scanner</Text>
        <Text style={styles.subheading}>AI-powered detection of unclaimed royalties</Text>

        {step === "start" && (
          <View style={styles.startCard}>
            <View style={styles.scanIconContainer}>
              <Ionicons name="scan" size={48} color={colors.primary} />
            </View>
            <Text style={styles.startTitle}>Scan Your Catalog</Text>
            <Text style={styles.startDesc}>
              Our AI will cross-reference your registrations across all major royalty organizations to find money you're leaving on the table.
            </Text>
            <TouchableOpacity onPress={startScan} activeOpacity={0.8}>
              <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.scanButton}>
                <Ionicons name="flash" size={20} color={colors.textInverse} />
                <Text style={styles.scanButtonText}>Start AI Scan</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {step === "scanning" && (
          <View style={styles.scanningCard}>
            <View style={styles.spinnerContainer}>
              <Ionicons name="radio" size={32} color={colors.primary} />
            </View>
            <Text style={styles.scanningTitle}>Scanning your catalog...</Text>
            {SCAN_STEPS.map((s, i) => (
              <View key={i} style={styles.stepRow}>
                <Ionicons
                  name={completedSteps.includes(i) ? "checkmark-circle" : i === currentStep ? "ellipse" : "ellipse-outline"}
                  size={20}
                  color={completedSteps.includes(i) ? colors.success : i === currentStep ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.stepText, completedSteps.includes(i) && { color: colors.text }]}>{s}</Text>
              </View>
            ))}
          </View>
        )}

        {step === "results" && (
          <>
            {/* Total */}
            <LinearGradient colors={["#FF4757", "#FF6B81"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.totalCard}>
              <Text style={styles.totalLabel}>Estimated Unclaimed Royalties</Text>
              <Text style={styles.totalAmount}>${totalUnclaimed.toLocaleString()}</Text>
              <Text style={styles.totalDesc}>Found across {GAPS.length} sources</Text>
            </LinearGradient>

            {/* Gaps */}
            {GAPS.map((gap, i) => (
              <View key={i} style={styles.gapCard}>
                <View style={styles.gapHeader}>
                  <View style={[styles.severityDot, { backgroundColor: gap.severity === "high" ? colors.error : colors.warning }]} />
                  <Text style={styles.gapSource}>{gap.source}</Text>
                  <Text style={styles.gapAmount}>${gap.amount.toLocaleString()}</Text>
                </View>
                <Text style={styles.gapDesc}>{gap.desc}</Text>
                <TouchableOpacity style={styles.fixButton}>
                  <Text style={styles.fixText}>Fix This</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Recovery CTA */}
            <TouchableOpacity activeOpacity={0.8}>
              <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.recoverButton}>
                <Text style={styles.recoverText}>Recover Your Royalties</Text>
                <Text style={styles.recoverSubtext}>We handle everything for 15% commission</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep("start")} style={styles.rescanButton}>
              <Text style={styles.rescanText}>Scan Again</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: spacing.xxxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl },
  heading: { fontSize: fontSize.xxl, fontWeight: "800", color: colors.text, marginBottom: spacing.xs },
  subheading: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.xxl },
  startCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xxxl, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  scanIconContainer: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary + "15", justifyContent: "center", alignItems: "center", marginBottom: spacing.xxl },
  startTitle: { fontSize: fontSize.xl, fontWeight: "700", color: colors.text, marginBottom: spacing.md },
  startDesc: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: spacing.xxl },
  scanButton: { flexDirection: "row", paddingHorizontal: spacing.xxxl, paddingVertical: spacing.lg, borderRadius: borderRadius.md, alignItems: "center", gap: spacing.sm },
  scanButtonText: { color: colors.textInverse, fontSize: fontSize.lg, fontWeight: "700" },
  scanningCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xxl, borderWidth: 1, borderColor: colors.border },
  spinnerContainer: { alignItems: "center", marginBottom: spacing.xl },
  scanningTitle: { fontSize: fontSize.lg, fontWeight: "700", color: colors.text, textAlign: "center", marginBottom: spacing.xl },
  stepRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, gap: spacing.md },
  stepText: { fontSize: fontSize.md, color: colors.textMuted },
  totalCard: { borderRadius: borderRadius.xl, padding: spacing.xxl, alignItems: "center", marginBottom: spacing.xl },
  totalLabel: { fontSize: fontSize.sm, color: "rgba(255,255,255,0.8)", fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  totalAmount: { fontSize: 48, fontWeight: "900", color: "#fff", marginVertical: spacing.sm },
  totalDesc: { fontSize: fontSize.md, color: "rgba(255,255,255,0.7)" },
  gapCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  gapHeader: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  severityDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  gapSource: { fontSize: fontSize.md, fontWeight: "600", color: colors.text, flex: 1 },
  gapAmount: { fontSize: fontSize.lg, fontWeight: "800", color: colors.error },
  gapDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md },
  fixButton: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  fixText: { fontSize: fontSize.sm, fontWeight: "600", color: colors.primary },
  recoverButton: { borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: "center", marginTop: spacing.lg },
  recoverText: { fontSize: fontSize.lg, fontWeight: "700", color: colors.textInverse },
  recoverSubtext: { fontSize: fontSize.sm, color: "rgba(0,0,0,0.6)", marginTop: spacing.xs },
  rescanButton: { alignItems: "center", paddingVertical: spacing.xl },
  rescanText: { fontSize: fontSize.md, color: colors.primary, fontWeight: "600" },
});
