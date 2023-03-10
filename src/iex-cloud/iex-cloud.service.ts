import { Injectable } from '@nestjs/common';
import { Client } from '@apperate/iexjs';

/**
 * IEX Cloud Service that can be used to interact with some of Apperate's
 * CORE data sets.
 */
@Injectable()
export class IexCloudService {
  /**
   * The IEX Cloud Client to use to query data in Apperate.
   */
  private readonly iexClient;

  /**
   * Creates a new version of the IEX Cloud Client using the IEX_TOKEN environment
   * variable to retrieve the API Key for IEX Cloud.
   */
  constructor() {
    this.iexClient = new Client({
      version: 'v1',
      api_token: process.env.IEX_TOKEN,
    });
  }

  /**
   * Retrieves details about the specified stock symbol such as company name and last price change.
   * @param stockSymbol The stock symbol to retrieve details about.
   * @returns Details about the specified stock if it was found.
   */
  async getStockDetailsAsync(stockSymbol: string): Promise<StockDetails> {
    // Retrieve the company details
    const companyResults: CompanyData[] =
      await this.iexClient.apperate.queryData({
        key: stockSymbol,
        workspace: 'CORE',
        id: 'COMPANY',
        last: 1,
      });

    // If no company details were returned, throw an Error as it means the company either doesn't
    // exist or we don't have that company's details and financial data.
    if (companyResults.length === 0) {
      throw Error('Could not find company information for the stock symbol.');
    }

    // Retrieve the stock's last two trading days so that we can calculate the last close price change.
    const lastTwoStockPrices: HistoricalPriceData[] =
      await this.iexClient.apperate.queryData({
        key: stockSymbol,
        workspace: 'CORE',
        id: 'HISTORICAL_PRICES',
        last: 2,
      });

    let change: number | null = null;
    if (lastTwoStockPrices.length === 0) {
      // If we can't retrieve the last two close prices for the stock, throw an error.
      throw Error('Could not find the latest price for the specified stock.');
    } else if (lastTwoStockPrices.length === 2) {
      // If we have two stock price records returned, we can calculate the price change by subtracting
      // the latest stock's close price from the previous day's close price. Notice how we round the
      // change to four decimal places by multiplying the number by 10000, rounding it and then dividing
      // by 10000.
      change =
        Math.round(
          (lastTwoStockPrices[0].close - lastTwoStockPrices[1].close) * 10000,
        ) / 10000;
    }

    return {
      companyName: companyResults[0].companyName,
      symbol: stockSymbol,
      change,
    };
  }

  /**
   * Tries to retrieve the stock close prices for a specified stock symbol over the given date range.
   * @param stockSymbol The stock symbol to retrieve historical financial data for.
   * @param range The date range to retrieve financial data for.
   * @returns A list of stock close prices over the specified date range, if any are available.
   */
  async getStockHistoricalDataAsync(
    stockSymbol: string,
    range: Range,
  ): Promise<StockClose[]> {
    // Retrieve all the stock prices from the HISTORICAL_PRICES dataset over the specified range.
    const historicalData = await this.iexClient.apperate.queryData({
      key: stockSymbol,
      workspace: 'CORE',
      id: 'HISTORICAL_PRICES',
      range,
      // Data is returned in descending order by default, so flip it here so the graphs are rendered
      // correctly.
      sort: 'ASC',
    });

    return historicalData.map((x) => ({ date: x.priceDate, close: x.close }));
  }
}

/**
 * TypeScript type used to represent the details about a particular stock symbol.
 */
export type StockDetails = {
  companyName: string;
  symbol: string;
  change: number | null;
};

/**
 * TypeScript type used to represent a single stock close price and its date.
 */
export type StockClose = {
  date: string;
  close: number;
};

/**
 * Range type that shows all the different ranges that can be passed to Apperate.
 */
export type Range =
  | '1D'
  | '5D'
  | '1M'
  | '3M'
  | '6M'
  | 'YTD'
  | '1Y'
  | '3Y'
  | '5Y'
  | '15Y';

/**
 * An array of all the different ranges available. This is used to render the correct
 * range buttons on the frontend.
 */
export const AllRanges: Range[] = [
  '1D',
  '5D',
  '1M',
  '3M',
  '6M',
  'YTD',
  '1Y',
  '3Y',
  '5Y',
  '15Y',
];

/**
 * TypeScript type containing the most essential fields that are returned when querying
 * the HISTORICAL_PRICES dataset. Other fields are also returned, but we don't use them
 * so they aren't specified here.
 */
type HistoricalPriceData = {
  close: number;
  high: number;
  low: number;
  open: number;
  priceDate: string;
  symbol: string;
};

/**
 * TypeScript type containing the most essential fields that are returned when querying
 * company data from the COMPANY dataset in Apperate. Other fields are also returned, but
 * we don't use them so they aren't specified here.
 */
type CompanyData = {
  companyName: string;
  symbol: string;
  website: string | null;
};
