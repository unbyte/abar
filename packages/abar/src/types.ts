export type Transformer = (entries: BarEntry[]) => BarEntry[]

export interface Config {
  stream: NodeJS.WriteStream
  renderThrottle: number
  enabled: boolean
  discardStdin: boolean
  transformers: Transformer[]
}

export interface BarEntry {
  id: string
  text: string
  createdAt: number
  updatedAt: number
}
