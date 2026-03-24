import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../lib/auth-context";
import { colors, spacing, borderRadius, fontSize } from "../../lib/theme";

const MENU_ITEMS = [
  { icon: "person-outline", label: "Edit Profile", screen: null },
  { icon: "card-outline", label: "Subscription & Billing", screen: null },
  { icon: "musical-notes-outline", label: "My Songs", screen: "/(tabs)/home" },
  { icon: "shield-checkmark-outline", label: "Registration Status", screen: "/(tabs)/register" },
  { icon: "globe-outline", label: "Global Registration", screen: "/(tabs)/register" },
  { icon: "notifications-outline", label: "Notifications", screen: null },
  { icon: "help-circle-outline", label: "Help & Support", screen: null },
  { icon: "document-text-outline", label: "Terms of Service", screen: null },
  { icon: "lock-closed-outline", label: "Privacy Policy", screen: null },
];

export default function Profile() {
  const { user, signOut } = useAuth();

  const displayName = user?.user_metadata?.full_name || "Artist";
  const email = user?.email || "";

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Profile</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Plan Badge */}
        <View style={styles.planCard}>
          <View style={styles.planBadge}>
            <Text style={styles.planText}>FREE PLAN</Text>
          </View>
          <Text style={styles.planDesc}>5 song registrations / month</Text>
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeText}>Upgrade to Pro — $9.99/mo</Text>
          </TouchableOpacity>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => item.screen && router.push(item.screen as any)}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={20} color={colors.textSecondary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>MusicRight.AI v1.0.0</Text>

        <View style={{ height: spacing.xxxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  heading: { fontSize: fontSize.xxl, fontWeight: "800", color: colors.text, paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl, marginBottom: spacing.xl },
  profileCard: { flexDirection: "row", alignItems: "center", marginHorizontal: spacing.xxl, backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary + "20", justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: fontSize.xxl, fontWeight: "800", color: colors.primary },
  profileInfo: { flex: 1, marginLeft: spacing.lg },
  profileName: { fontSize: fontSize.lg, fontWeight: "700", color: colors.text },
  profileEmail: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  editButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary + "15", justifyContent: "center", alignItems: "center" },
  planCard: { marginHorizontal: spacing.xxl, marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  planBadge: { backgroundColor: colors.primary + "20", paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, alignSelf: "flex-start" },
  planText: { fontSize: fontSize.xs, fontWeight: "700", color: colors.primary, letterSpacing: 1 },
  planDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm },
  upgradeButton: { marginTop: spacing.lg, backgroundColor: colors.primary + "15", paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: "center" },
  upgradeText: { fontSize: fontSize.sm, fontWeight: "600", color: colors.primary },
  menuSection: { marginTop: spacing.xxl, marginHorizontal: spacing.xxl },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: { width: 32 },
  menuLabel: { flex: 1, fontSize: fontSize.md, color: colors.text },
  signOutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginHorizontal: spacing.xxl, marginTop: spacing.xxl, paddingVertical: spacing.lg, gap: spacing.sm, backgroundColor: colors.error + "10", borderRadius: borderRadius.md },
  signOutText: { fontSize: fontSize.md, fontWeight: "600", color: colors.error },
  version: { textAlign: "center", fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.xxl },
});
