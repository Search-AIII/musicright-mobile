import { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../lib/auth-context";
import { supabase } from "../../lib/supabase";
import { colors, spacing, borderRadius, fontSize } from "../../lib/theme";

const US_ORGS = [
  { id: "usco", name: "US Copyright Office", icon: "document-text", desc: "Federal copyright protection", fee: "$65" },
  { id: "ascap", name: "ASCAP", icon: "radio", desc: "Performance royalties (PRO)", fee: "Free" },
  { id: "bmi", name: "BMI", icon: "radio", desc: "Performance royalties (PRO)", fee: "Free" },
  { id: "mlc", name: "The MLC", icon: "disc", desc: "Mechanical streaming royalties", fee: "Free" },
  { id: "soundexchange", name: "SoundExchange", icon: "headset", desc: "Digital performance royalties", fee: "Free" },
  { id: "hfa", name: "Harry Fox Agency", icon: "document", desc: "Mechanical licenses", fee: "Varies" },
];

const GLOBAL_REGIONS = [
  { region: "Europe", orgs: ["PRS (UK)", "GEMA (DE)", "SACEM (FR)", "SIAE (IT)", "SGAE (ES)"], count: 20 },
  { region: "Asia Pacific", orgs: ["JASRAC (JP)", "KOMCA (KR)", "APRA (AU)", "IPRS (IN)"], count: 15 },
  { region: "Latin America", orgs: ["ECAD (BR)", "SADAIC (AR)", "SAYCO (CO)"], count: 7 },
  { region: "Africa & Middle East", orgs: ["SAMRO (ZA)", "COSON (NG)", "ACUM (IL)"], count: 6 },
];

export default function Register() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"song" | "usa" | "global">("song");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [isrc, setIsrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [completedOrgs, setCompletedOrgs] = useState<string[]>([]);

  const handleRegisterSong = async () => {
    if (!title || !artist) {
      Alert.alert("Error", "Title and artist name are required");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("song_registrations").insert({
      user_id: user?.id,
      title,
      artist_name: artist,
      genre: genre || null,
      isrc: isrc || null,
      status: "pending",
    });
    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", `"${title}" has been registered.`);
      setTitle(""); setArtist(""); setGenre(""); setIsrc("");
    }
  };

  const toggleOrg = (id: string) => {
    setCompletedOrgs((prev) => prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabBar}>
        {[
          { key: "song", label: "New Song" },
          { key: "usa", label: "USA Rights" },
          { key: "global", label: "Global" },
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {tab === "song" && (
          <>
            <Text style={styles.heading}>Register a Song</Text>
            <Text style={styles.subheading}>Add your song to start protecting your rights</Text>

            <Text style={styles.label}>Song Title</Text>
            <TextInput style={styles.input} placeholder="e.g. So Hot" placeholderTextColor={colors.textMuted} value={title} onChangeText={setTitle} />

            <Text style={styles.label}>Artist Name</Text>
            <TextInput style={styles.input} placeholder="e.g. KTTeddy" placeholderTextColor={colors.textMuted} value={artist} onChangeText={setArtist} />

            <Text style={styles.label}>Genre (optional)</Text>
            <TextInput style={styles.input} placeholder="e.g. Pop, Hip-Hop, R&B" placeholderTextColor={colors.textMuted} value={genre} onChangeText={setGenre} />

            <Text style={styles.label}>ISRC (optional)</Text>
            <TextInput style={styles.input} placeholder="e.g. US-XXX-24-12345" placeholderTextColor={colors.textMuted} value={isrc} onChangeText={setIsrc} autoCapitalize="characters" />

            <TouchableOpacity onPress={handleRegisterSong} disabled={loading} activeOpacity={0.8}>
              <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitButton}>
                <Ionicons name="shield-checkmark" size={20} color={colors.textInverse} />
                <Text style={styles.submitText}>{loading ? "Registering..." : "Register Song"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {tab === "usa" && (
          <>
            <Text style={styles.heading}>USA Rights Registration</Text>
            <Text style={styles.subheading}>Register with all 6 organizations to collect 100% of your royalties</Text>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(completedOrgs.length / US_ORGS.length) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{completedOrgs.length}/{US_ORGS.length} completed</Text>

            {US_ORGS.map((org) => (
              <TouchableOpacity key={org.id} style={styles.orgCard} onPress={() => toggleOrg(org.id)} activeOpacity={0.7}>
                <View style={[styles.orgIcon, completedOrgs.includes(org.id) && { backgroundColor: colors.success + "20" }]}>
                  <Ionicons
                    name={completedOrgs.includes(org.id) ? "checkmark-circle" : (org.icon as any)}
                    size={24}
                    color={completedOrgs.includes(org.id) ? colors.success : colors.primary}
                  />
                </View>
                <View style={styles.orgInfo}>
                  <Text style={styles.orgName}>{org.name}</Text>
                  <Text style={styles.orgDesc}>{org.desc}</Text>
                </View>
                <View style={styles.feeBadge}>
                  <Text style={styles.feeText}>{org.fee}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {tab === "global" && (
          <>
            <Text style={styles.heading}>Global Registration</Text>
            <Text style={styles.subheading}>Register in 40+ countries to collect international royalties</Text>

            {GLOBAL_REGIONS.map((region) => (
              <View key={region.region} style={styles.regionCard}>
                <View style={styles.regionHeader}>
                  <Ionicons name="globe" size={20} color={colors.primary} />
                  <Text style={styles.regionName}>{region.region}</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{region.count} orgs</Text>
                  </View>
                </View>
                <View style={styles.orgsList}>
                  {region.orgs.map((org) => (
                    <View key={org} style={styles.orgChip}>
                      <Text style={styles.orgChipText}>{org}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}

        <View style={{ height: spacing.xxxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabBar: { flexDirection: "row", marginHorizontal: spacing.xxl, marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: 4 },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: "center", borderRadius: borderRadius.sm },
  tabActive: { backgroundColor: colors.primary + "20" },
  tabText: { fontSize: fontSize.sm, fontWeight: "600", color: colors.textMuted },
  tabTextActive: { color: colors.primary },
  content: { paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl },
  heading: { fontSize: fontSize.xxl, fontWeight: "800", color: colors.text, marginBottom: spacing.xs },
  subheading: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.xxl },
  label: { fontSize: fontSize.xs, fontWeight: "600", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.sm, marginTop: spacing.lg },
  input: { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, height: 52, color: colors.text, fontSize: fontSize.md },
  submitButton: { flexDirection: "row", height: 56, borderRadius: borderRadius.md, justifyContent: "center", alignItems: "center", marginTop: spacing.xxl, gap: spacing.sm },
  submitText: { color: colors.textInverse, fontSize: fontSize.lg, fontWeight: "700" },
  progressBar: { height: 6, backgroundColor: colors.surface, borderRadius: borderRadius.full, marginBottom: spacing.sm, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.primary, borderRadius: borderRadius.full },
  progressText: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xl },
  orgCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  orgIcon: { width: 44, height: 44, borderRadius: borderRadius.md, backgroundColor: colors.primary + "15", justifyContent: "center", alignItems: "center" },
  orgInfo: { flex: 1, marginLeft: spacing.md },
  orgName: { fontSize: fontSize.md, fontWeight: "600", color: colors.text },
  orgDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  feeBadge: { backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border },
  feeText: { fontSize: fontSize.xs, fontWeight: "700", color: colors.primary },
  regionCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  regionHeader: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
  regionName: { fontSize: fontSize.lg, fontWeight: "700", color: colors.text, marginLeft: spacing.sm, flex: 1 },
  countBadge: { backgroundColor: colors.primary + "20", paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  countText: { fontSize: fontSize.xs, fontWeight: "700", color: colors.primary },
  orgsList: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  orgChip: { backgroundColor: colors.background, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border },
  orgChipText: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: "500" },
});
