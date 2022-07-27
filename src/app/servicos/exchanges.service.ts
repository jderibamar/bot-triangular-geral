import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core' //para que o nosso serviço tenha acesso ao módulo HTTP
import { map } from 'rxjs/operators'
// const stocksExchange = require('stocks-exchange-client').client

@Injectable()
export class ExchangesService
{
    private API_BINANCE = 'https://api.binance.com/api/v3/depth?symbol='
    private API_BITCOINTRADE = 'https://api.bitcointrade.com.br/v3/public/'
    private API_STEX = 'https://api3.stex.com/public/orderbook/'
    private API_CREX24 = 'https://api.crex24.com/v2/public/orderBook?instrument='
    private API_MERCATOX = 'https://mercatox.com/api/public/v1/orderbook?market_pair='
    private API_BITTREX = 'https://api.bittrex.com/v3/markets/'
        
    constructor(private http: HttpClient){}

    binance(par_moeda: any)
    {
        return this.http.get(`${ this.API_BINANCE }${ par_moeda }&limit=5`)
        .pipe( map( (res: any) => res ) )
    }

    bitcoinTrade(par_moeda: any)
    {
        return this.http.get(`${ this.API_BITCOINTRADE }${ par_moeda }/orders?limit=1`)
        .pipe( map( (res: any) => res ) )
    }

    stex(par_moeda: any)
    {
        return this.http.get(`${ this.API_STEX }${ par_moeda }`)
        .pipe( map( (res) => res ) )
    }

    mercatox(par_moeda: any)
    {
        return this.http.get(`${ this.API_MERCATOX }${ par_moeda }`)
        .pipe( map( (res: any) => res ) ) 
    }

    // Trabalhando com a função FETCH nativa do JS para requisição das APIs
    async ob_stex(par_moeda: any)
    {
        let api_url = `${ this.API_STEX }${ par_moeda } `,
          fetch_url = await fetch(api_url),
          orderbook = await fetch_url.json()

          return orderbook
    }

    async ob_bittrex(par_moeda: any)
    {
        let api_url = `${ this.API_BITTREX }${ par_moeda }/orderbook`,
            fetch_url = await fetch(api_url),
            orderbook = await fetch_url.json()

            return orderbook
    }

    async api_mexc()
    {
       let api_url = await fetch('https://api.mexc.com/api/v3/exchangeInfo'),
           json = await api_url.json()

           return json
    }

    async ob_mexc(par_moeda: any)
    {
       let api_url = await fetch('https://api.mexc.com/api/v3/depth?symbol=' + par_moeda),
           json = await api_url.json()

       return json
    }

    async ob_fmfw(par_moeda: any)
    {
       let api_url = await fetch('https://api.fmfw.io/api/3/public/orderbook/' + par_moeda),
           json = await api_url.json()

       return json
    }

    async ob_mercatox(par_moeda: any)
    {
       let api_url = await fetch('https://mercatox.com/api/public/v1/orderbook?market_pair=' + par_moeda),
           json = await api_url.json()

       return json
    }

    async ob_gate(par_moeda: any)
    {
       let api_url = await fetch('https://api.gateio.ws/api/v4/spot/order_book?currency_pair=' + par_moeda),
           json = await api_url.json()

       return json
    }

    async ob_ftx(par_moeda: any)
    {
       let api_url = await fetch('https://ftx.com/api/markets/' + par_moeda + '/orderbook?depth=1' ),
           json = await api_url.json()

       return json
    }

    async ob_kraken(par_moeda: any)
    {
       let api_url = await fetch('https://api.kraken.com/0/public/Depth?pair=' + par_moeda),
           json = await api_url.json()

       return json.result
    }

    async values_fmfw()
    {
       let api_url = await fetch('https://api.fmfw.io/api/3/public/symbol'),
           json = await api_url.json(),
           values = Object.values(json)

       return values
    }

    async tickers_fmfw()
    {
       let api_url = await fetch('https://api.fmfw.io/api/3/public/ticker'),
           json = await api_url.json(),
           pares = [],
           
           k = Object.keys(json),
           v: any = Object.values(json)

           for(let i in k)
           {
               pares.push({ s: k[i], b: v[i].bid, a: v[i].ask }) 
           }

       return pares
    }

    async tickers_gate()
    {
       let api_url = await fetch('https://api.gateio.ws/api/v4/spot/tickers'),
           json = await api_url.json()
           
       return json
    }

   async moedas_gate()
   {
      let api_url = await fetch('https://api.gateio.ws/api/v4/spot/currency_pairs'),
          json = await api_url.json(),
          listaUsdt = [],
          listaBtcUsdt = []


      for(let i in json)
      {
          if(json[i].quote == 'USDT')
             listaUsdt.push(json[i].base)     
      }

      for(let i in listaUsdt)
      {
          for(let j in json)
          {
               if(listaUsdt[i] == json[j].base && json[j].quote == 'BTC')
                  listaBtcUsdt.push({ pU: listaUsdt[i] + '_USDT', pB: listaUsdt[i] + '_BTC' })
          }
      }

      return listaBtcUsdt
   }

   async moedas_bittrex()
   {
       let api_url = await fetch('https://api.bittrex.com/v3/markets')  ,
          json = await api_url.json(),
          listaBtcUsdt = [],
          listaUsdt = []

       for(let i in json)
       {
           if(json[i].quoteCurrencySymbol == 'USDT')
               listaUsdt.push(json[i].baseCurrencySymbol)     
       }  

       for(let i in listaUsdt)
      {
          for(let j in json)
          {
               if(listaUsdt[i] == json[j].baseCurrencySymbol && json[j].quoteCurrencySymbol == 'BTC')
                  listaBtcUsdt.push({ pU: listaUsdt[i] + '-USDT', pB: listaUsdt[i] + '-BTC' })
          }
      }


    //    for(let i in listaBtcUsdt)
    //        console.log('listaBtcUsdt: ' + listaBtcUsdt[i].pU + ' -> ' + listaBtcUsdt[i].pB)

       return listaBtcUsdt
   }

   async tickers_bittrex()
   {
      let api_url = await fetch('https://api.bittrex.com/v3/markets/tickers'),
          json = await api_url.json()
           
      return json
   }

   async dados_kucoin()
   {
      let api_url = await fetch('https://api.kucoin.com/api/v1/currencies'),
          json = await api_url.json(),
          data = json.data,
          symbols = []

      for(let i in data)
      {
         if(data[i].isWithdrawEnabled && data[i].isDepositEnabled)
            symbols.push(data[i].currency)
      }    

      return symbols
   }

   async dados_ftx()
   {
      let symbols = await fetch('https://ftx.com/api/markets'),
          json = await symbols.json(),
          dados = json.result

      return dados    
   }

   async ob_kucoin(par_moeda: any)
   {
      let api_url = await fetch('https://api.kucoin.com/api/v1/market/orderbook/level2_20?symbol=' + par_moeda),
          json = await api_url.json()

      return json.data
   }
   
   async ob_binance(par_moeda: any)
   {
      let api_url = await fetch('https://api.binance.com/api/v3/depth?symbol=' + par_moeda + '&limit=5'),
          json = await api_url.json()

      return json
   }

   async tickers_binance()
   {
      let url_tck = await fetch('https://api.binance.com/api/v3/ticker/bookTicker'),
          tickers = await url_tck.json(),
          t = tickers,

          info = await fetch('https://api.binance.com/api/v3/exchangeInfo'),
          infoJson = await info.json(),
          s = infoJson.symbols,
          paresBtc = [],
          paresUsdt = [],
          paresBtcUsdt = [],
          listaFinal = [],
          listaBtcUsdt = [],
          listaUsdt = []         

          for(let i in s)
          {
              if(s[i].status == 'TRADING' && s[i].quoteAsset ==  'USDT')
                 listaUsdt.push(s[i].baseAsset)
          }
          
          for(let i in s)
          {
              for(let j in listaUsdt)
              {
                  if(s[i].baseAsset == listaUsdt[j] && s[i].quoteAsset == 'BTC')
                  {
                      listaBtcUsdt.push(listaUsdt[j])
                  }
              }  
          }

          for(let i in listaBtcUsdt)
          {
              paresBtc.push(listaBtcUsdt[i] + 'BTC') 
              paresUsdt.push(listaBtcUsdt[i] + 'USDT') 
          }

          for(let i = 0; i < paresBtc.length; i++)
          {
              for(let j = 0; j < paresUsdt.length; j++)
              {
                 if(i == j)
                    paresBtcUsdt.push({ par_btc: paresBtc[i], par_usdt: paresUsdt[j] })
              }  
          }

          let p = paresBtcUsdt

          for(let i in p)
          {
              for(let j in t)
              {
                  if(p[i].par_btc == t[j].symbol)
                  {
                      for(let k in t)
                      {
                         if(p[i].par_usdt == t[k].symbol)
                         {
                              listaFinal.push(
                              {
                                  par_btc: p[i].par_btc, a_btc: t[j].askPrice, b_btc:  t[j].bidPrice, v_btcB: t[j].askQty, v_btcA: t[j].bidQty,
                                  par_usdt: p[i].par_usdt, a_usdt: t[k].askPrice, b_usdt:  t[k].bidPrice, v_usdtA:  t[k].askQty, 
                                  v_usdtB: t[k].bidQty
                              }) 
                         }
                      } 
                  }
              }
          }

        //  let lf = listaFinal
        //  for(let i in lf)
        //    console.log(lf[i].par_btc + ' aB: ' + lf[i].a_btc + ' bB: ' + lf[i].b_btc + ' vA: ' + lf[i].v_btcA +
        //    ' vB: ' + lf[i].v_btcB + ' -> ' + lf[i].par_usdt + ' aU: ' + lf[i].a_usdt + ' bU: ' + lf[i].b_usdt + 
        //    ' vUa: ' + lf[i].v_usdtA + ' vUb: ' + lf[i].v_usdtB)

      return listaFinal
   }

   async ob_poloniex(par_moeda: any)
   {
      let api_url = await fetch('https://poloniex.com/public?command=returnOrderBook&currencyPair=' + par_moeda +'&depth=1'),
          json = await api_url.json()

      return json
   }


   async tickers_poloniex()
   {
       let api_url = await fetch('https://poloniex.com/public?command=returnTicker'),
           json = await api_url.json(),

           m_url = await fetch('https://poloniex.com/public?command=returnCurrencies'),
           mjson = await m_url.json(),
           moBtc = [], // MOEDAS EM BTC MONTADO
           moUsdt = [], // MOEDAS EM USDT MONTADO
           lb = [], // LISTA BTC
           lu = [], // LISTA BTC / USDT
           lbu = [], // LISTA BTC / USDT
           t = [], // TICKERS
           lf = [], // LISTA FINAL
           

           keys = Object.keys(mjson), // MOEDAS

           k = Object.keys(json), // TICKERS
           v: any = Object.values(json)

           // MONTA ARRAY COM AS PEDRAS
           for(let i in k)
              t.push({ s: k[i], a: v[i].lowestAsk, b: v[i].highestBid })

           // ACRESTA O MERCADO DE BTC EM TODAS AS MOEDAS
           for(let i in keys)
              moBtc.push({ moeda: keys[i], par_btc: 'BTC_' + keys[i] })
           
           // ACRESTA O MERCADO DE USDT EM TODAS AS MOEDAS
           for(let i in keys)
              moUsdt.push({ moeda: keys[i], par_usdt: 'USDT_' + keys[i] })
           
           // LISTA BTC   
           for(let i in moBtc)
           {
               for(let j in k)
               {
                   if(moBtc[i].par_btc == k[j])
                      lb.push({ moeda: moBtc[i].moeda, merc: 'BTC' })
               }     
           }     

            // LISTA USDT  
            for(let i in moUsdt)
            {
                for(let j in k)
                {
                    if(moUsdt[i].par_usdt == k[j])
                        lu.push({ moeda: moUsdt[i].moeda, merc: 'USDT' })
                }     
            } 

           // LISTA DE COMUNS BTC / USDT 
           for(let i in lu)
           {
               for(let j in lb)
               {
                   if(lu[i].moeda == lb[j].moeda)
                       lbu.push({ par_btc: 'BTC_' + lu[i].moeda, par_usdt: 'USDT_' + lu[i].moeda })
               } 
           }

           for(let i in lbu)
           {
               for(let j in t)
               {
                   if(lbu[i].par_btc == t[j].s)
                   {
                       for(let k in t)
                       {
                           if(lbu[i].par_usdt == t[k].s)
                           {
                               lf.push(
                               { 
                                   par_btc: lbu[i].par_btc, a_btc: t[j].a, b_btc: t[j].b, 
                                   par_usdt: lbu[i].par_usdt, a_usdt: t[k].a, b_usdt: t[k].b
                               })
                           }
                       } 
                   } 
               } 
           }

        //    for(let i in lf)
        //        console.log(lf[i].par_btc + ' a: ' + lf[i].a_btc + ' b: ' + lf[i].b_btc + ' -> ' +
        //        lf[i].par_usdt + ' a_usdt: ' + lf[i].a_usdt + ' b_usdt: ' + lf[i].b_usdt) 

        //    for(let i in t)   
        //       console.log(t[i].s + ' a: ' + t[i].a + ' b: ' + t[i].b) 

        //    for(let i in lb)
        //         console.log('Moedas em BTC: ' + lb[i].moeda + ' Mercado: ' + lb[i].merc)

           
        //    for(let i in lu)
        //        console.log('Pares USDT da POL: ' + lu[i].moeda + ' Mercado: ' + lu[i].merc)
          
        //    for(let i in lbu)
        //        console.log('Pares BTC / USDT da POL: ' + lbu[i].par_btc + ' -> ' + lbu[i].par_usdt)
               
       return lf
   }

   async tickers_bitmart()
   {
       let t_url = await fetch('https://api-cloud.bitmart.com/spot/v1/ticker'),
           json = await t_url.json(),
           t = json.data.tickers, // TICKERS
           btcUsdtPdVd = 0, // PDVD / PDCP
           btcUsdtPdCp = 0, // PDVD / PDCP

           m_url = await fetch('https://api-cloud.bitmart.com/spot/v1/currencies'),
           mjson = await m_url.json(),
           m = mjson.data.currencies, // MOEDAS

           lb = [], // LISTA BTC
           lu = [], // LISTA  USDT
           lbu = [], // LISTA BTC / USDT
           moBtc = [], // ACRESCENTA MERCADO DE BTC EM TODAS AS MOEDAS
           moUsdt = [], // ACRESCENTA MERCADO DE USDT EM TODAS AS MOEDAS
           lf = [] // LISTA FINAL
           
           for(let i in t)
           {
               if(t[i].symbol == 'BTC_USDT')
               {
                   btcUsdtPdVd = t[i].best_ask
                   btcUsdtPdCp =  t[i].best_bid
               } 
           }
                   
           // ACRESTA O MERCADO DE BTC EM TODAS AS MOEDAS
           for(let i in m)
              moBtc.push({ moeda: m[i].id, par_btc: m[i].id + '_BTC' })
           
            // ACRESCENTA O MERCADO DE USDT EM TODAS AS MOEDAS
           for(let i in m)
              moUsdt.push({ moeda: m[i].id, par_usdt: m[i].id + '_USDT' })
              
           // LISTA BTC   
           for(let i in moBtc)
           {
               for(let j in t)
               {
                   if(moBtc[i].par_btc == t[j].symbol)
                      lb.push({ moeda: moBtc[i].moeda, merc: 'BTC' })
               }     
           }  
           
            // LISTA USDT  
            for(let i in moUsdt)
            {
                for(let j in t)
                {
                    if(moUsdt[i].par_usdt == t[j].symbol)
                        lu.push({ moeda: moUsdt[i].moeda, merc: 'USDT' })
                }     
            } 

           // LISTA DE COMUNS BTC / USDT 
           for(let i in lu)
           {
               for(let j in lb)
               {
                   if(lu[i].moeda == lb[j].moeda)
                       lbu.push({ par_btc: lu[i].moeda + '_BTC', par_usdt: lu[i].moeda + '_USDT' })
               } 
           }

           for(let i in lbu)
           {
               for(let j in t)
               {
                   if(lbu[i].par_btc == t[j].symbol)
                   {
                       for(let k in t)
                       {
                           if(lbu[i].par_usdt == t[k].symbol)
                           {
                               lf.push(
                               { 
                                   par_btc: lbu[i].par_btc, a_btc: t[j].best_ask, v_btcA: t[j].best_ask_size,
                                            b_btc: t[j].best_bid, v_btcB: t[j].best_bid_size,
                                   par_usdt: lbu[i].par_usdt, a_usdt: t[k].best_ask, v_usdtA: t[k].best_ask_size,
                                            b_usdt: t[k].best_bid, v_usdtB: t[k].best_bid_size, 
                                            btcUsdtPdCp: btcUsdtPdCp, btcUsdtPdVd: btcUsdtPdCp
                               })
                           }
                       } 
                   } 
               } 
           }

        //    for(let i in lf)
        //        console.log(lf[i].par_btc + ' a: ' + lf[i].a_btc + ' b: ' + lf[i].b_btc + ' -> ' +
        //        lf[i].par_usdt + ' a_usdt: ' + lf[i].a_usdt + ' b_usdt: ' + lf[i].b_usdt) 

        //    for(let i in t)   
        //       console.log(t[i].s + ' a: ' + t[i].a + ' b: ' + t[i].b) 

        //    for(let i in lb)
        //         console.log('Moedas em BTC: ' + lb[i].moeda + ' Mercado: ' + lb[i].merc)

           
        //    for(let i in lu)
        //        console.log('Pares USDT da POL: ' + lu[i].moeda + ' Mercado: ' + lu[i].merc)

        // for(let i in lbu)
        //     console.log('Pares BTC / USDT da BitMarte: ' + lbu[i].par_btc + ' -> ' + lbu[i].par_usdt)

          
               
       return lf
   }


    // async api_crex24(par_moeda: any)
    // {
    //     let api_url = `${ this.API_CREX24 }${ par_moeda }&limit=1`,
    //         fetch_url = await fetch(api_url),
    //         orderbook = await fetch_url.json()

    //         return orderbook
    // }
}