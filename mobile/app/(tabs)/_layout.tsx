import { Tabs } from "expo-router";
import { Text, View } from "react-native";

function EmojiIcon({ e, focused }: { e: string; focused: boolean }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Text
        style={{
          fontSize: 22,
          opacity: focused ? 1 : 0.35,    // dim when not focused
          transform: [{ scale: focused ? 1.15 : 1 }], // subtle pop on focus
        }}
      >
        {e}
      </Text>
      {/* little dot indicator under the emoji when focused */}
      {focused && (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            marginTop: 3,
            backgroundColor: "#00E5FF", // cyan accent for the active tab
          }}
        />
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="map"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { backgroundColor: "#111" }, // optional dark bar
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ focused }) => <EmojiIcon e="🗺️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ focused }) => <EmojiIcon e="📰" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "AI",
          tabBarIcon: ({ focused }) => <EmojiIcon e="🤖" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <EmojiIcon e="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
