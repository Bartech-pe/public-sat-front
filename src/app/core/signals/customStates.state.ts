
import { Status } from '@models/estados.model';
import { signalState } from '@ngrx/signals';

export const estadoState = signalState({
  loading: false,
  error: null as string | null,
  data: [] as Status[],
});
