import {JourneyType} from './geojson-props';

export interface AddMarkerTool {
  type: JourneyType;
  color: string;
  label: string;
  icon: string;
}


export const ADD_MARKER_TOOLS: AddMarkerTool[] = [
  {type: 'journey', color: '#81d4fa', label: 'Travel', icon: 'wallet-travel'},
  {type: 'mountain', color: '#a5d6a7', label: 'Mountain', icon: 'image-filter-hdr'},
  {type: 'bike', color: '#ffcc80', label: 'Bike', icon: 'bike'},
  {type: 'ski', color: '#bdbdbd', label: 'Skiing', icon: 'ski'},
];
