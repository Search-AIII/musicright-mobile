import { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius, fontSize } from "../../lib/theme";

const GENRES = ["All", "Pop", "Hip-Hop", "R&B", "Electronic", "Rock", "Latin", "Country"];

const DEMO_SONGS = [
  { id: 1, title: "Midnight Drive", artist: "Luna Vox", genre: "Electronic", bpm: 128, price: 99, license: "Non-Exclusive" },
  { id: 2, title: "Golden Hour", artist: "The Sunsets", genre: "Pop", bpm: 110, price: 149, license: "Sync" },
  { id: 3, title: "Street Lights", artist: "Jay Urban", genre: "Hip-Hop", bpm: 92, price: 49, license: "Non-Exclusive" },
  { id: 4, title: "Ocean Breeze", artist: "Marina Blue", genre: "R&B", bpm: 85, price: 199, license: "Exclusive" },
  { id: 5, title: "Neon Dreams", artist: "Pixel Sound", genre: "Electronic", bpm: 140, price: 79, license: "Sync" },
  { id: 6, title: "Dusty Roads", artist: "Nashville Kin", genre: "Country", bpm: 105, price: 129, license: "Non-Exclusive" },
  { id: 7, title: "Fire & Rain", artist: "Los Hermanos", genre: "Latin", bpm: 98, price: 99, license: "Sync" },
  { id: 8, title: "Electric Soul", artist: "Groove Theory", genre: "R&B", bpm: 90, price: 249, license: "Exclusive" },
];

const GRADIENT_COLORS: [string, string][] = [
  ["#667eea", "#764ba2"],
  ["#f857a6", "#ff5858"],
  ["#4facfe", "#00f2fe"],
  ["#43e97b", "#38f9d7"],
  ["#fa709a", "#fee140"],
  ["#a18cd1", "#fbc2eb"],
  ["#fccb90", "#d57eeb"],
  ["#e0c3fc", "#8ec5fc"],
];

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const filteredSongs = DEMO_SONGS.filter((song) => {
    const matchesSearch = song.title.toLowerCase().includes(search.toLowerCase()) || song.artist.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = selectedGenre === "All" || song.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.heading}>Marketplace</Text>
          <Text style={styles.subheading}>Browse and license music for your projects</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs, artists..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Genre Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreRow} contentContainerStyle={{ paddingRight: spacing.xxl }}>
          {GENRES.map((genre) => (
            <TouchableOpacity
              key={genre}
              style={[styles.genreChip, selectedGenre === genre && styles.genreChipActive]}
              onPress={() => setSelectedGenre(genre)}
            >
              <Text style={[styles.genreText, selectedGenre === genre && styles.genreTextActive]}>{genre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Song Grid */}
        <View style={styles.grid}>
          {filteredSongs.map((song, i) => (
            <TouchableOpacity key={song.id} style={styles.songCard} activeOpacity={0.7}>
              <LinearGradient
                colors={GRADIENT_COLORS[i % GRADIENT_COLORS.length]}
                style={styles.songArt}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="musical-notes" size={28} color="rgba(255,255,255,0.6)" />
              </LinearGradient>
              <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
              <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
              <View style={styles.songMeta}>
                <Text style={styles.songGenre}>{song.genre}</Text>
                <Text style={styles.songBpm}>{song.bpm} BPM</Text>
              </View>
              <View style={styles.songFooter}>
                <Text style={styles.songPrice}>${song.price}</Text>
                <View style={styles.licenseBadge}>
                  <Text style={styles.licenseText}>{song.license}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* List Your Music CTA */}
        <TouchableOpacity activeOpacity={0.8} style={styles.listCta}>
          <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.listCtaGradient}>
            <Ionicons name="cloud-upload" size={24} color={colors.textInverse} />
            <View>
              <Text style={styles.listCtaTitle}>List Your Music</Text>
              <Text style={styles.listCtaDesc}>Earn from sync licensing</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.textInverse} />
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: spacing.xxxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl },
  heading: { fontSize: fontSize.xxl, fontWeight: "800", color: colors.text, marginBottom: spacing.xs },
  subheading: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.xl },
  searchContainer: { flexDirection: "row", alignItems: "center", marginHorizontal: spacing.xxl, backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, height: 48, gap: spacing.sm },
  searchInput: { flex: 1, color: colors.text, fontSize: fontSize.md },
  genreRow: { paddingLeft: spacing.xxl, marginVertical: spacing.lg },
  genreChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  genreChipActive: { backgroundColor: colors.primary + "20", borderColor: colors.primary },
  genreText: { fontSize: fontSize.sm, fontWeight: "600", color: colors.textMuted },
  genreTextActive: { color: colors.primary },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: spacing.xxl, gap: spacing.md },
  songCard: { width: "48%", backgroundColor: colors.surface, borderRadius: borderRadius.lg, overflow: "hidden", borderWidth: 1, borderColor: colors.border },
  songArt: { height: 120, justifyContent: "center", alignItems: "center" },
  songTitle: { fontSize: fontSize.md, fontWeight: "600", color: colors.text, paddingHorizontal: spacing.md, marginTop: spacing.md },
  songArtist: { fontSize: fontSize.sm, color: colors.textSecondary, paddingHorizontal: spacing.md, marginTop: 2 },
  songMeta: { flexDirection: "row", paddingHorizontal: spacing.md, marginTop: spacing.sm, gap: spacing.sm },
  songGenre: { fontSize: fontSize.xs, color: colors.textMuted },
  songBpm: { fontSize: fontSize.xs, color: colors.textMuted },
  songFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  songPrice: { fontSize: fontSize.lg, fontWeight: "800", color: colors.primary },
  licenseBadge: { backgroundColor: colors.primary + "15", paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  licenseText: { fontSize: 10, fontWeight: "600", color: colors.primary },
  listCta: { marginHorizontal: spacing.xxl, marginTop: spacing.xxl },
  listCtaGradient: { flexDirection: "row", alignItems: "center", padding: spacing.xl, borderRadius: borderRadius.lg, gap: spacing.md },
  listCtaTitle: { fontSize: fontSize.lg, fontWeight: "700", color: colors.textInverse, flex: 1 },
  listCtaDesc: { fontSize: fontSize.sm, color: "rgba(0,0,0,0.5)" },
});
