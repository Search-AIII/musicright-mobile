import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../lib/auth-context";
import { supabase } from "../../lib/supabase";
import { colors, spacing, borderRadius, fontSize } from "../../lib/theme";

interface Song {
  id: string;
  title: string;
  artist_name: string;
  status: string;
  created_at: string;
}

// Recent royalty activity (real data would come from Supabase + Stripe webhook)
const RECENT_ACTIVITY = [
  { source: "ASCAP",        amount: 1_840.50, type: "credit", icon: "radio",        date: "Today",       color: colors.primary },
  { source: "The MLC",      amount: 960.00,   type: "credit", icon: "disc",         date: "Yesterday",   color: colors.accent },
  { source: "SoundExchange", amount: 712.00,  type: "credit", icon: "headset",      date: "Apr 5",       color: "#9B59B6" },
  { source: "Bank Payout",  amount: 1_500.00, type: "debit",  icon: "card",         date: "Apr 3",       color: colors.error },
];

export default function Home() {
  const { user } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ registered: 0, pending: 0, totalRoyalties: 4_760, ytdEarnings: 4_760 });

  const fetchData = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("song_registrations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) {
      setSongs(data as Song[]);
      setStats({
        registered: data.filter((s: any) => s.status === "completed").length,
        pending: data.filter((s: any) => s.status === "pending").length,
        totalRoyalties: 4_760,
        ytdEarnings: 4_760,
      });
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Artist";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{displayName}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <Image source={require("../../assets/images/logo.jpg")} style={styles.headerLogo} />
          </View>
        </View>

        {/* ── Earnings Hero ── */}
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.earningsCard}
        >
          <View style={styles.earningsTop}>
            <View>
              <Text style={styles.earningsLabel}>2026 YTD Royalties</Text>
              <Text style={styles.earningsAmount}>${stats.ytdEarnings.toLocaleString()}</Text>
              <View style={styles.earningsTrend}>
                <Ionicons name="trending-up" size={14} color="rgba(0,0,0,0.7)" />
                <Text style={styles.earningsTrendText}>+23% vs last year</Text>
              </View>
            </View>
            <View style={styles.earningsIconBox}>
              <Ionicons name="wallet" size={32} color="rgba(0,0,0,0.4)" />
            </View>
          </View>

          <View style={styles.earningsRow}>
            <View style={styles.earningsItem}>
              <Text style={styles.earningsItemVal}>${stats.totalRoyalties.toLocaleString()}</Text>
              <Text style={styles.earningsItemLabel}>Available</Text>
            </View>
            <View style={styles.earningsDivider} />
            <View style={styles.earningsItem}>
              <Text style={styles.earningsItemVal}>$1,240</Text>
              <Text style={styles.earningsItemLabel}>Pending</Text>
            </View>
            <View style={styles.earningsDivider} />
            <View style={styles.earningsItem}>
              <Text style={styles.earningsItemVal}>{songs.length || 12}</Text>
              <Text style={styles.earningsItemLabel}>Songs</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.payoutBtn}
            onPress={() => router.push("/(tabs)/wallet")}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={16} color={colors.primary} />
            <Text style={styles.payoutBtnText}>Instant Payout</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: "add-circle",    label: "Register Song",  color: colors.primary,     onPress: () => router.push("/(tabs)/register") },
            { icon: "wallet",        label: "My Wallet",      color: colors.accent,      onPress: () => router.push("/(tabs)/wallet") },
            { icon: "share-social",  label: "Social Rights",  color: "#9B59B6",          onPress: () => router.push("/(tabs)/social") },
            { icon: "scan",          label: "Royalty Scan",   color: colors.warning,     onPress: () => router.push("/(tabs)/scanner") },
            { icon: "globe",         label: "Global Rights",  color: colors.primaryDark, onPress: () => router.push("/(tabs)/register") },
            { icon: "document-text", label: "DMCA Claim",     color: colors.error,       onPress: () => router.push("/(tabs)/social") },
          ].map((action, i) => (
            <TouchableOpacity key={i} style={styles.actionCard} onPress={action.onPress} activeOpacity={0.7}>
              <View style={[styles.actionIcon, { backgroundColor: action.color + "20" }]}>
                <Ionicons name={action.icon as any} size={22} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Recent Royalty Activity ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Royalty Activity</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/wallet")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {RECENT_ACTIVITY.map((activity, i) => (
          <View key={i} style={styles.activityRow}>
            <View style={[styles.activityIcon, { backgroundColor: activity.color + "20" }]}>
              <Ionicons name={activity.icon as any} size={20} color={activity.color} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activitySource}>{activity.source}</Text>
              <Text style={styles.activityDate}>{activity.date}</Text>
            </View>
            <Text style={[styles.activityAmount, { color: activity.type === "credit" ? colors.success : colors.error }]}>
              {activity.type === "credit" ? "+" : "-"}${activity.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        ))}

        {/* ── Recent Songs ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Songs</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/register")}>
            <Text style={styles.seeAll}>Register</Text>
          </TouchableOpacity>
        </View>

        {songs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No songs registered yet</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/register")} activeOpacity={0.8}>
              <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Register Your First Song</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          songs.map((song) => (
            <View key={song.id} style={styles.songCard}>
              <View style={styles.songIcon}>
                <Ionicons name="musical-note" size={20} color={colors.primary} />
              </View>
              <View style={styles.songInfo}>
                <Text style={styles.songTitle}>{song.title}</Text>
                <Text style={styles.songArtist}>{song.artist_name}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: song.status === "completed" ? colors.success + "20" : colors.warning + "20" }]}>
                <Text style={[styles.statusText, { color: song.status === "completed" ? colors.success : colors.warning }]}>
                  {song.status === "completed" ? "Registered" : "Pending"}
                </Text>
              </View>
            </View>
          ))
        )}

        {/* ── Pro Upsell Banner ── */}
        <TouchableOpacity activeOpacity={0.85} style={styles.proBanner}>
          <LinearGradient
            colors={["#1A1A2E", "#16213E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.proBannerGradient}
          >
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.proBannerTitle}>Unlock Full Royalty Recovery</Text>
              <Text style={styles.proBannerSub}>Auto-collect · AI gap scanner · 40+ countries</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: spacing.xxxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.xxl, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  greeting: { fontSize: fontSize.md, color: colors.textSecondary },
  name: { fontSize: fontSize.xxl, fontWeight: "800", color: colors.text },
  headerRight: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  notifBtn: { position: "relative" },
  notifDot: { position: "absolute", top: 0, right: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error },
  headerLogo: { width: 40, height: 40, borderRadius: borderRadius.md },

  // Earnings hero
  earningsCard: { marginHorizontal: spacing.xxl, borderRadius: borderRadius.xl, padding: spacing.xl, marginBottom: spacing.xxl },
  earningsTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.xl },
  earningsLabel: { fontSize: fontSize.xs, fontWeight: "600", color: "rgba(0,0,0,0.55)", textTransform: "uppercase", letterSpacing: 1 },
  earningsAmount: { fontSize: 40, fontWeight: "900", color: colors.textInverse, marginVertical: spacing.xs },
  earningsTrend: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  earningsTrendText: { fontSize: fontSize.xs, color: "rgba(0,0,0,0.6)", fontWeight: "600" },
  earningsIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },
  earningsRow: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg },
  earningsItem: { flex: 1, alignItems: "center" },
  earningsItemVal: { fontSize: fontSize.lg, fontWeight: "800", color: colors.textInverse },
  earningsItemLabel: { fontSize: 10, color: "rgba(0,0,0,0.55)", fontWeight: "600", textTransform: "uppercase", marginTop: 2 },
  earningsDivider: { width: 1, backgroundColor: "rgba(0,0,0,0.15)" },
  payoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, backgroundColor: "rgba(255,255,255,0.95)", borderRadius: borderRadius.md, paddingVertical: spacing.md },
  payoutBtnText: { fontSize: fontSize.md, fontWeight: "700", color: colors.primary, flex: 1, textAlign: "center" },

  // Section headers
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.xxl, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.xl, fontWeight: "700", color: colors.text, paddingHorizontal: spacing.xxl, marginBottom: spacing.lg },
  seeAll: { fontSize: fontSize.sm, fontWeight: "600", color: colors.primary },

  // Quick actions
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: spacing.xxl, gap: spacing.md, marginBottom: spacing.xxl },
  actionCard: { width: "30.5%", backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  actionIcon: { width: 44, height: 44, borderRadius: borderRadius.md, justifyContent: "center", alignItems: "center", marginBottom: spacing.sm },
  actionLabel: { fontSize: 11, fontWeight: "600", color: colors.text, textAlign: "center" },

  // Royalty activity
  activityRow: { flexDirection: "row", alignItems: "center", marginHorizontal: spacing.xxl, marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  activityIcon: { width: 40, height: 40, borderRadius: borderRadius.sm, justifyContent: "center", alignItems: "center" },
  activityInfo: { flex: 1, marginLeft: spacing.md },
  activitySource: { fontSize: fontSize.md, fontWeight: "600", color: colors.text },
  activityDate: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  activityAmount: { fontSize: fontSize.md, fontWeight: "700" },

  // Songs
  emptyState: { alignItems: "center", padding: spacing.xxxxl, marginHorizontal: spacing.xxl, backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border },
  emptyText: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.xl },
  emptyButton: { paddingHorizontal: spacing.xxl, paddingVertical: spacing.md, borderRadius: borderRadius.md },
  emptyButtonText: { color: colors.textInverse, fontWeight: "700", fontSize: fontSize.sm },
  songCard: { flexDirection: "row", alignItems: "center", marginHorizontal: spacing.xxl, marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  songIcon: { width: 40, height: 40, borderRadius: borderRadius.sm, backgroundColor: colors.primary + "15", justifyContent: "center", alignItems: "center" },
  songInfo: { flex: 1, marginLeft: spacing.md },
  songTitle: { fontSize: fontSize.md, fontWeight: "600", color: colors.text },
  songArtist: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  statusText: { fontSize: fontSize.xs, fontWeight: "700", textTransform: "uppercase" },

  // Pro banner
  proBanner: { marginHorizontal: spacing.xxl, marginTop: spacing.lg, borderRadius: borderRadius.lg, overflow: "hidden", borderWidth: 1, borderColor: colors.primary + "30" },
  proBannerGradient: { flexDirection: "row", alignItems: "center", padding: spacing.lg, gap: spacing.md },
  proBadge: { backgroundColor: colors.primary + "20", paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.primary },
  proBadgeText: { fontSize: 10, fontWeight: "800", color: colors.primary, letterSpacing: 1 },
  proBannerTitle: { fontSize: fontSize.md, fontWeight: "700", color: colors.text },
  proBannerSub: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
});
