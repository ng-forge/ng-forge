export type Adapter = 'material' | 'bootstrap' | 'primeng' | 'ionic' | 'none';

export interface NgAddOptions {
  project?: string;
  adapter: Adapter;
  legacyStatusClasses?: boolean;
  skipStyles?: boolean;
  skipProviders?: boolean;
}
