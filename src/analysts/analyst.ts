import { BotConfig } from '../common/config'
import { AssetsWatcherUpdateEvent, AssetWatcherObserver } from '../assetWatcher/assetWatcher.interface'
import { AssetWatcher } from '../assetWatcher/assetWatcher'
import { logger } from '../common/logger'
import { round } from 'lodash'
import events from 'events'

export enum ANALYST_EVENTS {
  SELL = 'ANALYST:SELL',
  BUY = 'ANALYST:BUY'
}

export class Analyst extends events.EventEmitter implements AssetWatcherObserver {

  data: any
  indicators: any[]

  constructor(readonly watcher: AssetWatcher, readonly config: BotConfig) {
    super()
    this.indicators = []
    this.data = {}
  }

  registerIndicator(weight: number, period: number, name: string, indicator: any) {
    this.indicators.push({
      weight, period, name, indicator
    })
  }

  // Called by the AssetWatcher we observe
  async analyseAssetData(event: AssetsWatcherUpdateEvent): Promise<void> {
    // save data for later
    this.data[event.period] = event.blocks

    const result = this.indicators.map((currentIndicator) => {
      //const [weight, period, name, indicator] = currentIndicator
      const { weight, period, name, indicator } = currentIndicator
      const confidence = this.data[period] === undefined ? 0 : indicator(this.data[period])
      return {
        name,
        weight,
        confidence
      }
    })

    const confidence = result.reduce((acc, result) => {
      return acc + (result.weight * result.confidence)
    }, 0)

    logger.debug(`${this.constructor.name} confidence: ${round(confidence, 2)}, summary: ${JSON.stringify(result)}`)

    if (confidence >= 0.6) {
      this.sendRecommendationToBot(event.pair, confidence)
    }
  }

  sendRecommendationToBot(pair: string, confidence: number) {
    throw new Error('Method not implemented.')
  }
}
