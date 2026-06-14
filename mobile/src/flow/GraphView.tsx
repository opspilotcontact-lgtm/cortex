// Vista de grafo personal (§11). Force-directed: SVG dibuja las aristas y los
// nodos son vistas arrastrables encima. Arrastrar un nodo y soltarlo SOBRE otro
// crea un puente manual (drag de nodo sobre nodo, §11) → que vuelve al Flow.
// Tocar dos nodos también los conecta (alternativa accesible).

import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, { Line } from "react-native-svg";
import { GraphData, GraphNode, loadGraph, createUserBridge } from "../data/graph";
import { Theme, themeFor } from "../theme";

const W = 340, H = 460, NR = 28;

function computeLayout(data: GraphData): Record<string, { x: number; y: number }> {
  const { nodes, edges } = data;
  const n = nodes.length;
  const pos = nodes.map((_, i) => {
    const a = (i / Math.max(n, 1)) * 2 * Math.PI;
    return { x: W / 2 + Math.cos(a) * W * 0.28, y: H / 2 + Math.sin(a) * H * 0.28 };
  });
  const idx: Record<string, number> = {};
  nodes.forEach((nd, i) => (idx[nd.id] = i));
  const k = Math.sqrt((W * H) / Math.max(n, 1)) * 0.55;
  for (let it = 0; it < 180; it++) {
    const disp = pos.map(() => ({ x: 0, y: 0 }));
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        const dx = pos[i].x - pos[j].x, dy = pos[i].y - pos[j].y;
        const d = Math.hypot(dx, dy) || 0.01;
        const rep = (k * k) / d, ux = dx / d, uy = dy / d;
        disp[i].x += ux * rep; disp[i].y += uy * rep;
        disp[j].x -= ux * rep; disp[j].y -= uy * rep;
      }
    for (const e of edges) {
      const i = idx[e.a], j = idx[e.b];
      if (i == null || j == null) continue;
      const dx = pos[i].x - pos[j].x, dy = pos[i].y - pos[j].y;
      const d = Math.hypot(dx, dy) || 0.01;
      const att = (d * d) / k, ux = dx / d, uy = dy / d;
      disp[i].x -= ux * att; disp[i].y -= uy * att;
      disp[j].x += ux * att; disp[j].y += uy * att;
    }
    const temp = 1 - it / 180;
    for (let i = 0; i < n; i++) {
      disp[i].x += (W / 2 - pos[i].x) * 0.025;
      disp[i].y += (H / 2 - pos[i].y) * 0.025;
      const dl = Math.hypot(disp[i].x, disp[i].y) || 0.01;
      const step = Math.min(dl, 20 * temp);
      pos[i].x = Math.max(NR, Math.min(W - NR, pos[i].x + (disp[i].x / dl) * step));
      pos[i].y = Math.max(NR, Math.min(H - NR, pos[i].y + (disp[i].y / dl) * step));
    }
  }
  const out: Record<string, { x: number; y: number }> = {};
  nodes.forEach((nd, i) => (out[nd.id] = pos[i]));
  return out;
}

const short = (s: string, n = 14) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

// ── nodo arrastrable ──────────────────────────────────────────────
function NodeView({ node, x, y, selected, theme, onTap, onDrop }: {
  node: GraphNode; x: number; y: number; selected: boolean; theme: Theme;
  onTap: (n: GraphNode) => void; onDrop: (id: string, dx: number, dy: number) => void;
}) {
  const tx = useSharedValue(0), ty = useSharedValue(0);
  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .activeOffsetY([-8, 8])
    .onUpdate((e) => { tx.value = e.translationX; ty.value = e.translationY; })
    .onEnd((e) => { runOnJS(onDrop)(node.id, e.translationX, e.translationY); tx.value = 0; ty.value = 0; });
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { translateY: ty.value }] }));
  const accent = themeFor(node.theme).accent;
  return (
    <GestureDetector gesture={pan}>
      <Reanimated.View style={[{ position: "absolute", left: x - NR, top: y - NR, width: NR * 2, height: NR * 2 }, style]}>
        <Pressable
          onPress={() => onTap(node)}
          style={{ width: NR * 2, height: NR * 2, borderRadius: NR, backgroundColor: theme.surface, borderWidth: selected ? 3 : 1.8, borderColor: selected ? theme.ink : accent, alignItems: "center", justifyContent: "center", padding: 4 }}
        >
          <View style={{ position: "absolute", top: 6, width: 7, height: 7, borderRadius: 4, backgroundColor: accent }} />
          <Text style={{ fontFamily: theme.uiSemi, fontSize: 8.5, color: theme.ink, textAlign: "center" }}>{short(node.label)}</Text>
        </Pressable>
      </Reanimated.View>
    </GestureDetector>
  );
}

export default function GraphView({ theme, onClose }: { theme: Theme; onClose: () => void }) {
  const [data, setData] = useState<GraphData | null>(null);
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>({});
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => loadGraph().then(setData);
  useEffect(() => { load(); }, []);
  const layout = useMemo(() => (data ? computeLayout(data) : {}), [data]);
  useEffect(() => { setPos(layout); }, [layout]);

  const nodes = data?.nodes ?? [];
  const edges = data?.edges ?? [];
  const nodeById = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);

  const connect = async (a: GraphNode, b: GraphNode) => {
    if (busy || a.id === b.id) return;
    setBusy(true);
    const ok = await createUserBridge(a, b);
    setSelected(null);
    if (ok) await load();
    setBusy(false);
  };

  const onTap = (node: GraphNode) => {
    if (busy) return;
    if (!selected) { setSelected(node); return; }
    if (selected.id === node.id) { setSelected(null); return; }
    connect(selected, node);
  };

  // soltar un nodo: si cae sobre otro → puente; si no → reposicionar
  const onDrop = (id: string, dx: number, dy: number) => {
    const cur = pos[id];
    if (!cur) return;
    const nx = Math.max(NR, Math.min(W - NR, cur.x + dx));
    const ny = Math.max(NR, Math.min(H - NR, cur.y + dy));
    const target = nodes.find((n) => n.id !== id && pos[n.id] && Math.hypot(pos[n.id].x - nx, pos[n.id].y - ny) < NR * 1.6);
    if (target) {
      connect(nodeById[id], target); // soltado encima de otro → conectar
    } else {
      setPos((p) => ({ ...p, [id]: { x: nx, y: ny } })); // reposicionar
    }
  };

  return (
    <ScrollView contentContainerStyle={[s.screen, { flexGrow: 1 }]}>
      <View style={s.head}>
        <Text style={{ fontFamily: theme.display, fontSize: 28, color: theme.ink, letterSpacing: -0.4 }}>Tu grafo</Text>
        <Pressable onPress={onClose} hitSlop={10}><Text style={{ fontFamily: theme.ui, fontSize: 13, color: theme.inkFaint }}>cerrar</Text></Pressable>
      </View>
      <Text style={{ fontFamily: theme.ui, fontSize: 13, lineHeight: 19, color: theme.inkSoft, marginTop: 6 }}>
        Cómo conectas tus ideas (§11). Arrastra un nodo sobre otro —o toca dos— para tender un puente; aparecerá en tu Flow.
      </Text>

      {data && nodes.length === 0 ? (
        <View style={{ paddingVertical: 60, alignItems: "center" }}>
          <Text style={{ fontFamily: theme.display, fontSize: 22, color: theme.ink, textAlign: "center" }}>Aún no hay nada que conectar.</Text>
          <Text style={{ fontFamily: theme.read, fontSize: 16, lineHeight: 24, color: theme.inkSoft, textAlign: "center", marginTop: 12 }}>
            Guarda ideas con ★ mientras lees. Cada una se convierte en un nodo de tu grafo.
          </Text>
        </View>
      ) : (
        <View style={{ alignItems: "center", marginTop: 18 }}>
          <View style={{ width: W, height: H }}>
            <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
              {edges.map((e, i) => {
                const a = pos[e.a], b = pos[e.b];
                if (!a || !b) return null;
                return (
                  <Line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={e.origin === "user_created" ? theme.accent : theme.inkFaint}
                    strokeWidth={1 + e.strength * 3}
                    strokeDasharray={e.origin === "ai_detected" ? "5 5" : undefined} opacity={0.6} />
                );
              })}
            </Svg>
            {nodes.map((nd) => {
              const p = pos[nd.id];
              if (!p) return null;
              return <NodeView key={nd.id} node={nd} x={p.x} y={p.y} selected={selected?.id === nd.id} theme={theme} onTap={onTap} onDrop={onDrop} />;
            })}
          </View>
          <Text style={{ fontFamily: theme.ui, fontSize: 12.5, color: theme.inkFaint, marginTop: 14, textAlign: "center" }}>
            {busy ? "tendiendo el puente…" : selected ? `«${short(selected.label, 24)}» — toca o arrastra a otro nodo` : `${nodes.length} ideas · ${edges.length} puentes`}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 26, paddingTop: 56, paddingBottom: 36 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
