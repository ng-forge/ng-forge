export interface FormEvent {
  readonly type: string;
}

export type FormEventConstructor<T extends FormEvent = FormEvent> = new (...args: any[]) => T;
