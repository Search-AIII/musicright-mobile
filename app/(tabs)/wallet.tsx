import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius, fontSize } from "../../lib/theme";

// ─── Mock Stripe-powered royalty data ────────────────────────────────────────
const AVAILABLE_BALANCE = 4_760.32;
const PENDING_BALANCE = 1_240.00;

interface Transaction {
  id: string;
  type: "credit" | "debit";
  source: string;
  amount: number;
  status: "completed" | "pending" | "processing";
  date: string;
  description: string;
  logo: string;
}

const TRANSACTIONS: Transaction[] = [
  { id: "t1",  type: "credit", source: "ASCAP",         amount: 1_840.50, status: "completed",  date: "Apr 12",  description: "Performance royalties Q1 2026",  logo: "radio" },
  { id: "t2",  type: "credit", source: "The MLC",        amount: 960.00,  status: "completed",  date: "Apr 10",  description: "Mechanical streaming royalties",  logo: "disc" },
  { id: "t3",  type: "debit",  source: "Bank Payout",    amount: 1_500.00, status: "completed", date: "Apr 8",   description: "Instant payout to Chase ••4242",  logo: "card" },
  { id: "t4",  type: "credit", source: "SoundExchange",  amount: 712.00,  status: "completed",  date: "Apr 5",   description: "Digital performance royalties",   logo: "headset" },
  { id: "t5",  type: "credit", source: "BMI",            amount: 547.82,  status: "completed",  date: "Mar 31",  description: "Performance royalties Q4 2025",   logo: "radio" },
  { id: "t6",  type: "credit", source: "Sync License",   amount: 200.00,  status: "processing", date: "Mar 28",  description: "Film placement — Midnight Drive",  logo: "film" },
  { id: "t7",  type: "credit", source: "The MLC",        amount: 240.00,  status: "pending",    date: "Mar 25",  description: "Mechanical royalties estimate",    logo: "disc" },
  { id: "t8",  type: "debit",  source: "Bank Payout",    amount: 800.00,  status: "completed",  date: "Mar 20",  description: "Standard payout to Chase ••4242", logo: "card" },
];

const SOURCES = [
  { name: "ASCAP",        amount: 3_240, pct: 68, color: "#00D4AA", icon: "radio" },
  { name: "The MLC",      amount: 1_200, pct: 25, color: "#00B4D8", icon: "disc" },
  { name: "SoundExchange", amount: 320,  pct: 7,  color: "#FFB800", icon: "headset" },
];

export default function Wallet() {
  const [tab, setTab] = useState<"overview" | "sources" | "payout">("overview");
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);

  const handleInstantPayout = () => {
    setShowPayoutModal(true);
  };

  const confirmPayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0 || amount > AVAILABLE_BALANCE) {
      Alert.alert("Invalid Amount", `Enter an amount between $1 and $${AVAILABLE_BALANCE.toLocaleString()}.`);
      return;
    }
    setPayoutLoading(true);
    // Simulates Stripe payout API call
    await new Promise((r) => setTimeout(r, 1800));
    setPayoutLoading(false);
    setShowPayoutModal(false);
    setPayoutAmount("");
    Alert.alert(
      "Payout Initiated",
      `$${amount.toFixed(2)} is on its way to your Chase ••4242 account. Arrives within minutes with Instant Payout.`,
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Balance Hero ── */}
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroLabel}>Available Balance</Text>
        <Text style={styles.heroAmount}>${AVAILABLE_BALANCE.toLocaleString("en-US", { minimumFractionDigits: 2 })}</Text>
        <View style={styles.pendingRow}>
          <Ionicons name="time-outline" size={14} color="rgba(0,0,0,0.6)" />
          <Text style={styles.pendingText}>${PENDING_BALANCE.toLocaleString()} pending</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.heroActions}>
          <TouchableOpacity style={styles.heroBtn} onPress={handleInstantPayout} activeOpacity={0.8}>
            <Ionicons name="flash" size={20} color={colors.primary} />
            <Text style={styles.heroBtnText}>Instant Payout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroBtn} activeOpacity={0.8}>
            <Ionicons name="add" size={20} color={colors.primary} />
            <Text style={styles.heroBtnText}>Add Bank</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroBtn} activeOpacity={0.8}>
            <Ionicons name="share-social" size={20} color={colors.primary} />
            <Text style={styles.heroBtnText}>Payment Link</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ── Tabs ── */}
      <View style={styles.tabBar}>
        {[
          { key: "overview", label: "Transactions" },
          { key: "sources",  label: "By Source" },
          { key: "payout",   label: "Payouts" },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key as any)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── TRANSACTIONS TAB ── */}
        {tab === "overview" && (
          <>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {TRANSACTIONS.map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: tx.type === "credit" ? colors.success + "20" : colors.error + "15" }]}>
                  <Ionicons
                    name={tx.logo as any}
                    size={20}
                    color={tx.type === "credit" ? colors.success : colors.error}
                  />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txSource}>{tx.source}</Text>
                  <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={[styles.txAmount, { color: tx.type === "credit" ? colors.success : colors.error }]}>
                    {tx.type === "credit" ? "+" : "-"}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </Text>
                  <View style={[styles.statusPill, {
                    backgroundColor:
                      tx.status === "completed" ? colors.success + "20" :
                      tx.status === "processing" ? colors.accent + "20" :
                      colors.warning + "20",
                  }]}>
                    <Text style={[styles.statusText, {
                      color:
                        tx.status === "completed" ? colors.success :
                        tx.status === "processing" ? colors.accent :
                        colors.warning,
                    }]}>
                      {tx.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ── BY SOURCE TAB ── */}
        {tab === "sources" && (
          <>
            <Text style={styles.sectionTitle}>Royalty Sources</Text>

            {/* Annual total */}
            <LinearGradient
              colors={["#1A1A2E", "#16213E"]}
              style={styles.annualCard}
            >
              <Text style={styles.annualLabel}>2026 YTD Earnings</Text>
              <Text style={styles.annualAmount}>$4,760.32</Text>
              <Text style={styles.annualSub}>+23% vs same period last year</Text>
            </LinearGradient>

            {SOURCES.map((src) => (
              <View key={src.name} style={styles.sourceCard}>
                <View style={[styles.sourceIcon, { backgroundColor: src.color + "20" }]}>
                  <Ionicons name={src.icon as any} size={22} color={src.color} />
                </View>
                <View style={styles.sourceInfo}>
                  <View style={styles.sourceTop}>
                    <Text style={styles.sourceName}>{src.name}</Text>
                    <Text style={styles.sourceAmount}>${src.amount.toLocaleString()}</Text>
                  </View>
                  <View style={styles.sourceBar}>
                    <View style={[styles.sourceBarFill, { width: `${src.pct}%` as any, backgroundColor: src.color }]} />
                  </View>
                  <Text style={styles.sourcePct}>{src.pct}% of total royalties</Text>
                </View>
              </View>
            ))}

            {/* Gap alert */}
            <TouchableOpacity style={styles.gapAlert} activeOpacity={0.8}>
              <View style={styles.gapAlertIcon}>
                <Ionicons name="warning" size={20} color={colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.gapAlertTitle}>$4,760 unclaimed detected</Text>
                <Text style={styles.gapAlertSub}>Tap to scan gaps across all PROs</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.warning} />
            </TouchableOpacity>
          </>
        )}

        {/* ── PAYOUT TAB ── */}
        {tab === "payout" && (
          <>
            <Text style={styles.sectionTitle}>Payout Settings</Text>

            {/* Connected bank */}
            <View style={styles.bankCard}>
              <View style={styles.bankIcon}>
                <Ionicons name="card" size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bankName}>Chase Bank</Text>
                <Text style={styles.bankAcct}>Checking ••••4242</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>

            {/* Payout schedule options */}
            {[
              { title: "Instant Payout", sub: "Arrives in minutes · 1.5% fee",        icon: "flash",    active: true  },
              { title: "Next-Day",       sub: "Arrives next business day · Free",      icon: "calendar", active: false },
              { title: "Weekly",         sub: "Every Friday · Free",                   icon: "repeat",   active: false },
              { title: "Monthly",        sub: "1st of month · Free",                   icon: "today",    active: false },
            ].map((opt, i) => (
              <TouchableOpacity key={i} style={styles.scheduleCard} activeOpacity={0.7}>
                <View style={[styles.scheduleIcon, opt.active && { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name={opt.icon as any} size={20} color={opt.active ? colors.primary : colors.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scheduleTitle}>{opt.title}</Text>
                  <Text style={styles.scheduleSub}>{opt.sub}</Text>
                </View>
                {opt.active && (
                  <View style={styles.activeDot}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {/* Stripe powered badge */}
            <View style={styles.stripeBadge}>
              <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
              <Text style={styles.stripeText}>Powered by Stripe · Bank-grade encryption</Text>
            </View>

            <TouchableOpacity style={styles.addBankBtn} activeOpacity={0.8}>
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={styles.addBankText}>Add Another Bank Account</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Instant Payout Modal ── */}
      <Modal visible={showPayoutModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Instant Payout</Text>
              <TouchableOpacity onPress={() => setShowPayoutModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Amount</Text>
            <View style={styles.modalInputRow}>
              <Text style={styles.modalDollar}>$</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                value={payoutAmount}
                onChangeText={setPayoutAmount}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>
            <Text style={styles.modalAvail}>Available: ${AVAILABLE_BALANCE.toLocaleString()}</Text>

            <View style={styles.modalDestination}>
              <Ionicons name="card-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.modalDestText}>Chase ••4242 · Instant (1–2 min)</Text>
            </View>

            <TouchableOpacity
              onPress={confirmPayout}
              disabled={payoutLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalConfirmBtn}
              >
                <Ionicons name="flash" size={18} color={colors.textInverse} />
                <Text style={styles.modalConfirmText}>
                  {payoutLoading ? "Processing..." : "Send Instantly"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.modalFee}>1.5% instant fee applies · Stripe secured</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl, paddingBottom: spacing.xxxl },
  heroLabel: { fontSize: fontSize.sm, color: "rgba(0,0,0,0.6)", fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  heroAmount: { fontSize: 44, fontWeight: "900", color: colors.textInverse, marginVertical: spacing.sm },
  pendingRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.xl },
  pendingText: { fontSize: fontSize.sm, color: "rgba(0,0,0,0.6)", fontWeight: "500" },
  heroActions: { flexDirection: "row", gap: spacing.md },
  heroBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: borderRadius.md, paddingVertical: spacing.md },
  heroBtnText: { fontSize: 11, fontWeight: "700", color: colors.primary },
  tabBar: { flexDirection: "row", marginHorizontal: spacing.xxl, marginVertical: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: 4 },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: "center", borderRadius: borderRadius.sm },
  tabActive: { backgroundColor: colors.primary + "20" },
  tabText: { fontSize: fontSize.sm, fontWeight: "600", color: colors.textMuted },
  tabTextActive: { color: colors.primary },
  scroll: { paddingHorizontal: spacing.xxl },
  sectionTitle: { fontSize: fontSize.xl, fontWeight: "700", color: colors.text, marginBottom: spacing.lg },

  // Transactions
  txRow: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  txIcon: { width: 44, height: 44, borderRadius: borderRadius.md, justifyContent: "center", alignItems: "center" },
  txInfo: { flex: 1, marginLeft: spacing.md },
  txSource: { fontSize: fontSize.md, fontWeight: "600", color: colors.text },
  txDesc: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  txDate: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  txRight: { alignItems: "flex-end", gap: spacing.xs },
  txAmount: { fontSize: fontSize.md, fontWeight: "700" },
  statusPill: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
  statusText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },

  // Sources
  annualCard: { borderRadius: borderRadius.lg, padding: spacing.xl, marginBottom: spacing.xl, alignItems: "center" },
  annualLabel: { fontSize: fontSize.xs, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1, fontWeight: "600" },
  annualAmount: { fontSize: 36, fontWeight: "900", color: colors.primary, marginVertical: spacing.sm },
  annualSub: { fontSize: fontSize.sm, color: colors.success, fontWeight: "600" },
  sourceCard: { flexDirection: "row", alignItems: "flex-start", backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  sourceIcon: { width: 44, height: 44, borderRadius: borderRadius.md, justifyContent: "center", alignItems: "center" },
  sourceInfo: { flex: 1, marginLeft: spacing.md },
  sourceTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  sourceName: { fontSize: fontSize.md, fontWeight: "600", color: colors.text },
  sourceAmount: { fontSize: fontSize.md, fontWeight: "700", color: colors.text },
  sourceBar: { height: 6, backgroundColor: colors.border, borderRadius: borderRadius.full, overflow: "hidden", marginBottom: spacing.xs },
  sourceBarFill: { height: "100%", borderRadius: borderRadius.full },
  sourcePct: { fontSize: fontSize.xs, color: colors.textSecondary },
  gapAlert: { flexDirection: "row", alignItems: "center", backgroundColor: colors.warning + "15", borderRadius: borderRadius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.warning + "40", marginTop: spacing.md, gap: spacing.md },
  gapAlertIcon: { width: 40, height: 40, borderRadius: borderRadius.md, backgroundColor: colors.warning + "20", justifyContent: "center", alignItems: "center" },
  gapAlertTitle: { fontSize: fontSize.md, fontWeight: "600", color: colors.warning },
  gapAlertSub: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },

  // Payout
  bankCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl, gap: spacing.md },
  bankIcon: { width: 48, height: 48, borderRadius: borderRadius.md, backgroundColor: colors.primary + "15", justifyContent: "center", alignItems: "center" },
  bankName: { fontSize: fontSize.md, fontWeight: "600", color: colors.text },
  bankAcct: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.success + "15", paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.full },
  verifiedText: { fontSize: fontSize.xs, fontWeight: "700", color: colors.success },
  scheduleCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  scheduleIcon: { width: 40, height: 40, borderRadius: borderRadius.md, backgroundColor: colors.border, justifyContent: "center", alignItems: "center" },
  scheduleTitle: { fontSize: fontSize.md, fontWeight: "600", color: colors.text },
  scheduleSub: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  activeDot: {},
  stripeBadge: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, marginTop: spacing.md },
  stripeText: { fontSize: fontSize.xs, color: colors.textMuted },
  addBankBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: spacing.xl, gap: spacing.sm, paddingVertical: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, borderStyle: "dashed" },
  addBankText: { fontSize: fontSize.md, fontWeight: "600", color: colors.primary },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.xxl },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xxl },
  modalTitle: { fontSize: fontSize.xl, fontWeight: "700", color: colors.text },
  modalLabel: { fontSize: fontSize.xs, fontWeight: "600", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.sm },
  modalInputRow: { flexDirection: "row", alignItems: "center", backgroundColor: colors.background, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  modalDollar: { fontSize: 28, fontWeight: "700", color: colors.textMuted, marginRight: spacing.sm },
  modalInput: { flex: 1, fontSize: 32, fontWeight: "800", color: colors.text, paddingVertical: spacing.lg },
  modalAvail: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xl },
  modalDestination: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.background, borderRadius: borderRadius.md, padding: spacing.lg, marginBottom: spacing.xxl },
  modalDestText: { fontSize: fontSize.md, color: colors.text, fontWeight: "500" },
  modalConfirmBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 56, borderRadius: borderRadius.md, gap: spacing.sm },
  modalConfirmText: { fontSize: fontSize.lg, fontWeight: "700", color: colors.textInverse },
  modalFee: { textAlign: "center", fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.md },
});
