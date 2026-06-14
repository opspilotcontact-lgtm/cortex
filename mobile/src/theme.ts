// Sistema de temas por materia (§11). Cada mundo: colores + tipografía propios.
// Abrir una materia u otra se SIENTE distinto — parte de la recompensa variable (§1).
// Los nombres de fuente son los que carga useFonts en App.tsx.

import { ThemeName } from "./types";

export interface Theme {
  isDark: boolean;
  paper: string;
  surface: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  line: string;
  accent: string;
  accent2: string;
  // familias tipográficas (claves de @expo-google-fonts)
  display: string;
  displayItalic: string;
  read: string;
  ui: string;
  uiSemi: string;
  kicker: string;
  kickerPrefix: string;
}

export const THEMES: Record<ThemeName, Theme> = {
  // mundo neutro "Cortex" — inicio / cierre / datos
  neutral: {
    isDark: false,
    paper: "#f4efe6",
    surface: "#ece5d8",
    ink: "#211c16",
    inkSoft: "#5c5346",
    inkFaint: "#9a9080",
    line: "#ddd3c1",
    accent: "#b8512f",
    accent2: "#b8512f",
    display: "Fraunces_500Medium",
    displayItalic: "Fraunces_400Regular_Italic",
    read: "Newsreader_400Regular",
    ui: "HankenGrotesk_400Regular",
    uiSemi: "HankenGrotesk_600SemiBold",
    kicker: "HankenGrotesk_600SemiBold",
    kickerPrefix: "",
  },
  // MATERIA Hábitos Atómicos — cálido, claro, editorial
  habits: {
    isDark: false,
    paper: "#f3ead9",
    surface: "#ece0c9",
    ink: "#2a1d12",
    inkSoft: "#6a5740",
    inkFaint: "#a89275",
    line: "#ddccae",
    accent: "#c0532a",
    accent2: "#b07d24",
    display: "Fraunces_400Regular",
    displayItalic: "Fraunces_400Regular_Italic",
    read: "Newsreader_400Regular",
    ui: "HankenGrotesk_400Regular",
    uiSemi: "HankenGrotesk_600SemiBold",
    kicker: "HankenGrotesk_600SemiBold",
    kickerPrefix: "",
  },
  // MATERIA Pensamiento sistémico — frío, oscuro, técnico
  systems: {
    isDark: true,
    paper: "#0e1719",
    surface: "#16262a",
    ink: "#e8efe9",
    inkSoft: "#9bb4ae",
    inkFaint: "#5d7a74",
    line: "#25403d",
    accent: "#5fd3b6",
    accent2: "#e7a948",
    display: "Syne_700Bold",
    displayItalic: "Syne_700Bold",
    read: "HankenGrotesk_400Regular",
    ui: "HankenGrotesk_400Regular",
    uiSemi: "HankenGrotesk_600SemiBold",
    kicker: "SpaceMono_400Regular",
    kickerPrefix: "// ",
  },
  // PUENTE — la conexión inesperada (§8, máximo valor). Mundo raro y precioso:
  // serif cálida sobre índigo profundo, acentos oro + lila.
  bridge: {
    isDark: true,
    paper: "#161226",
    surface: "#221c3a",
    ink: "#ece8f5",
    inkSoft: "#a99fc9",
    inkFaint: "#6b5f93",
    line: "#322a52",
    accent: "#c9a24b", // oro
    accent2: "#b98cf0", // lila
    display: "Fraunces_500Medium",
    displayItalic: "Fraunces_400Regular_Italic",
    read: "Newsreader_400Regular",
    ui: "HankenGrotesk_400Regular",
    uiSemi: "HankenGrotesk_600SemiBold",
    kicker: "HankenGrotesk_600SemiBold",
    kickerPrefix: "✦ ",
  },
  // MATERIA Economía del comportamiento — limpio, frío, editorial científico.
  // Serif didone dramático (DM Serif) sobre blanco-hueso, acentos cobalto + coral.
  behavioral: {
    isDark: false,
    paper: "#eceae3",
    surface: "#e0ded5",
    ink: "#16181d",
    inkSoft: "#54585f",
    inkFaint: "#9a9ea6",
    line: "#d3d2c8",
    accent: "#2f5fd0", // cobalto
    accent2: "#df4f3a", // coral
    display: "DMSerifDisplay_400Regular",
    displayItalic: "DMSerifDisplay_400Regular_Italic",
    read: "Newsreader_400Regular",
    ui: "HankenGrotesk_400Regular",
    uiSemi: "HankenGrotesk_600SemiBold",
    kicker: "HankenGrotesk_600SemiBold",
    kickerPrefix: "→ ",
  },
  // MATERIA Estoicismo (Meditaciones) — clásico, de piedra. Serif humanista
  // (EB Garamond, la letra de los textos antiguos) sobre mármol templado,
  // acento bronce + un verde pizarra sobrio. Atemporal, no decorativo.
  stoic: {
    isDark: false,
    paper: "#e4dfd3",
    surface: "#d9d3c4",
    ink: "#262219",
    inkSoft: "#675e4d",
    inkFaint: "#a59b86",
    line: "#cdc5b3",
    accent: "#9c5a3c", // bronce/terracota
    accent2: "#3f5a59", // verde pizarra
    display: "EBGaramond_600SemiBold",
    displayItalic: "EBGaramond_400Regular_Italic",
    read: "EBGaramond_400Regular",
    ui: "HankenGrotesk_400Regular",
    uiSemi: "HankenGrotesk_600SemiBold",
    kicker: "HankenGrotesk_600SemiBold",
    kickerPrefix: "— ",
  },
  // MATERIA Piense y hágase rico — clásico de la riqueza. Verde bosque profundo
  // con oro viejo, serif Fraunces. Premium, atemporal, "old money".
  wealth: {
    isDark: true,
    paper: "#132219",
    surface: "#1d3327",
    ink: "#ece5d0",
    inkSoft: "#a6b3a1",
    inkFaint: "#697a67",
    line: "#2b4435",
    accent: "#cfa94e", // oro viejo
    accent2: "#83bd95", // verde salvia
    display: "Fraunces_500Medium",
    displayItalic: "Fraunces_400Regular_Italic",
    read: "Newsreader_400Regular",
    ui: "HankenGrotesk_400Regular",
    uiSemi: "HankenGrotesk_600SemiBold",
    kicker: "HankenGrotesk_600SemiBold",
    kickerPrefix: "❦ ",
  },
  // MATERIA Influencia (Cialdini) — "armas de influencia". Negro cálido con
  // carmesí + ámbar, display Anton (condensada, rotunda, de cartel publicitario).
  influence: {
    isDark: true,
    paper: "#1a1413",
    surface: "#271c1a",
    ink: "#f1e8e3",
    inkSoft: "#c2a79e",
    inkFaint: "#82675f",
    line: "#3c2a25",
    accent: "#e0443a", // carmesí
    accent2: "#e8a33d", // ámbar
    display: "Anton_400Regular",
    displayItalic: "Anton_400Regular",
    read: "Newsreader_400Regular",
    ui: "HankenGrotesk_400Regular",
    uiSemi: "HankenGrotesk_600SemiBold",
    kicker: "HankenGrotesk_600SemiBold",
    kickerPrefix: "▸ ",
  },
  // MATERIA Rompe la barrera del no (Chris Voss) — negociación FBI. Negro azulado
  // frío con azul táctico + ámbar; display monoespaciada (SpaceMono, ya cargada):
  // aire de "transcripción interceptada" / sala de crisis.
  negotiation: {
    isDark: true,
    paper: "#0f1216",
    surface: "#191f25",
    ink: "#dfe5ea",
    inkSoft: "#93a0ac",
    inkFaint: "#5a6873",
    line: "#283039",
    accent: "#5b9dd9", // azul táctico
    accent2: "#e0a24a", // ámbar de alerta
    display: "SpaceMono_400Regular",
    displayItalic: "SpaceMono_400Regular",
    read: "HankenGrotesk_400Regular",
    ui: "HankenGrotesk_400Regular",
    uiSemi: "HankenGrotesk_600SemiBold",
    kicker: "SpaceMono_400Regular",
    kickerPrefix: "» ",
  },
  // MATERIA El sutil arte… (Manson) — brutalista: blanco hueso, negro puro y un
  // naranja de seguridad. Display Anton (rotunda). Crudo, sin florituras.
  manson: {
    isDark: false,
    paper: "#f1efe9",
    surface: "#e5e2d9",
    ink: "#15140f",
    inkSoft: "#56544c",
    inkFaint: "#9a978c",
    line: "#d6d2c6",
    accent: "#ff5a1f", // naranja de seguridad
    accent2: "#15140f",
    display: "Anton_400Regular",
    displayItalic: "Anton_400Regular",
    read: "HankenGrotesk_400Regular",
    ui: "HankenGrotesk_400Regular",
    uiSemi: "HankenGrotesk_600SemiBold",
    kicker: "HankenGrotesk_600SemiBold",
    kickerPrefix: "✱ ",
  },
  // MATERIA El poder de los 5 segundos (Robbins) — eléctrico, urgente, cuenta
  // atrás. Negro con lima eléctrica + magenta. Display Syne (geométrica).
  ignite: {
    isDark: true,
    paper: "#14130f",
    surface: "#201e16",
    ink: "#f3f1e6",
    inkSoft: "#b6b2a0",
    inkFaint: "#74715f",
    line: "#322f22",
    accent: "#e6ff4d", // lima eléctrica
    accent2: "#ff3d7f", // magenta
    display: "Syne_700Bold",
    displayItalic: "Syne_700Bold",
    read: "HankenGrotesk_400Regular",
    ui: "HankenGrotesk_400Regular",
    uiSemi: "HankenGrotesk_600SemiBold",
    kicker: "HankenGrotesk_600SemiBold",
    kickerPrefix: "↑ ",
  },
  // MATERIA Armas de titanes (Ferriss) — "manual de operador": grafito, bronce
  // y teal. Display Hanken semibold (sans limpia y moderna). Premium, sobrio.
  titans: {
    isDark: true,
    paper: "#1b1d21",
    surface: "#262a30",
    ink: "#e7e9ec",
    inkSoft: "#a3a8b0",
    inkFaint: "#6a6f78",
    line: "#33373e",
    accent: "#d8a657", // bronce
    accent2: "#6fa8a0", // teal apagado
    display: "HankenGrotesk_600SemiBold",
    displayItalic: "HankenGrotesk_600SemiBold",
    read: "Newsreader_400Regular",
    ui: "HankenGrotesk_400Regular",
    uiSemi: "HankenGrotesk_600SemiBold",
    kicker: "HankenGrotesk_600SemiBold",
    kickerPrefix: "— ",
  },
};

export const themeFor = (name: ThemeName): Theme => THEMES[name] ?? THEMES.neutral;
