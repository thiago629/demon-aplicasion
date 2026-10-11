// Identidad de Lunaure: obsidiana, oro champán y marfil.
// La marca usa siempre su versión oscura (decisión de diseño), en móvil y en web.
export const brand = {
  obsidiana: '#0A0908',
  oro: '#D4AF6A',
  oroClaro: '#F1D9A2',
  marfil: '#F5EFE4',
  vino: '#C8565A',
};

const lux = {
  bg: brand.obsidiana,
  card: '#14120F',
  elev: '#1C1915',
  text: brand.marfil,
  muted: '#A39B8E',
  line: '#2A2620',
  accent: brand.oro,
  accentSoft: brand.oroClaro,
  accentText: '#15110A',
  danger: '#E07A6A',
  chip: '#221E18',
  like: brand.vino,
  ok: '#7FBF95',
};

export type Theme = typeof lux;

export const fuentes = {
  display: 'CormorantGaramond_600SemiBold',
  displayBold: 'CormorantGaramond_700Bold',
  italica: 'CormorantGaramond_500Medium_Italic',
};

export function useTheme(): Theme {
  return lux;
}
