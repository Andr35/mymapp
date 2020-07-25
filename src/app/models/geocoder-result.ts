
export interface GeocoderResult {
  type: 'FeatureCollection';
  query: string[];
  features: GeocoderResultFeature[];
  attribution: string;
}


export interface GeocoderResultFeature {
  'id': string;
  'type': 'Feature';
  'place_type': string[];
  'relevance': number;
  'properties': object;
  'text': string;
  'place_name': string;
  'bbox': [number, number, number, number];
  'center': [number, number];
  'geometry': GeoJSON.Point;
  'context': {
    id: string;
    short_code: string;
    wikidata: string;
    text: string
  }[
  ];
}
