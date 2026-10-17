const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const HDRI_BASE_URL = `${BACKEND_URL}/hdri`;

export const builtInHdris = [
  {
    id: "day_forest",
    aliases: ["Day_forest", "DayEnvironmentHDRI078"],
    name: "Day Forest",
    category: "Day",
    preview: `${HDRI_BASE_URL}/Day_forest/DayEnvironmentHDRI078.png`,
    file: `${HDRI_BASE_URL}/Day_forest/DayEnvironmentHDRI078_2K_HDR.exr`,
  },
  {
    id: "day_outdoor",
    aliases: ["Day_outdoor", "DayEnvironmentHDRI064"],
    name: "Day Outdoor",
    category: "Day",
    preview: `${HDRI_BASE_URL}/Day_outdoor/DayEnvironmentHDRI064.png`,
    file: `${HDRI_BASE_URL}/Day_outdoor/DayEnvironmentHDRI064_2K_HDR.exr`,
  },
  {
    id: "day_street",
    aliases: ["Day_street", "DayEnvironmentHDRI089"],
    name: "Day Street",
    category: "Day",
    preview: `${HDRI_BASE_URL}/Day_street/DayEnvironmentHDRI089.png`,
    file: `${HDRI_BASE_URL}/Day_street/DayEnvironmentHDRI089_2K_HDR.exr`,
  },
  {
    id: "evening_outdoor",
    aliases: ["Evening_outdoor", "EveningEnvironmentHDRI003"],
    name: "Evening Outdoor",
    category: "Evening",
    preview: `${HDRI_BASE_URL}/Evening_outdoor/EveningEnvironmentHDRI003.png`,
    file: `${HDRI_BASE_URL}/Evening_outdoor/EveningEnvironmentHDRI003_2K_HDR.exr`,
  },
  {
    id: "evening_sky",
    aliases: ["Evening_sky", "EveningSkyHDRI047B"],
    name: "Evening Sky",
    category: "Evening",
    preview: `${HDRI_BASE_URL}/Evening_sky/EveningSkyHDRI047B.png`,
    file: `${HDRI_BASE_URL}/Evening_sky/EveningSkyHDRI047B_2K_HDR.exr`,
  },
  {
    id: "evening_sunset",
    aliases: ["Evening_sunset", "EveningSkyHDRI046B"],
    name: "Evening Sunset",
    category: "Evening",
    preview: `${HDRI_BASE_URL}/Evening_sunset/EveningSkyHDRI046B.png`,
    file: `${HDRI_BASE_URL}/Evening_sunset/EveningSkyHDRI046B_2K_HDR.exr`,
  },
  {
    id: "indoor_auditorium",
    aliases: ["Indoor_auditorium", "IndoorEnvironmentHDRI019"],
    name: "Indoor Auditorium",
    category: "Indoor",
    preview: `${HDRI_BASE_URL}/Indoor_auditorium/IndoorEnvironmentHDRI019.png`,
    file: `${HDRI_BASE_URL}/Indoor_auditorium/IndoorEnvironmentHDRI019_2K_HDR.exr`,
  },
  {
    id: "indoor_hall",
    aliases: ["Indoor_hall", "IndoorEnvironmentHDRI021"],
    name: "Indoor Hall",
    category: "Indoor",
    preview: `${HDRI_BASE_URL}/Indoor_hall/IndoorEnvironmentHDRI021.png`,
    file: `${HDRI_BASE_URL}/Indoor_hall/IndoorEnvironmentHDRI021_2K_HDR.exr`,
  },
  {
    id: "indoor_room",
    aliases: ["Indoor_room", "IndoorEnvironmentHDRI023"],
    name: "Indoor Room",
    category: "Indoor",
    preview: `${HDRI_BASE_URL}/Indoor_room/IndoorEnvironmentHDRI023.png`,
    file: `${HDRI_BASE_URL}/Indoor_room/IndoorEnvironmentHDRI023_2K_HDR.exr`,
  },
  {
    id: "indoor_subway",
    aliases: ["Indoor_subway", "IndoorEnvironmentHDRI006"],
    name: "Indoor Subway",
    category: "Indoor",
    preview: `${HDRI_BASE_URL}/Indoor_subway/IndoorEnvironmentHDRI006.png`,
    file: `${HDRI_BASE_URL}/Indoor_subway/IndoorEnvironmentHDRI006_2K_HDR.exr`,
  },
  {
    id: "night_outdoor",
    aliases: ["Night_outdoor", "NightEnvironmentHDRI007"],
    name: "Night Outdoor",
    category: "Night",
    preview: `${HDRI_BASE_URL}/Night_outdoor/NightEnvironmentHDRI007.png`,
    file: `${HDRI_BASE_URL}/Night_outdoor/NightEnvironmentHDRI007_2K_HDR.exr`,
  },
  {
    id: "night_sky",
    aliases: ["Night_sky", "NightSkyHDRI003"],
    name: "Night Sky",
    category: "Night",
    preview: `${HDRI_BASE_URL}/Night_sky/NightSkyHDRI003.png`,
    file: `${HDRI_BASE_URL}/Night_sky/NightSkyHDRI003_2K_HDR.exr`,
  },
  {
    id: "night_sky_stars",
    aliases: ["Night_sky_stars", "NightSkyHDRI012"],
    name: "Night Sky Stars",
    category: "Night",
    preview: `${HDRI_BASE_URL}/Night_sky_stars/NightSkyHDRI012.png`,
    file: `${HDRI_BASE_URL}/Night_sky_stars/NightSkyHDRI012_2K_HDR.exr`,
  },
  {
    id: "night_street",
    aliases: ["Night_street", "NightEnvironmentHDRI010"],
    name: "Night Street",
    category: "Night",
    preview: `${HDRI_BASE_URL}/Night_street/NightEnvironmentHDRI010.png`,
    file: `${HDRI_BASE_URL}/Night_street/NightEnvironmentHDRI010_2K_HDR.exr`,
  },
];

let cachedHdris = null;

export const fetchHdris = async () => {
  if (cachedHdris) return cachedHdris;
  try {
    const res = await fetch(`${BACKEND_URL}/api/presets/hdri`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.hdris) && data.hdris.length > 0) {
        cachedHdris = data.hdris;
        return data.hdris;
      }
    }
  } catch (err) {
    console.warn("Could not fetch HDRIs from backend, using built-ins:", err);
  }
  cachedHdris = builtInHdris;
  return builtInHdris;
};
