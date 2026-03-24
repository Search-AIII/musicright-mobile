import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../lib/auth-context";
import { colors, spacing, borderRadius, fontSize } from "../../lib/theme";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      Alert.alert("Sign In Failed", error.message);
    } else {
      router.replace("/(tabs)/home");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.jpg")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Welcome Text */}
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to manage your music rights</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotButton}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Sign In Button */}
        <TouchableOpacity onPress={handleSignIn} disabled={loading} activeOpacity={0.8}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.signInButton}
          >
            <Text style={styles.signInButtonText}>
              {loading ? "Signing in..." : "Sign In"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Sign In */}
        <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
          <Ionicons name="logo-google" size={20} color={colors.text} />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, justifyContent: "center", paddingHorizontal: spacing.xxl, paddingVertical: spacing.xxxxl },
  logoContainer: { alignItems: "center", marginBottom: spacing.xxxl },
  logo: { width: 80, height: 80, borderRadius: borderRadius.xl },
  title: { fontSize: fontSize.hero, fontWeight: "800", color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontSize: fontSize.lg, color: colors.textSecondary, marginBottom: spacing.xxxl },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    height: 56,
  },
  inputIcon: { marginRight: spacing.md },
  input: { flex: 1, color: colors.text, fontSize: fontSize.md },
  eyeIcon: { padding: spacing.sm },
  forgotButton: { alignSelf: "flex-end", marginBottom: spacing.xxl },
  forgotText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: "600" },
  signInButton: {
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  signInButtonText: { color: colors.textInverse, fontSize: fontSize.lg, fontWeight: "700" },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: spacing.xxl },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, marginHorizontal: spacing.lg, fontSize: fontSize.sm },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  googleButtonText: { color: colors.text, fontSize: fontSize.md, fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: spacing.xxl },
  footerText: { color: colors.textSecondary, fontSize: fontSize.md },
  footerLink: { color: colors.primary, fontSize: fontSize.md, fontWeight: "700" },
});
