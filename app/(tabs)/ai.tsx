import { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  chatCompletion, getApiKey, saveApiKey, deleteApiKey,
  getSelectedModel, saveSelectedModel,
  MODELS, AIModel, ChatMessage, Provider,
} from "../../lib/openrouter";
import { colors, spacing, borderRadius, fontSize } from "../../lib/theme";

// ─── Quick-prompt chips ───────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: "How do I collect royalties?",        icon: "cash" },
  { label: "File a DMCA takedown on TikTok",     icon: "warning" },
  { label: "Register with ASCAP vs BMI",         icon: "radio" },
  { label: "What is an ISRC code?",              icon: "barcode" },
  { label: "How does The MLC work?",             icon: "disc" },
  { label: "Collect royalties internationally",  icon: "globe" },
  { label: "Sync license vs master rights",      icon: "film" },
  { label: "How much does copyright cost?",      icon: "card" },
];

export default function AIAdvisor() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);

  // API key state
  const [orKey, setOrKey]   = useState("");   // OpenRouter
  const [sfKey, setSfKey]   = useState("");   // SiliconFlow
  const [savedOrKey, setSavedOrKey] = useState<string | null>(null);
  const [savedSfKey, setSavedSfKey] = useState<string | null>(null);

  // Model state
  const [selectedModel, setSelectedModel] = useState<AIModel>(MODELS[0]);
  const [activeProvider, setActiveProvider] = useState<Provider>("openrouter");

  const scrollRef = useRef<ScrollView>(null);

  // Load saved settings on mount
  useEffect(() => {
    (async () => {
      const [or, sf, saved] = await Promise.all([
        getApiKey("openrouter"),
        getApiKey("siliconflow"),
        getSelectedModel(),
      ]);
      setSavedOrKey(or);
      setSavedSfKey(sf);
      if (saved) {
        const model = MODELS.find((m) => m.id === saved.modelId);
        if (model) { setSelectedModel(model); setActiveProvider(saved.provider); }
      }
    })();
  }, []);

  const handleSaveKeys = async () => {
    if (orKey.trim()) {
      await saveApiKey("openrouter", orKey.trim());
      setSavedOrKey(orKey.trim());
    }
    if (sfKey.trim()) {
      await saveApiKey("siliconflow", sfKey.trim());
      setSavedSfKey(sfKey.trim());
    }
    setOrKey("");
    setSfKey("");
    setShowSettings(false);
    Alert.alert("Saved", "API keys stored securely on device.");
  };

  const handleDeleteKey = async (provider: Provider) => {
    Alert.alert("Remove Key", `Remove ${provider === "openrouter" ? "OpenRouter" : "SiliconFlow"} key?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive",
        onPress: async () => {
          await deleteApiKey(provider);
          if (provider === "openrouter") setSavedOrKey(null);
          else setSavedSfKey(null);
        },
      },
    ]);
  };

  const selectModel = async (model: AIModel) => {
    setSelectedModel(model);
    setActiveProvider(model.provider);
    await saveSelectedModel(model.id, model.provider);
    setShowModelPicker(false);
  };

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;

    const apiKey = activeProvider === "openrouter" ? savedOrKey : savedSfKey;
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    const userMsg: ChatMessage = { role: "user", content };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    scrollRef.current?.scrollToEnd({ animated: true });

    try {
      const reply = await chatCompletion(updated, selectedModel.id, activeProvider, apiKey);
      setMessages([...updated, { role: "assistant", content: reply }]);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to get response. Check your API key.");
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const clearChat = () => {
    Alert.alert("Clear Chat", "Start a new conversation?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => setMessages([]) },
    ]);
  };

  const hasKey = activeProvider === "openrouter" ? !!savedOrKey : !!savedSfKey;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.aiDot} />
            <View>
              <Text style={styles.heading}>MusicRight AI</Text>
              <Text style={styles.subheading}>Music rights advisor</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            {messages.length > 0 && (
              <TouchableOpacity onPress={clearChat} style={styles.iconBtn}>
                <Ionicons name="refresh" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.iconBtn}>
              <Ionicons name="key" size={20} color={hasKey ? colors.primary : colors.warning} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Model selector pill ── */}
        <TouchableOpacity style={styles.modelPill} onPress={() => setShowModelPicker(true)} activeOpacity={0.8}>
          <View style={[styles.providerDot, { backgroundColor: activeProvider === "openrouter" ? colors.primary : "#FF6B35" }]} />
          <Text style={styles.modelPillName}>{selectedModel.name}</Text>
          <Text style={styles.modelPillPrice}>{selectedModel.pricePerMToken}/1M</Text>
          <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
        </TouchableOpacity>

        {/* ── Messages ── */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <>
              {/* Welcome card */}
              <LinearGradient
                colors={["#1A1A2E", "#16213E"]}
                style={styles.welcomeCard}
              >
                <View style={styles.welcomeIcon}>
                  <Ionicons name="sparkles" size={32} color={colors.primary} />
                </View>
                <Text style={styles.welcomeTitle}>Your Music Rights Advisor</Text>
                <Text style={styles.welcomeDesc}>
                  Ask me anything about royalties, copyright registration, DMCA, licensing, and collecting money from your music worldwide.
                </Text>
                {!hasKey && (
                  <TouchableOpacity style={styles.setupKeyBtn} onPress={() => setShowSettings(true)}>
                    <Ionicons name="key-outline" size={16} color={colors.warning} />
                    <Text style={styles.setupKeyText}>Set up API key to start</Text>
                  </TouchableOpacity>
                )}
              </LinearGradient>

              {/* Quick prompts */}
              <Text style={styles.quickTitle}>Quick Questions</Text>
              <View style={styles.quickGrid}>
                {QUICK_PROMPTS.map((p, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.quickChip}
                    onPress={() => sendMessage(p.label)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={p.icon as any} size={16} color={colors.primary} />
                    <Text style={styles.quickChipText}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            messages.map((msg, i) => (
              <View key={i} style={[styles.bubble, msg.role === "user" ? styles.userBubble : styles.aiBubble]}>
                {msg.role === "assistant" && (
                  <View style={styles.aiAvatar}>
                    <Ionicons name="sparkles" size={14} color={colors.primary} />
                  </View>
                )}
                <View style={[styles.bubbleContent, msg.role === "user" ? styles.userContent : styles.aiContent]}>
                  <Text style={[styles.bubbleText, msg.role === "user" ? styles.userText : styles.aiText]}>
                    {msg.content}
                  </Text>
                </View>
              </View>
            ))
          )}

          {loading && (
            <View style={styles.loadingRow}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={14} color={colors.primary} />
              </View>
              <View style={styles.loadingBubble}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* ── Input bar ── */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder={hasKey ? "Ask about royalties, DMCA, licensing..." : "Add API key to start chatting"}
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading || !hasKey) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading || !hasKey}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={(!input.trim() || loading || !hasKey) ? [colors.border, colors.border] : [colors.primary, colors.accent]}
              style={styles.sendGradient}
            >
              <Ionicons name="send" size={18} color={(!input.trim() || !hasKey) ? colors.textMuted : colors.textInverse} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      {/* ══ Settings Modal ══ */}
      <Modal visible={showSettings} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>API Keys</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.securityNote}>
              <Ionicons name="lock-closed" size={14} color={colors.success} />
              <Text style={styles.securityText}>Keys stored in device SecureStore — never sent to our servers</Text>
            </View>

            {/* OpenRouter */}
            <Text style={styles.keyLabel}>OpenRouter API Key</Text>
            {savedOrKey ? (
              <View style={styles.savedKeyRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.savedKeyText}>••••••••{savedOrKey.slice(-8)}</Text>
                <TouchableOpacity onPress={() => handleDeleteKey("openrouter")}>
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TextInput
                style={styles.keyInput}
                placeholder="sk-or-v1-..."
                placeholderTextColor={colors.textMuted}
                value={orKey}
                onChangeText={setOrKey}
                autoCapitalize="none"
                secureTextEntry
              />
            )}

            {/* SiliconFlow (Xiaomi) */}
            <Text style={styles.keyLabel}>SiliconFlow Key (Xiaomi)</Text>
            {savedSfKey ? (
              <View style={styles.savedKeyRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.savedKeyText}>••••••••{savedSfKey.slice(-8)}</Text>
                <TouchableOpacity onPress={() => handleDeleteKey("siliconflow")}>
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TextInput
                style={styles.keyInput}
                placeholder="sk-..."
                placeholderTextColor={colors.textMuted}
                value={sfKey}
                onChangeText={setSfKey}
                autoCapitalize="none"
                secureTextEntry
              />
            )}

            {(orKey.trim() || sfKey.trim()) && (
              <TouchableOpacity onPress={handleSaveKeys} activeOpacity={0.8}>
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveBtn}
                >
                  <Ionicons name="save" size={18} color={colors.textInverse} />
                  <Text style={styles.saveBtnText}>Save Keys Securely</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <Text style={styles.keyHint}>
              Get OpenRouter key → openrouter.ai/keys{"\n"}
              Get SiliconFlow key → siliconflow.cn/account/ak
            </Text>
          </View>
        </View>
      </Modal>

      {/* ══ Model Picker Modal ══ */}
      <Modal visible={showModelPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: "80%" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose AI Model</Text>
              <TouchableOpacity onPress={() => setShowModelPicker(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* OpenRouter section */}
              <Text style={styles.providerSection}>OpenRouter</Text>
              {MODELS.filter((m) => m.provider === "openrouter").map((model) => (
                <TouchableOpacity
                  key={model.id}
                  style={[styles.modelCard, selectedModel.id === model.id && styles.modelCardActive]}
                  onPress={() => selectModel(model)}
                  activeOpacity={0.7}
                >
                  <View style={styles.modelLeft}>
                    <View style={styles.modelTop}>
                      <Text style={styles.modelName}>{model.name}</Text>
                      <View style={[styles.modelBadge, { backgroundColor: colors.primary + "20" }]}>
                        <Text style={styles.modelBadgeText}>{model.badge}</Text>
                      </View>
                    </View>
                    <Text style={styles.modelDesc}>{model.description}</Text>
                    <Text style={styles.modelPrice}>{model.pricePerMToken} / 1M tokens</Text>
                  </View>
                  {selectedModel.id === model.id && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}

              {/* SiliconFlow section */}
              <Text style={[styles.providerSection, { marginTop: spacing.xl }]}>SiliconFlow (Xiaomi)</Text>
              {MODELS.filter((m) => m.provider === "siliconflow").map((model) => (
                <TouchableOpacity
                  key={model.id}
                  style={[styles.modelCard, selectedModel.id === model.id && styles.modelCardActive]}
                  onPress={() => selectModel(model)}
                  activeOpacity={0.7}
                >
                  <View style={styles.modelLeft}>
                    <View style={styles.modelTop}>
                      <Text style={styles.modelName}>{model.name}</Text>
                      <View style={[styles.modelBadge, { backgroundColor: "#FF6B3520" }]}>
                        <Text style={[styles.modelBadgeText, { color: "#FF6B35" }]}>{model.badge}</Text>
                      </View>
                    </View>
                    <Text style={styles.modelDesc}>{model.description}</Text>
                    <Text style={styles.modelPrice}>{model.pricePerMToken} / 1M tokens</Text>
                  </View>
                  {selectedModel.id === model.id && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.xxl, paddingTop: spacing.lg, paddingBottom: spacing.md },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  aiDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  heading: { fontSize: fontSize.xl, fontWeight: "800", color: colors.text },
  subheading: { fontSize: fontSize.xs, color: colors.textSecondary },
  headerActions: { flexDirection: "row", gap: spacing.sm },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.border },

  // Model pill
  modelPill: { flexDirection: "row", alignItems: "center", gap: spacing.sm, alignSelf: "flex-start", marginHorizontal: spacing.xxl, marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
  providerDot: { width: 8, height: 8, borderRadius: 4 },
  modelPillName: { fontSize: fontSize.sm, fontWeight: "600", color: colors.text },
  modelPillPrice: { fontSize: fontSize.xs, color: colors.textMuted },

  // Messages
  messages: { flex: 1 },
  messagesContent: { padding: spacing.xxl, paddingBottom: spacing.xl },

  // Welcome
  welcomeCard: { borderRadius: borderRadius.xl, padding: spacing.xxl, alignItems: "center", marginBottom: spacing.xxl, borderWidth: 1, borderColor: colors.border },
  welcomeIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary + "15", justifyContent: "center", alignItems: "center", marginBottom: spacing.lg },
  welcomeTitle: { fontSize: fontSize.xl, fontWeight: "700", color: colors.text, marginBottom: spacing.sm },
  welcomeDesc: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", lineHeight: 22 },
  setupKeyBtn: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xl, backgroundColor: colors.warning + "15", borderRadius: borderRadius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.warning + "30" },
  setupKeyText: { fontSize: fontSize.sm, fontWeight: "600", color: colors.warning },

  // Quick prompts
  quickTitle: { fontSize: fontSize.lg, fontWeight: "700", color: colors.text, marginBottom: spacing.md },
  quickGrid: { gap: spacing.sm },
  quickChip: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  quickChipText: { fontSize: fontSize.sm, color: colors.text, fontWeight: "500", flex: 1 },

  // Chat bubbles
  bubble: { flexDirection: "row", marginBottom: spacing.lg, alignItems: "flex-end" },
  userBubble: { justifyContent: "flex-end" },
  aiBubble: { justifyContent: "flex-start", gap: spacing.sm },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary + "20", justifyContent: "center", alignItems: "center", marginBottom: 2 },
  bubbleContent: { maxWidth: "78%", borderRadius: borderRadius.lg, padding: spacing.lg },
  userContent: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  aiContent: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: fontSize.md, lineHeight: 22 },
  userText: { color: colors.textInverse },
  aiText: { color: colors.text },
  loadingRow: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm, marginBottom: spacing.lg },
  loadingBubble: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  loadingText: { fontSize: fontSize.sm, color: colors.textSecondary },

  // Input
  inputBar: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: spacing.xxl, paddingVertical: spacing.md, gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  input: { flex: 1, backgroundColor: colors.background, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, color: colors.text, fontSize: fontSize.md, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, overflow: "hidden" },
  sendBtnDisabled: { opacity: 0.5 },
  sendGradient: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.xxl },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xl },
  modalTitle: { fontSize: fontSize.xl, fontWeight: "700", color: colors.text },

  // Settings
  securityNote: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.success + "15", borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.xl },
  securityText: { flex: 1, fontSize: fontSize.xs, color: colors.success, fontWeight: "500" },
  keyLabel: { fontSize: fontSize.xs, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.sm, marginTop: spacing.lg },
  keyInput: { backgroundColor: colors.background, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, height: 52, color: colors.text, fontSize: fontSize.md },
  savedKeyRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.success + "10", borderRadius: borderRadius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.success + "30" },
  savedKeyText: { flex: 1, fontSize: fontSize.md, color: colors.text, fontFamily: "monospace" },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 52, borderRadius: borderRadius.md, gap: spacing.sm, marginTop: spacing.xl },
  saveBtnText: { fontSize: fontSize.lg, fontWeight: "700", color: colors.textInverse },
  keyHint: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: "center", marginTop: spacing.lg, lineHeight: 20 },

  // Model picker
  providerSection: { fontSize: fontSize.xs, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.md },
  modelCard: { backgroundColor: colors.background, borderRadius: borderRadius.md, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center" },
  modelCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + "08" },
  modelLeft: { flex: 1 },
  modelTop: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs },
  modelName: { fontSize: fontSize.md, fontWeight: "600", color: colors.text },
  modelBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
  modelBadgeText: { fontSize: 10, fontWeight: "700", color: colors.primary },
  modelDesc: { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.xs },
  modelPrice: { fontSize: fontSize.xs, fontWeight: "600", color: colors.primary },
});
