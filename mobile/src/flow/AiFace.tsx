// La cara de Cortex (§11). Un avatar vivo: parpadea, respira y, cuando "habla",
// la boca late. No es decorado — es la IA poniéndote cara cuando se dirige a ti.
// Hecho con Views + Reanimated (sin SVG animado) → cross-platform y ligero.

import React, { useEffect } from "react";
import { View } from "react-native";
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming, withRepeat, withSequence, withDelay, Easing } from "react-native-reanimated";
import { Theme } from "../theme";

export default function AiFace({ theme, size = 56, speaking = false }: { theme: Theme; size?: number; speaking?: boolean }) {
  const bob = useSharedValue(0);
  const blink = useSharedValue(1);
  const mouth = useSharedValue(1);

  useEffect(() => {
    // respira al entrar y luego REPOSA (finito): se siente viva sin animar para
    // siempre → capturable y amable con la batería. Cada remontaje la reactiva.
    bob.value = withRepeat(withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.sin) }), 6, true, () => { bob.value = 0; });
    // parpadea un par de veces y se queda con los ojos abiertos
    blink.value = withDelay(2600, withRepeat(withSequence(withTiming(0.12, { duration: 90 }), withTiming(1, { duration: 110 }), withDelay(2800, withTiming(1, { duration: 1 }))), 2, false));
  }, []);

  useEffect(() => {
    if (speaking) mouth.value = withRepeat(withSequence(withTiming(1.7, { duration: 180 }), withTiming(0.7, { duration: 180 })), -1, true);
    else mouth.value = withTiming(1, { duration: 200 });
  }, [speaking]);

  const headS = useAnimatedStyle(() => ({ transform: [{ translateY: -2 + bob.value * 4 }] }));
  const eyeS = useAnimatedStyle(() => ({ transform: [{ scaleY: blink.value }] }));
  const mouthS = useAnimatedStyle(() => ({ transform: [{ scaleY: mouth.value }] }));

  const eye = size * 0.13;
  return (
    <Reanimated.View style={[headS, { width: size, height: size, borderRadius: size * 0.32, backgroundColor: theme.surface, borderWidth: 2, borderColor: theme.accent, alignItems: "center", justifyContent: "center" }]}>
      <View style={{ flexDirection: "row", gap: size * 0.16, marginBottom: size * 0.1 }}>
        <Reanimated.View style={[eyeS, { width: eye, height: eye, borderRadius: eye / 2, backgroundColor: theme.ink }]} />
        <Reanimated.View style={[eyeS, { width: eye, height: eye, borderRadius: eye / 2, backgroundColor: theme.ink }]} />
      </View>
      <Reanimated.View style={[mouthS, { width: size * 0.32, height: size * 0.07, borderRadius: size * 0.04, backgroundColor: theme.accent }]} />
    </Reanimated.View>
  );
}
