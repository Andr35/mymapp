

export type JourneyType = 'journey' | 'mountain' | 'bike' | 'ski';

export interface PointProps {

  id: string;
  type: JourneyType;
  title: string;

  journeys?: Journey[];

}

export interface Journey {
  date: string;
  photos?: JourneyPhoto[];
}

export interface JourneyPhoto {
  filename: string;
  base64Data: string;
  description?: string;
}

// export interface GeometryCollectionProps {

//   id: string;
//   type: JourneyType;
//   title?: string;

// }
