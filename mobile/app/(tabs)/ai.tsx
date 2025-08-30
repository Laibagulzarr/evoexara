import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Easing,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";

/* ================= THEME ================= */
const c = {
  bg: "#0A0A0F",
  ring: "#12121A",
  text: "#EFEAFF",
  sub: "#A99BFF",
  neon: "#A855F7",
  neonDeep: "#7C3AED",
  cyan: "#22D3EE",
  border: "rgba(168,85,247,0.28)",
  chipBg: "rgba(168,85,247,0.12)",
  chipBgActive: "rgba(168,85,247,0.22)",
};

/* ================= SMALL BLOCKS ================= */
function GlowText({
  children,
  size = 18,
  weight = "700",
  center,
  color = c.text,
  glow = c.neon,
}: {
  children: React.ReactNode;
  size?: number;
  weight?: "400" | "500" | "600" | "700" | "800";
  center?: boolean;
  color?: string;
  glow?: string;
}) {
  return (
    <Text
      style={{
        color,
        fontSize: size,
        fontWeight: weight,
        textAlign: center ? "center" : "left",
        textShadowColor: glow,
        textShadowRadius: 10,
        textShadowOffset: { width: 0, height: 0 },
      }}
    >
      {children}
    </Text>
  );
}

function NeonDivider() {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 1500, useNativeDriver: false }),
        Animated.timing(a, { toValue: 0, duration: 1500, useNativeDriver: false }),
      ])
    ).start();
  }, [a]);
  const width = a.interpolate({ inputRange: [0, 1], outputRange: ["18%", "58%"] });
  return (
    <View style={{ alignItems: "center", marginTop: 8 }}>
      <Animated.View
        style={{
          width: width as unknown as number,
          height: 2,
          backgroundColor: c.neon,
          shadowColor: c.neon,
          shadowOpacity: 0.9,
          shadowRadius: 8,
          borderRadius: 2,
        }}
      />
    </View>
  );
}

/* ================= RADIAL WHEEL =================
   Reusable wheel that places circular buttons around a ring.
   Supports single-select or multi-select (friends).
==================================================*/
type WheelItem = { id: string; label: string; emoji?: string };

function RadialWheel({
  title,
  hint,
  items,
  multi = false,
  initialSelected = [],
  onConfirm,
}: {
  title: string;
  hint?: string;
  items: WheelItem[];
  multi?: boolean;
  initialSelected?: string[];
  onConfirm: (selectedIds: string[]) => void;
}) {
  const { width } = useWindowDimensions();
  const size = Math.min(width - 32, 360); // outer diameter
  const center = size / 2;
  const innerPad = 18;
  const radius = (size - innerPad) / 2 - 24; // where buttons sit

  const [selected, setSelected] = useState<string[]>(initialSelected);

  // pulsing center
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);
  const centerScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });

  // where each button sits
  const positions = useMemo(() => {
    const N = items.length;
    return items.map((it, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / N; // start top, clockwise
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return { it, x, y };
    });
  }, [items, center, radius]);

  const toggle = (id: string) => {
    if (multi) {
      setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    } else {
      setSelected([id]);
    }
  };

  return (
    <View style={{ alignItems: "center" }}>
      <GlowText size={20} center>
        {title}
      </GlowText>
      {!!hint && <Text style={{ color: c.sub, textAlign: "center", marginTop: 6 }}>{hint}</Text>}
      <NeonDivider />

      <View
        style={[
          styles.wheel,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: c.ring,
            borderWidth: 1,
            borderColor: c.neon,
            shadowColor: c.neonDeep,
            shadowOpacity: 0.35,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 0 },
            marginTop: 16,
          },
        ]}
      >
        {/* decorative inner ring */}
        <View
          style={{
            position: "absolute",
            left: innerPad,
            top: innerPad,
            right: innerPad,
            bottom: innerPad,
            borderRadius: (size - 2 * innerPad) / 2,
            borderWidth: 1,
            borderColor: c.border,
          }}
        />

        {/* center capsule */}
        <Animated.View
          style={{
            position: "absolute",
            left: center - 70,
            top: center - 70,
            width: 140,
            height: 140,
            borderRadius: 70,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(168,85,247,0.08)",
            borderWidth: 1,
            borderColor: c.neon,
            transform: [{ scale: centerScale }],
            shadowColor: c.neon,
            shadowOpacity: 0.9,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 0 },
            paddingHorizontal: 8,
          }}
        >
          <GlowText size={18} center glow={c.neonDeep}>
            {title}
          </GlowText>
          {!!hint && (
            <Text style={{ color: c.sub, fontSize: 12, textAlign: "center", marginTop: 6 }}>
              {multi ? "Select multiple" : hint}
            </Text>
          )}
          {/* confirm button */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onConfirm(selected)}
            style={[
              styles.primaryBtn,
              { marginTop: 10, opacity: selected.length ? 1 : 0.4 },
            ]}
            disabled={!selected.length}
          >
            <Text style={{ color: "#0B0010", fontWeight: "700" }}>
              {multi ? "Confirm" : "Next"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* buttons around circle */}
        {positions.map(({ it, x, y }, idx) => {
          const S = 64;
          const anim = useRef(new Animated.Value(0)).current;
          const onIn = () =>
            Animated.timing(anim, { toValue: 1, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
          const onOut = () =>
            Animated.timing(anim, { toValue: 0, duration: 120, easing: Easing.in(Easing.quad), useNativeDriver: true }).start();
          const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });

          const active = selected.includes(it.id);

          return (
            <Animated.View
              key={it.id}
              style={{
                position: "absolute",
                left: x - S / 2,
                top: y - S / 2,
                width: S,
                height: S,
                transform: [{ scale }],
              }}
            >
              <Pressable
                onPress={() => toggle(it.id)}
                onPressIn={onIn}
                onPressOut={onOut}
                style={({ pressed }) => [
                  styles.slotBtn,
                  {
                    borderColor: active ? c.cyan : c.neon,
                    backgroundColor: pressed || active ? c.chipBgActive : c.chipBg,
                  },
                ]}
              >
                {!!it.emoji && <Text style={{ fontSize: 26 }}>{it.emoji}</Text>}
                {!it.emoji && (
                  <GlowText size={14} center>
                    {it.label}
                  </GlowText>
                )}
              </Pressable>
              <Text style={{ color: active ? c.cyan : c.sub, fontSize: 11, textAlign: "center", marginTop: 6 }}>
                {it.label}
              </Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

/* ================= FLOW (STATE MACHINE) ================= */
type Step = "category" | "friends" | "budget" | "results";

const CATEGORY_ITEMS: WheelItem[] = [
  { id: "food", label: "Food", emoji: "🍔" },
  { id: "adventure", label: "Adventure", emoji: "🧭" },
  { id: "chill", label: "Chill", emoji: "🧋" },
  { id: "study", label: "Study", emoji: "📚" },
];

const FRIENDS: WheelItem[] = [
  { id: "none", label: "None", emoji: "✖️" },
  { id: "ali", label: "Ali", emoji: "🧑‍🦱" },
  { id: "sara", label: "Sara", emoji: "👩‍🦰" },
  { id: "omar", label: "Omar", emoji: "🧔" },
  { id: "noor", label: "Noor", emoji: "👩‍🦱" },
  { id: "zayn", label: "Zayn", emoji: "🧑‍💼" },
  { id: "huda", label: "Huda", emoji: "👩‍🎓" },
  { id: "yara", label: "Yara", emoji: "👩‍💻" },
];

const BUDGET: WheelItem[] = [
  { id: "$", label: "Budget", emoji: "💵" },
  { id: "$$", label: "Mid", emoji: "💳" },
  { id: "$$$", label: "Premium", emoji: "💎" },
  { id: "free", label: "Free", emoji: "🆓" },
];

export default function EvoPlanner() {
  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState<string | null>(null);
  const [friends, setFriends] = useState<string[]>([]);
  const [budget, setBudget] = useState<string | null>(null);

  const nextFromCategory = (ids: string[]) => {
    setCategory(ids[0] ?? null);
    setStep("friends");
  };

  const nextFromFriends = (ids: string[]) => {
    // If "None" picked, ignore other selections and use empty list
    const chosen = ids.includes("none") ? [] : ids.filter((x) => x !== "none");
    setFriends(chosen);
    setStep("budget");
  };

  const nextFromBudget = (ids: string[]) => {
    setBudget(ids[0] ?? null);
    setStep("results");
  };

  const reset = () => {
    setStep("category");
    setCategory(null);
    setFriends([]);
    setBudget(null);
  };

  // mock recommendation engine
  const results = useMemo(() => {
    if (!category || !budget) return [];
    const friendCount = friends.length;
    const seed = `${category}-${budget}-${friendCount}`;
    // pretend we pick based on category/budget
    const pool: Record<string, string[]> = {
      food: ["Neon Burger Bar", "Purple Sushi Lab", "Midnight Shawarma", "Glow Noodles"],
      adventure: ["VR Arena", "Desert Dune Buggies", "Climb+Wall", "Laser Tag Dome"],
      chill: ["Retro Arcade Lounge", "Seaside Walkway", "Board Game Café", "Night Market"],
      study: ["Quiet Library Pods", "Focus Café", "Study Hub 24/7", "Rooftop Reading"],
    };
    const priceTag: Record<string, string> = { "$": "$", "$$": "$$", "$$$": "$$$", free: "FREE" };
    const picks = pool[category].map((name, i) => ({
      id: `${seed}-${i}`,
      name,
      price: priceTag[budget!],
      vibe:
        category === "food"
          ? ["Burgers", "Sushi", "Arab", "Asian"][i % 4]
          : category === "adventure"
          ? ["VR", "Outdoor", "Climb", "Laser"][i % 4]
          : category === "chill"
          ? ["Arcade", "Walk", "Games", "Market"][i % 4]
          : ["Pods", "Café", "Hub", "Rooftop"][i % 4],
    }));
    return picks.slice(0, 6);
  }, [category, budget, friends.length]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar barStyle="light-content" />
      <View style={{ paddingTop: 8 }}>
        <GlowText size={20} center>Evo • Planner</GlowText>
        <NeonDivider />
        <Text style={{ color: c.sub, textAlign: "center", marginTop: 8 }}>
          {step === "category" && "Choose a vibe to plan"}
          {step === "friends" && "Select friends (or None). Confirm in the center."}
          {step === "budget" && "Pick a budget tier"}
          {step === "results" && "Here are places based on your picks"}
        </Text>
      </View>

      <View style={{ flex: 1, justifyContent: "center" }}>
        {step === "category" && (
          <RadialWheel
            title="Plan"
            hint="Food • Adventure • Chill • Study"
            items={CATEGORY_ITEMS}
            onConfirm={nextFromCategory}
          />
        )}

        {step === "friends" && (
          <RadialWheel
            title="Friends"
            hint="Select who’s coming"
            items={FRIENDS}
            multi
            onConfirm={nextFromFriends}
          />
        )}

        {step === "budget" && (
          <RadialWheel
            title="Budget"
            hint="Pick a price range"
            items={BUDGET}
            onConfirm={nextFromBudget}
          />
        )}

        {step === "results" && (
          <ResultsPanel
            category={category!}
            friends={friends}
            budget={budget!}
            data={results}
            onBackBudget={() => setStep("budget")}
            onReset={reset}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

/* ================ RESULTS LIST ================ */
function ResultsPanel({
  category,
  friends,
  budget,
  data,
  onBackBudget,
  onReset,
}: {
  category: string;
  friends: string[];
  budget: string;
  data: { id: string; name: string; price: string; vibe: string }[];
  onBackBudget: () => void;
  onReset: () => void;
}) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
        <Badge label={`Vibe: ${cap(category)}`} />
        <Badge label={`Budget: ${budget.toUpperCase()}`} />
        <Badge label={`Friends: ${friends.length || "None"}`} />
      </View>

      <ScrollView
        style={{ marginTop: 14 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {data.map((row) => (
          <View key={row.id} style={styles.card}>
            <GlowText size={16}>{row.name}</GlowText>
            <Text style={{ color: c.sub, marginTop: 4 }}>
              {row.vibe} • {row.price}
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <SmallBtn label="Map" />
              <SmallBtn label="Share" />
              <SmallBtn label="Save" />
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 12 }}>
        <TouchableOpacity onPress={onBackBudget} activeOpacity={0.9} style={styles.secondaryBtn}>
          <Text style={{ color: c.text }}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onReset} activeOpacity={0.9} style={styles.primaryBtn}>
          <Text style={{ color: "#0B0010", fontWeight: "700" }}>Start Over</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View
      style={{
        backgroundColor: c.chipBg,
        borderColor: c.neon,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
      }}
    >
      <Text style={{ color: c.text, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function SmallBtn({ label }: { label: string }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{
        backgroundColor: c.chipBg,
        borderColor: c.neon,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
      }}
    >
      <Text style={{ color: c.text, fontSize: 12 }}>{label}</Text>
    </TouchableOpacity>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  wheel: {
    alignItems: "center",
    justifyContent: "center",
  },
  slotBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: c.neon,
    shadowOpacity: 0.9,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  primaryBtn: {
    alignSelf: "center",
    backgroundColor: c.neon,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: c.neon,
    shadowOpacity: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  secondaryBtn: {
    alignSelf: "center",
    backgroundColor: c.chipBg,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.neon,
  },
  card: {
    backgroundColor: c.ring,
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: c.neonDeep,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
});
