import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  TextInput,
  Linking,
  Clipboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius, fontSize } from "../../lib/theme";

// ─── Platform icons / colors ──────────────────────────────────────────────────
const PLATFORMS = [
  { name: "Instagram",  icon: "logo-instagram", color: "#E1306C", bg: "#E1306C15" },
  { name: "TikTok",     icon: "logo-tiktok",    color: "#010101", bg: "#ffffff15" },
  { name: "Twitter/X",  icon: "logo-twitter",   color: "#1DA1F2", bg: "#1DA1F215" },
  { name: "YouTube",    icon: "logo-youtube",   color: "#FF0000", bg: "#FF000015" },
  { name: "Facebook",   icon: "logo-facebook",  color: "#1877F2", bg: "#1877F215" },
  { name: "LinkedIn",   icon: "logo-linkedin",  color: "#0077B5", bg: "#0077B515" },
];

// ─── Pre-built copyright caption templates ────────────────────────────────────
const CAPTION_TEMPLATES = [
  {
    id: "protected",
    title: "Copyright Protected",
    icon: "shield-checkmark",
    color: colors.primary,
    caption: `🎵 This music is protected by copyright law.
© 2026 [Artist Name] — All rights reserved.
ISRC: [ISRC Code]
Registered with ASCAP · BMI · The MLC

Any unauthorized use, reproduction, or distribution
without written permission is strictly prohibited.

#MusicRights #CopyrightProtected #OriginalMusic`,
  },
  {
    id: "release",
    title: "New Release Announcement",
    icon: "megaphone",
    color: colors.accent,
    caption: `🚀 NEW MUSIC IS HERE! 🎶

"[Song Title]" — out now everywhere.

Stream it, love it, share it — just don't steal it 😅
All rights reserved. © 2026 [Artist Name]

Copyright registered · ISRC: [ISRC Code]

#NewMusic #NewRelease #[Genre] #MusicRights`,
  },
  {
    id: "dmca",
    title: "DMCA Infringement Notice",
    icon: "warning",
    color: colors.error,
    caption: `⚠️ COPYRIGHT INFRINGEMENT NOTICE ⚠️

This content uses my original music "[Song Title]"
without authorization. © 2026 [Artist Name]

A formal DMCA takedown has been filed.
Content must be removed immediately.

For licensing inquiries: [Email]
Registration: US Copyright Office · ASCAP

#DMCA #CopyrightInfringement #MusicRights`,
  },
  {
    id: "license",
    title: "License My Music",
    icon: "cash",
    color: colors.success,
    caption: `🎵 Want to use my music in your content?

I offer affordable sync licenses for:
✅ YouTube videos
✅ Instagram / TikTok
✅ Podcasts & films
✅ Commercial use

DM me or email: [Email]
All songs registered with ASCAP & MusicRight.AI

#SyncLicense #MusicLicensing #MusicForContent`,
  },
  {
    id: "streaming",
    title: "Stream & Support",
    icon: "headset",
    color: "#9B59B6",
    caption: `🎵 Streaming my music helps me collect royalties!

Every stream on Spotify, Apple Music & YouTube
pays me mechanical + performance royalties.

Skip the pirated version — stream it legally ✅
Your plays = my paycheck 🙏

Link in bio 👆
© 2026 [Artist Name] · All rights reserved

#SupportArtists #StreamMusic #MusicRights`,
  },
];

// ─── DMCA Fields ──────────────────────────────────────────────────────────────
const DMCA_PLATFORMS = [
  { name: "YouTube",   url: "youtube.com/copyright_complaint_form", icon: "logo-youtube",   color: "#FF0000" },
  { name: "Instagram", url: "instagram.com/legal/copyright",        icon: "logo-instagram", color: "#E1306C" },
  { name: "TikTok",    url: "tiktok.com/legal/report/Copyright",    icon: "logo-tiktok",    color: "#010101" },
  { name: "Spotify",   url: "artists.spotify.com/help",            icon: "headset",         color: "#1DB954" },
  { name: "Twitter/X", url: "help.twitter.com/forms/dmca",         icon: "logo-twitter",   color: "#1DA1F2" },
];

export default function Social() {
  const [tab, setTab] = useState<"captions" | "dmca" | "share">("captions");
  const [selectedCaption, setSelectedCaption] = useState<typeof CAPTION_TEMPLATES[0] | null>(null);
  const [editedCaption, setEditedCaption] = useState("");
  const [activePlatforms, setActivePlatforms] = useState<string[]>(["Instagram"]);
  const [dmcaSong, setDmcaSong] = useState("");
  const [dmcaUrl, setDmcaUrl] = useState("");

  const selectCaption = (tpl: typeof CAPTION_TEMPLATES[0]) => {
    setSelectedCaption(tpl);
    setEditedCaption(tpl.caption);
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert("Copied!", "Caption copied to clipboard. Paste it into your post.");
  };

  const handleShare = async (text: string) => {
    try {
      await Share.share({ message: text });
    } catch {
      Alert.alert("Error", "Could not open share sheet.");
    }
  };

  const togglePlatform = (name: string) => {
    setActivePlatforms((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const generateDmca = () => {
    if (!dmcaSong || !dmcaUrl) {
      Alert.alert("Fill in fields", "Enter the song name and infringing URL.");
      return;
    }
    const notice = `DMCA TAKEDOWN NOTICE
Date: ${new Date().toDateString()}

To Whom It May Concern,

I am the copyright owner of the musical work "${dmcaSong}".
The following URL contains my copyrighted content without authorization:

${dmcaUrl}

I have a good faith belief that use of the copyrighted material
described above is not authorized by the copyright owner, its agent,
or applicable law.

I declare, under penalty of perjury, that the information in this
notification is accurate and I am the copyright owner.

This DMCA notice is submitted via MusicRight.AI.
Registration: US Copyright Office & ASCAP
`;
    copyToClipboard(notice);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.heading}>Social Rights Hub</Text>
        <Text style={styles.subheading}>Protect & promote your music online</Text>
      </View>

      {/* ── Tab bar ── */}
      <View style={styles.tabBar}>
        {[
          { key: "captions", label: "Captions" },
          { key: "dmca",     label: "DMCA" },
          { key: "share",    label: "Certificate" },
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

        {/* ══ CAPTIONS TAB ══ */}
        {tab === "captions" && (
          <>
            {/* Platform selector */}
            <Text style={styles.sectionTitle}>Post to</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.platformRow} contentContainerStyle={{ paddingRight: spacing.xxl }}>
              {PLATFORMS.map((p) => (
                <TouchableOpacity
                  key={p.name}
                  style={[styles.platformChip, activePlatforms.includes(p.name) && { borderColor: p.color, backgroundColor: p.bg }]}
                  onPress={() => togglePlatform(p.name)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={p.icon as any} size={18} color={activePlatforms.includes(p.name) ? p.color : colors.textMuted} />
                  <Text style={[styles.platformName, activePlatforms.includes(p.name) && { color: p.color }]}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Caption templates */}
            <Text style={styles.sectionTitle}>Choose Template</Text>
            {CAPTION_TEMPLATES.map((tpl) => (
              <TouchableOpacity
                key={tpl.id}
                style={[styles.tplCard, selectedCaption?.id === tpl.id && { borderColor: tpl.color }]}
                onPress={() => selectCaption(tpl)}
                activeOpacity={0.7}
              >
                <View style={[styles.tplIcon, { backgroundColor: tpl.color + "20" }]}>
                  <Ionicons name={tpl.icon as any} size={22} color={tpl.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tplTitle}>{tpl.title}</Text>
                  <Text style={styles.tplPreview} numberOfLines={2}>{tpl.caption.substring(0, 80)}...</Text>
                </View>
                {selectedCaption?.id === tpl.id && (
                  <Ionicons name="checkmark-circle" size={20} color={tpl.color} />
                )}
              </TouchableOpacity>
            ))}

            {/* Editor */}
            {selectedCaption && (
              <View style={styles.editorCard}>
                <Text style={styles.editorLabel}>Edit Caption</Text>
                <TextInput
                  style={styles.editorInput}
                  multiline
                  value={editedCaption}
                  onChangeText={setEditedCaption}
                  placeholderTextColor={colors.textMuted}
                  textAlignVertical="top"
                />
                <View style={styles.editorActions}>
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={() => copyToClipboard(editedCaption)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="copy-outline" size={18} color={colors.primary} />
                    <Text style={styles.copyBtnText}>Copy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleShare(editedCaption)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.accent]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.shareBtn}
                    >
                      <Ionicons name="share-social" size={18} color={colors.textInverse} />
                      <Text style={styles.shareBtnText}>Share Now</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

        {/* ══ DMCA TAB ══ */}
        {tab === "dmca" && (
          <>
            <View style={styles.dmcaAlert}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              <Text style={styles.dmcaAlertText}>
                MusicRight.AI generates DMCA-compliant takedown notices. File directly on each platform.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Generate DMCA Notice</Text>

            <Text style={styles.fieldLabel}>Your Song Title</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. So Hot (feat. KTTeddy)"
              placeholderTextColor={colors.textMuted}
              value={dmcaSong}
              onChangeText={setDmcaSong}
            />

            <Text style={styles.fieldLabel}>Infringing Content URL</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="https://www.tiktok.com/..."
              placeholderTextColor={colors.textMuted}
              value={dmcaUrl}
              onChangeText={setDmcaUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <TouchableOpacity onPress={generateDmca} activeOpacity={0.8}>
              <LinearGradient
                colors={[colors.error, "#FF6B81"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.dmcaBtn}
              >
                <Ionicons name="document-text" size={20} color="#fff" />
                <Text style={styles.dmcaBtnText}>Generate & Copy DMCA Notice</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Direct filing links */}
            <Text style={styles.sectionTitle}>File Directly On Platform</Text>
            {DMCA_PLATFORMS.map((p) => (
              <View key={p.name} style={styles.dmcaPlatformCard}>
                <View style={[styles.dmcaPlatformIcon, { backgroundColor: p.color + "15" }]}>
                  <Ionicons name={p.icon as any} size={22} color={p.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dmcaPlatformName}>{p.name}</Text>
                  <Text style={styles.dmcaPlatformUrl}>{p.url}</Text>
                </View>
                <TouchableOpacity
                  style={styles.dmcaFileBtn}
                  onPress={() => Linking.openURL(`https://${p.url}`)}
                >
                  <Text style={styles.dmcaFileBtnText}>File</Text>
                  <Ionicons name="open-outline" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Pro tip */}
            <View style={styles.proTip}>
              <Text style={styles.proTipTitle}>Pro Tip</Text>
              <Text style={styles.proTipText}>
                Register your songs with the US Copyright Office ($65) before filing DMCA claims. It allows you to sue for statutory damages up to $150,000 per infringement.
              </Text>
            </View>
          </>
        )}

        {/* ══ CERTIFICATE TAB ══ */}
        {tab === "share" && (
          <>
            <Text style={styles.sectionTitle}>Share Copyright Certificate</Text>
            <Text style={styles.certDesc}>
              Show the world your music is legally protected. Share a verified certificate on any platform.
            </Text>

            {/* Mock certificate */}
            <LinearGradient
              colors={["#1A1A2E", "#16213E", "#0F3460"]}
              style={styles.certCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.certHeader}>
                <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
                <Text style={styles.certBrand}>MusicRight.AI</Text>
              </View>
              <Text style={styles.certTitle}>CERTIFICATE OF REGISTRATION</Text>
              <View style={styles.certDivider} />
              <Text style={styles.certSongTitle}>So Hot (feat. KTTeddy)</Text>
              <Text style={styles.certArtist}>KTTeddy</Text>
              <View style={styles.certMeta}>
                <View style={styles.certMetaItem}>
                  <Text style={styles.certMetaLabel}>ISRC</Text>
                  <Text style={styles.certMetaValue}>US-XXX-26-12345</Text>
                </View>
                <View style={styles.certMetaItem}>
                  <Text style={styles.certMetaLabel}>REGISTERED</Text>
                  <Text style={styles.certMetaValue}>Apr 13, 2026</Text>
                </View>
                <View style={styles.certMetaItem}>
                  <Text style={styles.certMetaLabel}>PROs</Text>
                  <Text style={styles.certMetaValue}>ASCAP · BMI · MLC</Text>
                </View>
              </View>
              <View style={styles.certFooter}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                <Text style={styles.certVerified}>Verified & Protected</Text>
              </View>
            </LinearGradient>

            {/* Share actions */}
            <Text style={styles.sectionTitle}>Share Your Certificate</Text>
            <View style={styles.certActions}>
              {PLATFORMS.slice(0, 4).map((p) => (
                <TouchableOpacity
                  key={p.name}
                  style={[styles.certPlatformBtn, { backgroundColor: p.bg, borderColor: p.color + "40" }]}
                  onPress={() => handleShare(`My music is officially copyright registered! © 2026 KTTeddy · Protected by MusicRight.AI\n\n#CopyrightProtected #MusicRights #${p.name}`)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={p.icon as any} size={24} color={p.color} />
                  <Text style={[styles.certPlatformName, { color: p.color }]}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.downloadCertBtn}
              onPress={() => Alert.alert("Download Certificate", "Your PDF certificate will be emailed to you.")}
              activeOpacity={0.8}
            >
              <Ionicons name="download-outline" size={20} color={colors.primary} />
              <Text style={styles.downloadCertText}>Download PDF Certificate</Text>
            </TouchableOpacity>

            {/* Social stats */}
            <View style={styles.socialStats}>
              <Text style={styles.socialStatsTitle}>Your Protection Stats</Text>
              {[
                { label: "Songs Protected",       value: "12",         icon: "musical-notes",     color: colors.primary },
                { label: "DMCA Notices Filed",    value: "3",          icon: "warning",           color: colors.error },
                { label: "Certificates Shared",   value: "28",         icon: "share-social",      color: colors.accent },
                { label: "Infringements Stopped", value: "3",          icon: "shield-checkmark",  color: colors.success },
              ].map((stat, i) => (
                <View key={i} style={styles.statRow}>
                  <View style={[styles.statRowIcon, { backgroundColor: stat.color + "15" }]}>
                    <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                  </View>
                  <Text style={styles.statRowLabel}>{stat.label}</Text>
                  <Text style={[styles.statRowValue, { color: stat.color }]}>{stat.value}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl },
  heading: { fontSize: fontSize.xxl, fontWeight: "800", color: colors.text },
  subheading: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
  tabBar: { flexDirection: "row", marginHorizontal: spacing.xxl, marginBottom: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: 4 },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: "center", borderRadius: borderRadius.sm },
  tabActive: { backgroundColor: colors.primary + "20" },
  tabText: { fontSize: fontSize.sm, fontWeight: "600", color: colors.textMuted },
  tabTextActive: { color: colors.primary },
  scroll: { paddingHorizontal: spacing.xxl },
  sectionTitle: { fontSize: fontSize.xl, fontWeight: "700", color: colors.text, marginBottom: spacing.lg, marginTop: spacing.md },

  // Platform chips
  platformRow: { marginLeft: -spacing.xxl, paddingLeft: spacing.xxl, marginBottom: spacing.lg, marginRight: -spacing.xxl },
  platformChip: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginRight: spacing.sm },
  platformName: { fontSize: fontSize.sm, fontWeight: "600", color: colors.textMuted },

  // Caption templates
  tplCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  tplIcon: { width: 44, height: 44, borderRadius: borderRadius.md, justifyContent: "center", alignItems: "center" },
  tplTitle: { fontSize: fontSize.md, fontWeight: "600", color: colors.text, marginBottom: spacing.xs },
  tplPreview: { fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: 16 },

  // Editor
  editorCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginTop: spacing.lg },
  editorLabel: { fontSize: fontSize.xs, fontWeight: "600", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.md },
  editorInput: { color: colors.text, fontSize: fontSize.sm, lineHeight: 22, minHeight: 180, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm, padding: spacing.md, marginBottom: spacing.lg },
  editorActions: { flexDirection: "row", gap: spacing.md },
  copyBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, borderWidth: 1, borderColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.md },
  copyBtnText: { fontSize: fontSize.md, fontWeight: "600", color: colors.primary },
  shareBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, borderRadius: borderRadius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  shareBtnText: { fontSize: fontSize.md, fontWeight: "700", color: colors.textInverse },

  // DMCA
  dmcaAlert: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md, backgroundColor: colors.primary + "15", borderRadius: borderRadius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.primary + "30", marginBottom: spacing.xl },
  dmcaAlertText: { flex: 1, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
  fieldLabel: { fontSize: fontSize.xs, fontWeight: "600", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.sm, marginTop: spacing.lg },
  fieldInput: { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, height: 52, color: colors.text, fontSize: fontSize.md },
  dmcaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 56, borderRadius: borderRadius.md, gap: spacing.sm, marginTop: spacing.xxl, marginBottom: spacing.xxl },
  dmcaBtnText: { fontSize: fontSize.lg, fontWeight: "700", color: "#fff" },
  dmcaPlatformCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  dmcaPlatformIcon: { width: 44, height: 44, borderRadius: borderRadius.md, justifyContent: "center", alignItems: "center" },
  dmcaPlatformName: { fontSize: fontSize.md, fontWeight: "600", color: colors.text },
  dmcaPlatformUrl: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  dmcaFileBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.primary + "15", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  dmcaFileBtnText: { fontSize: fontSize.sm, fontWeight: "600", color: colors.primary },
  proTip: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, padding: spacing.lg, borderLeftWidth: 3, borderLeftColor: colors.primary, marginTop: spacing.lg },
  proTipTitle: { fontSize: fontSize.sm, fontWeight: "700", color: colors.primary, marginBottom: spacing.sm },
  proTipText: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },

  // Certificate
  certDesc: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.xl, lineHeight: 22 },
  certCard: { borderRadius: borderRadius.xl, padding: spacing.xxl, marginBottom: spacing.xxl, borderWidth: 1, borderColor: colors.primary + "30" },
  certHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.xl },
  certBrand: { fontSize: fontSize.xl, fontWeight: "800", color: colors.primary },
  certTitle: { fontSize: fontSize.xs, fontWeight: "700", color: colors.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: spacing.xl },
  certDivider: { height: 1, backgroundColor: colors.primary + "30", marginBottom: spacing.xl },
  certSongTitle: { fontSize: fontSize.xxl, fontWeight: "800", color: colors.text, marginBottom: spacing.sm },
  certArtist: { fontSize: fontSize.lg, color: colors.textSecondary, marginBottom: spacing.xl },
  certMeta: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xl },
  certMetaItem: {},
  certMetaLabel: { fontSize: 10, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1 },
  certMetaValue: { fontSize: fontSize.xs, fontWeight: "600", color: colors.text, marginTop: 4 },
  certFooter: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.primary + "20" },
  certVerified: { fontSize: fontSize.sm, fontWeight: "700", color: colors.primary },

  // Certificate share buttons
  certActions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.xl },
  certPlatformBtn: { width: "47%", borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: "center", borderWidth: 1, gap: spacing.sm },
  certPlatformName: { fontSize: fontSize.sm, fontWeight: "600" },
  downloadCertBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, borderWidth: 1, borderColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.lg, marginBottom: spacing.xxl },
  downloadCertText: { fontSize: fontSize.md, fontWeight: "600", color: colors.primary },

  // Social stats
  socialStats: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  socialStatsTitle: { fontSize: fontSize.lg, fontWeight: "700", color: colors.text, marginBottom: spacing.lg },
  statRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border + "80", gap: spacing.md },
  statRowIcon: { width: 36, height: 36, borderRadius: borderRadius.sm, justifyContent: "center", alignItems: "center" },
  statRowLabel: { flex: 1, fontSize: fontSize.md, color: colors.text },
  statRowValue: { fontSize: fontSize.lg, fontWeight: "800" },
});
