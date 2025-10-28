import { Pipe } from '@angular/core';

@Pipe({
  pure: true,
  name: 'inArray',
})
export class ValueInArrayPipe {
  transform<T>(element: T, array: T[] | undefined): boolean {
    console.log('ValueInArrayPipe called with element:', element, 'and array:', array);
    return array?.includes(element) ?? false;
  }
}
