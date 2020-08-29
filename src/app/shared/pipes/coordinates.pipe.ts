import {Pipe, PipeTransform} from '@angular/core';
import {PointProps} from '@app/models/geojson-props';

@Pipe({
  name: 'coordinates'
})
export class CoordinatesPipe implements PipeTransform {


  transform(value: GeoJSON.Feature<GeoJSON.Geometry, PointProps> | null, ...args: unknown[]): unknown {
    const point: GeoJSON.Point | undefined = value?.geometry as GeoJSON.Point;
    return `${point?.coordinates[1]?.toFixed(6)} ${point?.coordinates[0]?.toFixed(6)}`;
  }

}
