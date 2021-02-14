export interface Trade {
  id: string
  pair: string
  price: number
  volume: number
  cost: number
  fee: number
  tax: number
}

export interface BuyOrder {
  pair: string
  idealPrice: number // we don't really need that. just for MockKrakenService
  price?: number
  volume?: number
}

export interface SellOrder {
  pair: string
  price: number
  volume: number
}

export interface BuyRecommendation {
  pair: string
  lastPrice: number
  confidene: number
}
