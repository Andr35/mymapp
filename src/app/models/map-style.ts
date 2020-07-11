export interface MapStyle {
  label: string;
  styleName: string;
  styleUrl: string;
}

export const MAP_DEFAULT_STYLES = [
  {
    label: 'Streets',
    styleName: 'Mapbox Streets',
    styleUrl: 'mapbox://styles/mapbox/streets-v11'
  }, {
    label: 'Satellite',
    styleName: 'Mapbox Satellite Streets',
    styleUrl: 'mapbox://sprites/mapbox/satellite-streets-v11'
  }
];
