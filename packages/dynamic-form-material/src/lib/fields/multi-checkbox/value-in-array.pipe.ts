import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  pure: true,
  name: 'inArray',
})
export class ValueInArrayPipe implements PipeTransform {
  transform<T>(element: T, array: T[] | undefined): boolean {
    console.log('ValueInArrayPipe called with element:', element, 'and array:', array);
    return array?.includes(element) ?? false;
  }
}
