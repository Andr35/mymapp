

export type MarkerType = 'journey' | 'mountain' | 'bike';

export interface MarkerProps {

  id: string;
  title: string;
  type: MarkerType;

  journeys: {
    date: string;
    photos?: {
      description?: string;
      filename: string;
      base64Data: string;
    }[];
  }[];

}
