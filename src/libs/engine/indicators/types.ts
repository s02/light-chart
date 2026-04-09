export type Indicator = {
  apply: () => Promise<void>
  remove: () => Promise<void> | void
}
