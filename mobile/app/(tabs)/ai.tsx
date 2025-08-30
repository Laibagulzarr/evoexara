import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Easing,
  StatusBar,
  ScrollView,
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

/* ================ SHARED UI ================ */
function Glow({
  children,
  size = 18,
  center = true,
}: {
  children: React.ReactNode;
  size?: number;
  center?: boolean;
}) {
  return (
    <Text
      style={{
        color: c.text,
        fontSize: size,
        fontWeight: "700",
        textAlign: center ? "center" : "left",
        textShadowColor: c.neon,
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
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 1500, useNativeDriver: false }),
        Animated.timing(a, { toValue: 0, duration: 1500, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [a]);
  const width = a.interpolate({ inputRange: [0, 1], outputRange: ["18%", "58%"] });
  return (
    <View style={{ alignItems: "center", marginTop: 8 }}>
      <Animated.View
        style={{
          width: width as unknown as number,
          height: 3,
          backgroundColor: c.neon,
          shadowColor: c.neon,
          shadowOpacity: 0.95,
          shadowRadius: 10,
          borderRadius: 2,
        }}
      />
    </View>
  );
}

/* ================ RADIAL WHEEL ================ */
type WheelItem = { id: string; label: string; emoji?: string };

function Wheel({
  title,
  items,
  multi = false,
  initial = [],
  onPick,
  keySeed, // change to remount/re-animate
}: {
  title: string;
  items: WheelItem[];
  multi?: boolean;
  initial?: string[];
  onPick: (ids: string[]) => void;
  keySeed: string;
}) {
  const { width } = useWindowDimensions();
  const size = Math.min(width - 32, 360);
  const center = size / 2;
  const pad = 18;
  const radius = (size - pad) / 2 - 24;

  const [selected, setSelected] = useState<string[]>(initial);

  // appear/disappear
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [keySeed]);

  const appear = {
    transform: [
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1],
        }),
      },
    ],
    opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
  };

  const animateOutThen = (cb: () => void) => {
    Animated.timing(progress, {
      toValue: 0,
      duration: 260,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => finished && cb());
  };

  // center pulse
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const centerScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });

  const positions = useMemo(() => {
    const N = items.length;
    return items.map((it, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / N;
      return {
        it,
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
        i,
      };
    });
  }, [items, center, radius]);

  const handleTap = (id: string) => {
    if (!multi) {
      animateOutThen(() => onPick([id]));
      return;
    }
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  return (
    <View
      style={{
        alignSelf: "center",
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
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* inner ring */}
      <View
        style={{
          position: "absolute",
          left: pad,
          top: pad,
          right: pad,
          bottom: pad,
          borderRadius: (size - 2 * pad) / 2,
          borderWidth: 1,
          borderColor: c.border,
        }}
      />

      {/* center title (and confirm for multi) */}
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
        <Glow size={18}>{title}</Glow>
        {multi && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              animateOutThen(() => onPick(selected.includes("none") ? [] : selected.filter((x) => x !== "none")))
            }
            style={[styles.primaryBtn, { marginTop: 10, opacity: selected.length ? 1 : 0.4 }]}
            disabled={!selected.length}
          >
            <Text style={{ color: "#0B0010", fontWeight: "700" }}>Confirm</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* option buttons */}
      {positions.map(({ it, x, y, i }) => {
        const S = 64;
        const hover = useRef(new Animated.Value(0)).current;
        const onIn = () =>
          Animated.timing(hover, { toValue: 1, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
        const onOut = () =>
          Animated.timing(hover, { toValue: 0, duration: 120, easing: Easing.in(Easing.quad), useNativeDriver: true }).start();
        const scale = hover.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });

        const active = multi ? selected.includes(it.id) : false;

        return (
          <Animated.View
            key={it.id}
            style={[
              {
                position: "absolute",
                left: x - S / 2,
                top: y - S / 2,
                width: S,
                height: S,
                transform: [{ scale }],
              },
              appear,
            ]}
          >
            <Pressable
              onPress={() => handleTap(it.id)}
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
              {it.emoji ? (
                <Text style={{ fontSize: 26 }}>{it.emoji}</Text>
              ) : (
                <Text style={{ color: c.text, fontWeight: "700", fontSize: 13 }}>{it.label}</Text>
              )}
            </Pressable>
            <Text style={{ color: active ? c.cyan : c.text, fontSize: 11, textAlign: "center", marginTop: 6 }}>
              {it.label}
            </Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

/* ================ FLOW DATA ================ */
type Step = "category" | "setup" | "friends" | "budget" | "results";

const CATEGORY: WheelItem[] = [
  { id: "food", label: "Food", emoji: "🍔" },
  { id: "adventure", label: "Adventure", emoji: "🧭" },
  { id: "chill", label: "Chill", emoji: "🧋" },
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
  { id: "$", label: "$", emoji: "💵" },
  { id: "$$", label: "$$", emoji: "💳" },
  { id: "$$$", label: "$$$", emoji: "💎" },
  { id: "free", label: "Free", emoji: "🆓" },
];

/* ================ SETUP SCREEN (two circles) ================ */
function SetupCircles({
  friendsSet,
  budgetSet,
  onOpenFriends,
  onOpenBudget,
  onShowResults,
}: {
  friendsSet: boolean;
  budgetSet: boolean;
  onOpenFriends: () => void;
  onOpenBudget: () => void;
  onShowResults: () => void;
}) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    a.setValue(0);
    Animated.timing(a, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);
  const appear = {
    transform: [
      { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
      { scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
    ],
    opacity: a,
  };

  const Circle = ({
    title,
    set,
    onPress,
    emoji,
  }: {
    title: string;
    set: boolean;
    onPress: () => void;
    emoji: string;
  }) => {
    const pulse = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }, [pulse]);
    const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, set ? 1 : 1.04] });

    return (
      <Animated.View style={[styles.setupCircleWrap, appear, { transform: [{ scale }] }]}>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            styles.setupCircle,
            {
              borderColor: set ? c.cyan : c.neon,
              backgroundColor: pressed ? c.chipBgActive : c.chipBg,
            },
          ]}
        >
          <Text style={{ fontSize: 26 }}>{emoji}</Text>
          <Glow size={16}>{title}</Glow>
          <Text style={{ color: set ? c.cyan : c.sub, marginTop: 4 }}>{set ? "Set ✓" : "Not set"}</Text>
        </Pressable>
      </Animated.View>
    );
  };

  const ready = friendsSet && budgetSet;

  return (
    <View style={{ paddingHorizontal: 24, alignItems: "center" }}>
      <Glow size={18}>Setup</Glow>
      <Text style={{ color: c.sub, marginTop: 6 }}>Choose who’s coming & your budget</Text>
      <NeonDivider />

      <View style={styles.setupRow}>
        <Circle title="Friends" set={friendsSet} onPress={onOpenFriends} emoji="👥" />
        <Circle title="Budget" set={budgetSet} onPress={onOpenBudget} emoji="💸" />
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onShowResults}
        style={[styles.primaryBtn, { marginTop: 18, opacity: ready ? 1 : 0.35 }]}
        disabled={!ready}
      >
        <Text style={{ color: "#0B0010", fontWeight: "700" }}>Show results</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ================ RESULTS ================ */
function Results({
  list,
  friendsCount,
  onBackToSetup,
  onResetAll,
}: {
  list: { id: string; name: string; price: string }[];
  friendsCount: number;
  onBackToSetup: () => void;
  onResetAll: () => void;
}) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <ScrollView
        style={{ marginTop: 8 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {list.map((row) => (
          <View key={row.id} style={styles.card}>
            <Glow size={16}>{row.name}</Glow>
            <Text style={{ color: c.text, opacity: 0.85, marginTop: 4 }}>
              {row.price} • {friendsCount ? `${friendsCount} friend(s)` : "Solo"}
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
        <TouchableOpacity onPress={onBackToSetup} activeOpacity={0.9} style={styles.secondaryBtn}>
          <Text style={{ color: c.text }}>Back to setup</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onResetAll} activeOpacity={0.9} style={styles.primaryBtn}>
          <Text style={{ color: "#0B0010", fontWeight: "700" }}>Start over</Text>
        </TouchableOpacity>
      </View>
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

/* ================ MAIN ================ */
export default function EvoPlanner() {
  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState<string | null>(null);
  const [friends, setFriends] = useState<string[]>([]);
  const [budget, setBudget] = useState<string | null>(null);

  // explicit completion flags (so "Not set" is correct initially)
  const [friendsLocked, setFriendsLocked] = useState(false);
  const [budgetLocked, setBudgetLocked] = useState(false);

  const seed = (s: Step) => `wheel-${s}`;

  const pickCategory = (ids: string[]) => {
    setCategory(ids[0] ?? null);
    setStep("setup");
  };

  const pickFriends = (ids: string[]) => {
    setFriends(ids.includes("none") ? [] : ids.filter((x) => x !== "none"));
    setFriendsLocked(true);
    setStep("setup");
  };

  const pickBudget = (ids: string[]) => {
    setBudget(ids[0] ?? null);
    setBudgetLocked(true);
    setStep("setup");
  };

  const places = useMemo(() => {
    if (!category || !budget) return [];
    const pool: Record<string, string[]> = {
      food: ["Neon Burger Bar", "Purple Sushi Lab", "Midnight Shawarma", "Glow Noodles"],
      adventure: ["VR Arena", "Desert Dune Buggies", "Climb+Wall", "Laser Tag Dome"],
      chill: ["Retro Arcade Lounge", "Seaside Walkway", "Board Game Café", "Night Market"],
    };
    const price = budget === "free" ? "FREE" : budget;
    return pool[category].map((name, i) => ({ id: `${category}-${budget}-${i}`, name, price }));
  }, [category, budget]);

  const resetAll = () => {
    setStep("category");
    setCategory(null);
    setFriends([]);
    setBudget(null);
    setFriendsLocked(false);
    setBudgetLocked(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={{ paddingTop: 8 }}>
        <Glow size={20}>Evo • Planner</Glow>
        <NeonDivider />
      </View>

      <View style={{ flex: 1, justifyContent: "center" }}>
        {step === "category" && (
          <Wheel title="Ask AI" items={CATEGORY} onPick={pickCategory} keySeed={seed("category")} />
        )}

        {step === "setup" && (
          <SetupCircles
            friendsSet={friendsLocked}
            budgetSet={budgetLocked}
            onOpenFriends={() => setStep("friends")}
            onOpenBudget={() => setStep("budget")}
            onShowResults={() => setStep("results")}
          />
        )}

        {step === "friends" && (
          <Wheel title="Friends" items={FRIENDS} multi onPick={pickFriends} keySeed={seed("friends")} />
        )}

        {step === "budget" && (
          <Wheel title="Budget" items={BUDGET} onPick={pickBudget} keySeed={seed("budget")} />
        )}

        {step === "results" && (
          <Results
            list={places}
            friendsCount={friends.length}
            onBackToSetup={() => setStep("setup")}
            onResetAll={resetAll}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

/* ================ STYLES ================ */
const styles = StyleSheet.create({
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
  /* Setup screen circles */
  setupRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  setupCircleWrap: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  setupCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    backgroundColor: c.chipBg,
    shadowColor: c.neon,
    shadowOpacity: 0.9,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    gap: 6,
  },
});
