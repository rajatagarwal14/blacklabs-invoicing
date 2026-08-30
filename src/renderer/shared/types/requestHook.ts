import type { FilterData } from './filter';

export interface RequestHook<T> {
  immediate?: boolean;
  showLoader?: boolean;
  filter?: FilterData[];
  onDone?: (data: T) => void;
}
