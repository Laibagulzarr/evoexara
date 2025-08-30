import { View, Text } from "react-native";
export default function ActivityScreen() {
  return (
    <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
      <Text style={{ fontSize:26 }}>📰 Activity</Text>
      <Text>Recent activity feed</Text>
    </View>
  );
}
