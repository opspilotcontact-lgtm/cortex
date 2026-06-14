// Modo Depth (§2) — "Tu mente": consultar lo que ya sabes y aportar contenido.
// · Preguntar: recuperación sobre tus átomos + notas (RAG sin la capa de IA).
// · Apuntar una idea → nota en tu grafo.
// · Crear una materia nueva → el pipeline la rellenará (con API key).

import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Theme, THEMES, themeFor } from "../theme";
import { ThemeName } from "../types";
import { addNote, addQueue, searchMemory, askAI, MemoryHit } from "../data/contribute";

const WORLDS: ThemeName[] = ["habits", "systems", "behavioral", "wealth", "stoic", "influence", "negotiation", "manson", "ignite", "titans"];

export default function DepthView({ theme, onClose }: { theme: Theme; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<MemoryHit[] | null>(null);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const [idea, setIdea] = useState("");
  const [title, setTitle] = useState("");
  const [picked, setPicked] = useState<ThemeName>("habits");
  const [msg, setMsg] = useState<string | null>(null);

  const ask = async () => {
    if (!q.trim()) return;
    setSearching(true);
    setAiAnswer(null);
    const [memory, ai] = await Promise.all([searchMemory(q), askAI(q)]);
    setHits(memory);
    setAiAnswer(ai?.answer ?? null);
    setSearching(false);
  };
  const saveIdea = async () => {
    if (!idea.trim()) return;
    const ok = await addNote(idea);
    setMsg(ok ? "Idea guardada en tu grafo ✓" : "No se pudo guardar");
    if (ok) setIdea("");
  };
  const createMateria = async () => {
    if (!title.trim()) return;
    const ok = await addQueue({ title, type: "topic", theme: picked });
    setMsg(ok ? `Materia «${title.trim()}» creada ✓ (se llenará con el pipeline)` : "No se pudo crear");
    if (ok) setTitle("");
  };

  const input = { backgroundColor: theme.surface, borderWidth: 1.5, borderColor: theme.line, borderRadius: 16, padding: 14, fontFamily: theme.read, fontSize: 16, color: theme.ink } as const;
  const section = { fontFamily: theme.ui, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase" as const, color: theme.inkFaint, marginTop: 30, marginBottom: 12 };

  return (
    <ScrollView contentContainerStyle={[s.screen, { flexGrow: 1 }]} keyboardShouldPersistTaps="handled">
      <View style={s.head}>
        <Text style={{ fontFamily: theme.display, fontSize: 28, color: theme.ink, letterSpacing: -0.4 }}>Tu mente</Text>
        <Pressable onPress={onClose} hitSlop={10}><Text style={{ fontFamily: theme.ui, fontSize: 13, color: theme.inkFaint }}>cerrar</Text></Pressable>
      </View>

      {/* ── Preguntar a tu memoria ── */}
      <Text style={section}>Pregúntale a tu mente</Text>
      <TextInput value={q} onChangeText={setQ} placeholder="¿Qué sé sobre…? (p. ej. hábitos, miedo, dinero)" placeholderTextColor={theme.inkFaint} style={input} onSubmitEditing={ask} returnKeyType="search" />
      <Pressable onPress={ask} style={({ pressed }) => [s.btn, { backgroundColor: theme.ink, marginTop: 10 }, pressed && { opacity: 0.85 }]}>
        <Text style={{ fontFamily: theme.uiSemi, fontSize: 15, color: theme.paper }}>{searching ? "Buscando…" : "Buscar en mi conocimiento"}</Text>
      </Pressable>
      {aiAnswer && (
        <View style={{ marginTop: 16, backgroundColor: theme.surface, borderRadius: 16, borderLeftWidth: 3, borderLeftColor: theme.accent, padding: 16 }}>
          <Text style={{ fontFamily: theme.ui, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: theme.accent, marginBottom: 6 }}>Tu segundo cerebro</Text>
          <Text style={{ fontFamily: theme.read, fontSize: 17, lineHeight: 25, color: theme.ink }}>{aiAnswer}</Text>
        </View>
      )}
      {hits && (
        <View style={{ marginTop: 16 }}>
          {hits.length === 0 ? (
            <Text style={{ fontFamily: theme.read, fontSize: 15, color: theme.inkSoft, lineHeight: 22 }}>Nada en tu mente sobre eso todavía. Aprende o apunta algo abajo.</Text>
          ) : (
            hits.map((h) => (
              <View key={h.kind + h.id} style={{ borderLeftWidth: 3, borderLeftColor: h.theme ? themeFor(h.theme).accent : theme.inkFaint, paddingLeft: 12, marginBottom: 14 }}>
                <Text style={{ fontFamily: theme.ui, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: theme.inkFaint, marginBottom: 3 }}>{h.kind === "note" ? "Tu nota" : h.queueTitle}</Text>
                <Text style={{ fontFamily: theme.read, fontSize: 16, lineHeight: 23, color: theme.ink }}>{h.body.length > 200 ? h.body.slice(0, 200) + "…" : h.body}</Text>
              </View>
            ))
          )}
          <Text style={{ fontFamily: theme.ui, fontSize: 12, color: theme.inkFaint, marginTop: 6, lineHeight: 18 }}>
            Esto es recuperación de tu conocimiento. La respuesta conversacional de la IA (§10) se activa al conectar la API key.
          </Text>
        </View>
      )}

      {/* ── Apuntar una idea ── */}
      <Text style={section}>Apunta una idea</Text>
      <TextInput value={idea} onChangeText={setIdea} placeholder="Algo que pensaste y quieres guardar…" placeholderTextColor={theme.inkFaint} multiline style={[input, { minHeight: 70, textAlignVertical: "top" }]} />
      <Pressable onPress={saveIdea} style={({ pressed }) => [s.btn, { borderWidth: 1.5, borderColor: theme.line, marginTop: 10 }, pressed && { opacity: 0.85 }]}>
        <Text style={{ fontFamily: theme.uiSemi, fontSize: 15, color: theme.ink }}>Guardar en mi grafo</Text>
      </Pressable>

      {/* ── Crear una materia ── */}
      <Text style={section}>Nueva materia para aprender</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="Un libro, una skill, un tema…" placeholderTextColor={theme.inkFaint} style={input} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        {WORLDS.map((w) => (
          <Pressable key={w} onPress={() => setPicked(w)} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: themeFor(w).accent, borderWidth: picked === w ? 3 : 0, borderColor: theme.ink }} />
        ))}
      </View>
      <Pressable onPress={createMateria} style={({ pressed }) => [s.btn, { borderWidth: 1.5, borderColor: theme.line, marginTop: 12 }, pressed && { opacity: 0.85 }]}>
        <Text style={{ fontFamily: theme.uiSemi, fontSize: 15, color: theme.ink }}>Crear materia</Text>
      </Pressable>

      {msg && <Text style={{ fontFamily: theme.ui, fontSize: 13, color: theme.accent, marginTop: 16, textAlign: "center" }}>{msg}</Text>}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 26, paddingTop: 56, paddingBottom: 36 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  btn: { borderRadius: 999, paddingVertical: 15, paddingHorizontal: 22, alignItems: "center", justifyContent: "center" },
});
