export interface ActiveBarEntry {
  id: string
  text: string
  createdAt: number
  updatedAt: number
}

export interface SyntheticBarEntry {
  id: string
  text: string
}

export type BarEntry = ActiveBarEntry | SyntheticBarEntry

export type Transformer = (entries: BarEntry[]) => BarEntry[]

export interface Config {
  stream: NodeJS.WriteStream
  renderThrottle: number
  enabled: boolean
  discardStdin: boolean
  transformers: Transformer[]
}
