

export type JourneyType = 'journey' | 'mountain' | 'bike';

export interface PointProps {

  id: string;
  type: JourneyType;
  title: string;

  journeys: {
    date: string;
    photos?: {
      description?: string;
      filename: string;
      base64Data: string;
    }[];
  }[];

}

// export interface GeometryCollectionProps {

//   id: string;
//   type: JourneyType;
//   title?: string;

// }
