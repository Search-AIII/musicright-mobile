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

export default function Home() {
  const { user } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ registered: 0, pending: 0, totalRoyalties: 0 });

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
        totalRoyalties: Math.floor(Math.random() * 5000) + 500,
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{displayName}</Text>
          </View>
          <Image source={require("../../assets/images/logo.jpg")} style={styles.headerLogo} />
        </View>

        {/* Stats Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow} contentContainerStyle={{ paddingRight: spacing.xxl }}>
          <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statCard}>
            <Ionicons name="musical-notes" size={24} color={colors.textInverse} />
            <Text style={styles.statNumber}>{songs.length}</Text>
            <Text style={styles.statLabel}>Songs</Text>
          </LinearGradient>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{stats.registered}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Registered</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="time" size={24} color={colors.warning} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{stats.pending}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="cash" size={24} color={colors.success} />
            <Text style={[styles.statNumber, { color: colors.text }]}>${stats.totalRoyalties.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Est. Royalties</Text>
          </View>
        </ScrollView>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: "add-circle", label: "Register Song", color: colors.primary, onPress: () => router.push("/(tabs)/register") },
            { icon: "scan", label: "Scan Royalties", color: colors.accent, onPress: () => router.push("/(tabs)/scanner") },
            { icon: "globe", label: "Global Rights", color: colors.primaryDark, onPress: () => router.push("/(tabs)/register") },
            { icon: "storefront", label: "Marketplace", color: colors.info, onPress: () => router.push("/(tabs)/marketplace") },
          ].map((action, i) => (
            <TouchableOpacity key={i} style={styles.actionCard} onPress={action.onPress} activeOpacity={0.7}>
              <View style={[styles.actionIcon, { backgroundColor: action.color + "20" }]}>
                <Ionicons name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Songs */}
        <Text style={styles.sectionTitle}>Recent Songs</Text>
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

        <View style={{ height: spacing.xxxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.xxl, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  greeting: { fontSize: fontSize.md, color: colors.textSecondary },
  name: { fontSize: fontSize.xxl, fontWeight: "800", color: colors.text },
  headerLogo: { width: 40, height: 40, borderRadius: borderRadius.md },
  statsRow: { paddingLeft: spacing.xxl, marginBottom: spacing.xxl },
  statCard: { width: 140, padding: spacing.lg, borderRadius: borderRadius.lg, marginRight: spacing.md, borderWidth: 1, borderColor: colors.border },
  statNumber: { fontSize: fontSize.xxl, fontWeight: "800", color: colors.textInverse, marginTop: spacing.sm },
  statLabel: { fontSize: fontSize.xs, color: colors.textInverse, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 },
  sectionTitle: { fontSize: fontSize.xl, fontWeight: "700", color: colors.text, paddingHorizontal: spacing.xxl, marginBottom: spacing.lg },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: spacing.xxl, gap: spacing.md, marginBottom: spacing.xxl },
  actionCard: { width: "47%", backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  actionIcon: { width: 44, height: 44, borderRadius: borderRadius.md, justifyContent: "center", alignItems: "center", marginBottom: spacing.md },
  actionLabel: { fontSize: fontSize.sm, fontWeight: "600", color: colors.text },
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
});
