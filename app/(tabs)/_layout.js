import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { COLORS } from "../../src/styles/colors";

export default function TabsLayout() {

  return (
<Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        animation: "shift",
      }}
      tabBar={(props) => <CustomPillTabBar {...props} />}
>
<Tabs.Screen

        name="home"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => (
<Ionicons name="home" size={size} color={color} />

          ),

        }}

      />
 
      <Tabs.Screen

        name="vehicles"

        options={{

          title: "Veículos",

          tabBarIcon: ({ color, size }) => (
<Ionicons name="car-sport" size={size} color={color} />

          ),

        }}

      />
 
      <Tabs.Screen

        name="rewards"

        options={{

          title: "Prêmios",

          tabBarIcon: ({ color, size }) => (
<Ionicons name="diamond" size={size} color={color} />

          ),

        }}

      />
 
      <Tabs.Screen

        name="offers"

        options={{

          title: "Ofertas",

          tabBarIcon: ({ color, size }) => (
<Ionicons name="pricetag" size={size} color={color} />

          ),

        }}

      />
 
      <Tabs.Screen

        name="profile"

        options={{

          title: "Perfil",

          tabBarIcon: ({ color, size }) => (
<Ionicons name="person" size={size} color={color} />

          ),

        }}

      />
</Tabs>

  );

}
 
// Floating Glassmorphism Tab Bar

function CustomPillTabBar({ state, descriptors, navigation }) {

  return (
<View style={styles.container} pointerEvents="box-none">
<BlurView intensity={90} tint="light" style={styles.blurPill}>

        {state.routes.map((route, index) => {

          const isFocused = state.index === index;

          const { options } = descriptors[route.key];
 
          const activeColor = COLORS.primary || "#007AFF";

          const inactiveColor = COLORS.textSecondary || "#666666";
 
          const iconColor = isFocused

            ? activeColor

            : inactiveColor;
 
          const renderIcon = options.tabBarIcon;
 
          return (
<Pressable

              key={route.key}

              onPress={async () => {

                // Safe haptic feedback

                try {

                  await Haptics.impactAsync(

                    Haptics.ImpactFeedbackStyle.Light

                  );

                } catch {}
 
                const event = navigation.emit({

                  type: "tabPress",

                  target: route.key,

                  canPreventDefault: true,

                });
 
                if (!isFocused && !event.defaultPrevented) {

                  navigation.navigate(route.name);

                }

              }}

              style={[

                styles.tabButton,

                isFocused && {

                  backgroundColor: `${activeColor}1F`,

                },

              ]}
>

              {renderIcon &&

                renderIcon({

                  color: iconColor,

                  size: 20,

                  focused: isFocused,

                })}
 
              <Text

                style={[

                  styles.label,

                  { color: iconColor },

                ]}
>

                {options.title}
</Text>
</Pressable>

          );

        })}
</BlurView>
</View>

  );

}
 
const styles = StyleSheet.create({

  container: {

    position: "absolute",

    bottom: 34,

    left: 0,

    right: 0,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "transparent",

    zIndex: 100,

  },
 
  blurPill: {

    flexDirection: "row",

    width: Dimensions.get("window").width * 0.92,

    height: 68,

    borderRadius: 34,

    overflow: "hidden",
 
    paddingHorizontal: 8,
 
    alignItems: "center",

    justifyContent: "space-between",
 
    // Fallback background for Android

    backgroundColor: "rgba(255,255,255,0.75)",
 
    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.4)",
 
    shadowColor: "#000",

    shadowOffset: {

      width: 0,

      height: 6,

    },

    shadowOpacity: 0.1,

    shadowRadius: 12,
 
    elevation: 5,

  },
 
  tabButton: {

    flex: 1,

    height: 52,
 
    alignItems: "center",

    justifyContent: "center",
 
    borderRadius: 26,

    marginHorizontal: 2,

  },
 
  label: {

    fontSize: 10,

    marginTop: 4,

    fontWeight: "600",

    textAlign: "center",

  },

});
 