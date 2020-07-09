import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'getIcon'
})
export class GetIconPipe implements PipeTransform {

  transform(value: string, ..._args: any[]): any {
    return `assets/icons/${value}.svg`;
  }

}
