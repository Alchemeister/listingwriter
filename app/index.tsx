import { Platform } from "react-native";
import { Redirect } from "expo-router";

export default function Index() {
  // On native (iOS/Android), go straight to the app
  // On web, show the landing page

  if (Platform.OS === "web") {
    return <Redirect href="/landing" />;
  }

  return <Redirect href="/create" />;
}
