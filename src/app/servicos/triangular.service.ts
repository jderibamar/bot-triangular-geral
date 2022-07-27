import { Injectable } from '@angular/core'
import { ExchangesService } from './exchanges.service'
import { Funcoes } from './funcoes.service'

const base_ob_mercatox = 'https://mercatox.com/api/public/v1/orderbook?market_pair='

@Injectable()
export class TriangularServico
{
    constructor(private excS: ExchangesService, private funcS: Funcoes){}

    async stex()
    {
       let listaUsdt = [],
           moBase = [],
           moUsdt = '',
           moBtc = '',
           jEmBtc = [], // JANELAS COM USO DA FUNÇÃO
           jEmUsdt = [],
           janelas  = []

       let btcUsdtOb = await this.excS.ob_stex(406),
           btcUsdtPdCp = btcUsdtOb.data.bid[0].price,
           btcUsdtPdVd = btcUsdtOb.data.ask[0].price

       let moedasStex = await fetch('https://api3.stex.com/public/currency_pairs/list/ALL'),
           res = await moedasStex.json(),
           dados = res.data

        // LISTA USDT   
        for(let i = 0; i < dados.length; i++)
        {
            if(dados[i].market_code == 'USDT')
               listaUsdt.push({id: dados[i].id , moeda: dados[i].currency_code })
        }
       
        // LISTA BTC
        for(let i = 0; i < listaUsdt.length; i++)
        {
            for(let j = 0; j < dados.length; j++)
            {
                if(listaUsdt[i].moeda == dados[j].currency_code && dados[j].market_code == 'BTC') //  && dados[i].active
                    moBase.push({ id_usdt: listaUsdt[i].id, id_btc: dados[j].id, moeda: dados[j].currency_code })
            }
        }

        for(let i = 0; i < moBase.length; i++)
        {
            moBtc = moBase[i].moeda + 'BTC'
            moUsdt = moBase[i].moeda + 'USDT'

           let ob_btc = await this.excS.ob_stex(moBase[i].id_btc),
               askBtc =  ob_btc.data.ask,
               bidBtc =  ob_btc.data.bid

           let ob_usdt = await this.excS.ob_stex(moBase[i].id_usdt),
               askUstd =  ob_usdt.data.ask,
               bidUsdt =  ob_usdt.data.bid,

               pdCpMoBtc = bidBtc[0].price,
               volPdCpMoBtc = bidBtc[0].amount,
               pdVdMoBtc = askBtc[0].price,
               volPdVdMoBtc = askBtc[0].amount,

               pdCpMoUsdt = bidUsdt[0].price,
               volpdCpMoUsdt = bidUsdt[0].amount,
               pdVdMoUsdt = askUstd[0].price,
               volPdVdMoUsdt = askUstd[0].amount

               //LUCRO COMPRANDO EM USDT 
               jEmUsdt = this.funcS.arbitCpEmUsdt(moUsdt, pdVdMoUsdt, volPdVdMoUsdt, pdCpMoBtc, volPdCpMoBtc, btcUsdtPdCp)
                    
               if(jEmUsdt.length > 0)
                  console.log(jEmUsdt[0].symbol + ' pdVd: ' + jEmUsdt[0].pdVd + ' lucro: ' + jEmUsdt[0].lucro)

               if(jEmUsdt.length > 0)
               {
                    janelas.push(
                    {
                        symbol: jEmUsdt[0].symbol, exc: 'STEX', pdVd: jEmUsdt[0].pdVd, volPdVd: jEmUsdt[0].volPdVd,
                        pdCp: jEmUsdt[0].pdCp, volPdCp: jEmUsdt[0].volPdCp, lucro: jEmUsdt[0].lucro
                    }) 
               }
                   
                //LUCRO COMPRANDO EM BTC
               jEmBtc = this.funcS.arbitCpEmBtc(moBtc, pdVdMoBtc, volPdVdMoBtc, pdCpMoUsdt, volpdCpMoUsdt, btcUsdtPdVd)
                
                if(jEmBtc.length > 0)
                {
                    janelas.push(
                    {
                        symbol: jEmBtc[0].symbol, exc: 'STEX', pdVd: jEmBtc[0].pdVd, volPdVd: jEmBtc[0].volPdVd,
                        pdCp: jEmBtc[0].pdCp, volPdCp: jEmBtc[0].volPdCp, lucro: jEmBtc[0].lucro
                    }) 
                }
        }

        if(janelas.length > 0)
           console.log('janelas STEX: ' + janelas)



         return janelas
    }

    async fmFwUsdtBtc()
    {
        let listaUsdt = [],
            moBase = [],
            jEmBtc = [], // JANELAS COM USO DA FUNÇÃO
            jEmUsdt = [], // JANELAS COM USO DA FUNÇÃO
            janelas  = [],
            symbols  = [],
            pb  = [], // PARES BTC
            pu  = [], // PARES USDT
            ba  = [], // bids e asks
            values: any = await this.excS.values_fmfw(),

            volPdCpMoBtc = null,
            volPdVdMoBtc = null,

            volPdCpMoUsdt = null,
            volPdVdMoUsdt = null, 

            btcUsdtOb = await this.excS.ob_fmfw('BTCUSDT'),
            tickers = await this.excS.tickers_fmfw()

            //LISTA USDT
            for(let i = 0; i < values.length; i++)
            {
                {
                   if(values[i].quote_currency  === 'USDT')
                      listaUsdt.push(values[i].base_currency)
                }
            }

            //LISTA BTC
            for(let i = 0; i < listaUsdt.length; i++)
            {
                for(let j = 0; j < values.length; j++)
                {
                    if(listaUsdt[i] === values[j].base_currency && values[j].quote_currency === 'BTC')
                    {                        
                        moBase.push(listaUsdt[i])
                        symbols.push({ pU: listaUsdt[i] + 'USDT',  pB: listaUsdt[i] + 'BTC'})
                    }
                }
            }

            for(let i in symbols)
            {
                for(let j in tickers)
                {
                    if(symbols[i].pU == tickers[j].s)
                       pu.push({ par_usdt: symbols[i].pU, b_usdt: tickers[j].b, a_usdt: tickers[j].a })
                }
            }
            
            for(let i in symbols)
            {
                for(let j in tickers)
                {
                    if(symbols[i].pB == tickers[j].s)
                       pb.push({ par_btc: symbols[i].pB, b_btc: tickers[j].b, a_btc: tickers[j].a })      
                }
            }

            for(let i = 0; i < pb.length; i++)
            {
                for(let j = 0; j < pu.length; j++)
                {
                    if(i == j)
                        ba.push(
                        { 
                            par_usdt: pu[j].par_usdt, a_usdt: pu[j].a_usdt, b_usdt: pu[j].b_usdt,
                            par_btc: pb[i].par_btc, a_btc: pb[i].a_btc, b_btc: pb[i].b_btc
                        })
                    
                }
            }

            // //BUSCA AS janelasMexc CASO EXISTA
            for(let i = 0; i < ba.length; i++)
            {
               let  btcUsdtPdCp =  btcUsdtOb.bid[0][0],
                    btcUsdtPdVd = btcUsdtOb.ask[0][0],
                    
                    pdCpMoBtc = ba[i].b_btc,
                    pdVdMoBtc = ba[i].a_btc,
                    pdCpMoUsdt = ba[i].b_usdt,
                    pdVdMoUsdt = ba[i].a_usdt

               //LUCRO COMPRANDO EM USDT 
               jEmUsdt = this.funcS.arbitCpEmUsdt(ba[i].par_usdt, pdVdMoUsdt, volPdVdMoUsdt, pdCpMoBtc, volPdCpMoBtc, btcUsdtPdCp)

               if(jEmUsdt.length > 0)
               {
                   janelas.push(
                   {
                      symbol: jEmUsdt[0].symbol, exc: 'FMFW', pdVd: jEmUsdt[0].pdVd, volPdVd: jEmUsdt[0].volPdVd,
                      pdCp: jEmUsdt[0].pdCp, volPdCp: jEmUsdt[0].volPdCp, cpEm: 'USDT', vdEm: 'BTC', lucro: jEmUsdt[0].lucro
                   }) 
               }
                   
               //LUCRO COMPRANDO EM BTC
                jEmBtc = this.funcS.arbitCpEmBtc(ba[i].par_btc, pdVdMoBtc, volPdVdMoBtc, pdCpMoUsdt, volPdCpMoUsdt, btcUsdtPdVd)
                
                if(jEmBtc.length > 0)
                {
                    janelas.push(
                    {
                        symbol: jEmBtc[0].symbol, exc: 'FMFW', pdVd: jEmBtc[0].pdVd, volPdVd: jEmBtc[0].volPdVd,
                        pdCp: jEmBtc[0].pdCp, volPdCp: jEmBtc[0].volPdCp,  cpEm: 'BTC', vdEm: 'USDT', lucro: jEmBtc[0].lucro
                    }) 
               }

            }

            if(janelas.length > 0)
            {
                for(let i in janelas)
                    console.log('Janelas FMFW: ' + janelas[i].symbol + ' pdVd: ' + janelas[i].pdVd + 
                    ' pdCp: ' + janelas[i].pdCp + ' lucro: ' + janelas[i].lucro)
            }
            
         return janelas   
    }

    async bittrexUsdtBtc()
    {
       let jEmBtc = [], // JANELAS COM USO DA FUNÇÃO
           janelas  = [],
           pb  = [], // PARES BTC
           pu  = [], // PARES USDT
           ba  = [], // bids e asks

           volPdCpMoBtc = null,
           volPdVdMoBtc = null,

           volPdCpMoUsdt = null,
           volPdVdMoUsdt = null,
            
           btcUsdtOb = await this.excS.ob_bittrex('BTC-USDT'),
           listaBtcUsdt = await this.excS.moedas_bittrex(),
           tickers = await this.excS.tickers_bittrex()


            for(let i in listaBtcUsdt)
            {
                for(let j in tickers)
                {
                    if(listaBtcUsdt[i].pU == tickers[j].symbol)
                       pu.push({ par_usdt: listaBtcUsdt[i].pU, b_usdt: tickers[j].bidRate, a_usdt: tickers[j].askRate })

                    if(listaBtcUsdt[i].pB == tickers[j].symbol)
                       pb.push({ par_btc: listaBtcUsdt[i].pB, b_btc: tickers[j].bidRate, a_btc: tickers[j].askRate })   
                }
            }
            
            // for(let i in symbols)
            // {
            //     for(let j in tickers)
            //     {
            //         if(symbols[i].pB == tickers[j].s)
            //            pb.push({ par_btc: symbols[i].pB, b_btc: tickers[j].b, a_btc: tickers[j].a })      
            //     }
            // }

            for(let i = 0; i < pb.length; i++)
            {
                for(let j = 0; j < pu.length; j++)
                {
                    if(i == j)
                        ba.push(
                        { 
                            par_usdt: pu[j].par_usdt, a_usdt: pu[j].a_usdt, b_usdt: pu[j].b_usdt,
                            par_btc: pb[i].par_btc, a_btc: pb[i].a_btc, b_btc: pb[i].b_btc
                        })
                    
                }
            }
            
            // for(let i in ba)
            //     console.log(ba[i].par_usdt + ' ask: ' + ba[i].a_usdt + ' bid: ' +ba[i].b_usdt  + ' -> ' +
            //     ba[i].par_btc + ' a: ' +ba[i].a_btc + ' b: ' + ba[i].b_btc)

            // //BUSCA AS janelasMexc CASO EXISTA
            for(let i = 0; i < ba.length; i++)
            {
               let  btcUsdtPdCp =  btcUsdtOb.bid[0].rate,
                    btcUsdtPdVd = btcUsdtOb.ask[0].rate,
                    
                    pdCpMoBtc = ba[i].b_btc,
                    pdVdMoBtc = ba[i].a_btc,
                    pdCpMoUsdt = ba[i].b_usdt,
                    pdVdMoUsdt = ba[i].a_usdt,

               //LUCRO COMPRANDO EM USDT 
               jEmUsdt = this.funcS.arbitCpEmUsdt(ba[i].par_usdt, pdVdMoUsdt, volPdVdMoUsdt, pdCpMoBtc, volPdCpMoBtc, btcUsdtPdCp)

               if(jEmUsdt.length > 0)
               {
                   janelas.push(
                   {
                      symbol: jEmUsdt[0].symbol, exc: 'Bittrex', pdVd: jEmUsdt[0].pdVd, volPdVd: jEmUsdt[0].volPdVd,
                      pdCp: jEmUsdt[0].pdCp, volPdCp: jEmUsdt[0].volPdCp, cpEm: 'USDT', vdEm: 'BTC', lucro: jEmUsdt[0].lucro
                   }) 
               }
                   
               //LUCRO COMPRANDO EM BTC
                jEmBtc = this.funcS.arbitCpEmBtc(ba[i].par_btc, pdVdMoBtc, volPdVdMoBtc, pdCpMoUsdt, volPdCpMoUsdt, btcUsdtPdVd)
                
                if(jEmBtc.length > 0)
                {
                    janelas.push(
                    {
                        symbol: jEmBtc[0].symbol, exc: 'Bittrex', pdVd: jEmBtc[0].pdVd, volPdVd: jEmBtc[0].volPdVd,
                        pdCp: jEmBtc[0].pdCp, volPdCp: jEmBtc[0].volPdCp,  cpEm: 'BTC', vdEm: 'USDT', lucro: jEmBtc[0].lucro
                    }) 
               }
               
            //    if(pdVdMoBtc < pdCpMoUsdt && pdVdMoBtc > 0)
            //    {
            //        let custoBtcUsdt = pdVdMoBtc * btcUsdtPdVd
            //        let lucro = (pdCpMoUsdt - custoBtcUsdt) / custoBtcUsdt * 100

            //        if(lucro > 0)
            //           console.log(ba[i].par_btc + ' a: ' + custoBtcUsdt + ' b: ' +  pdCpMoUsdt + ' lucro: '+ lucro)
            //    }
               
            //    if(pdVdMoUsdt < pdCpMoBtc && pdVdMoUsdt > 0)
            //    {
            //        let apuradoBtcUsdt = pdCpMoBtc * btcUsdtPdCp
            //        let lucro = (apuradoBtcUsdt - pdVdMoUsdt) / pdVdMoUsdt * 100

            //        if(lucro > 0)
            //            console.log(ba[i].par_usdt + 'a: ' + pdVdMoUsdt + ' b: ' +  apuradoBtcUsdt + ' lucro: '+ lucro)
            //    }

            }

            if(janelas.length > 0)
            {
                for(let i in janelas)
                    console.log('Janelas Bittrex: ' + janelas[i].symbol + ' pdVd: ' + janelas[i].pdVd + 
                    ' pdCp: ' + janelas[i].pdCp + ' lucro: ' + janelas[i].lucro)
            }

         return janelas   
    }

    async mercatoxUsdtBtc()
    {
        let cpEmUsdt = 465, // ARMAZENAR MOEDAS LISTADAS EM USDT
            vdEmBtc = 4, // ARMAZENAR MOEDAS LISTADAS EM BTC
            listaUsdt = [],
            symbols = [],
            values = [],
            paresBtcUsdt = [],
            obBtc = null,
            janelas  = [],
            moUsdt = '',
            moBtc = '',
            jEmBtc = [], // JANELAS COM USO DA FUNÇÃO
            jEmUsdt = [],
          
            pdVdMoBtc = 0,
            volPdVdMoBtc =0,
            pdCpMoBtc = 0,
            volPdCpMoBtc = 0,

            pdCpMoUsdt = 0,
            volPdCpMoUsdt = 0,
            pdVdMoUsdt = 0,
            volPdVdMoUsdt = 0

        let pares = await fetch('https://mercatox.com/api/public/v1/ticker'),
            jsonPares = await pares.json(),
            
            reqbtcUsdt = await fetch(`${ base_ob_mercatox }BTC_USDT`),
            btcUsdtOrderbook = await reqbtcUsdt.json()

            let btcUsdtPdCp = btcUsdtOrderbook.bids[0][0],
                btcUsdtPdCpVol = btcUsdtOrderbook.bids[0][1],
                btcUsdtPdVd = btcUsdtOrderbook.asks[0][0],
                btcUsdtPdVdVol = btcUsdtOrderbook.asks[0][1]
                
            // console.log('btcUsdtOrderbook ask: ' + btcUsdtJson.asks[0][0])
            // console.log('btcUsdtOrderbook bid: ' + btcUsdtJson.bids[0][0])

            symbols = Object.keys(jsonPares)
            values = Object.values(jsonPares)
        
            //LISTA USDT 
            for(let i = 0; i < symbols.length; i++)
            {
                if(values[i].quote_id == cpEmUsdt)
                    listaUsdt.push({ symbol: symbols[i], base_id:  values[i].base_id, quote_id: values[i].quote_id })
            }

            //EXCLUI O SYMBOL BTC_USDT
            for(let i = 0; i < listaUsdt.length; i++)
            {
                if(listaUsdt[i].symbol === 'BTC_USDT')
                   listaUsdt.splice(i, 1)   
            }

            //LISTA BTC / USDT
            for(let i = 0; i < listaUsdt.length; i++)
            {                
                for(let j = 0; j < values.length; j++)
                {
                    if(listaUsdt[i].base_id == values[j].base_id && values[j].quote_id == vdEmBtc) 
                    {                        
                        listaUsdt[i].symbol = listaUsdt[i].symbol
                        paresBtcUsdt.push({ parBtc: listaUsdt[i].symbol, parUsdt:  listaUsdt[i].symbol })
                    }
                }
            }

            for(let i = 0; i < paresBtcUsdt.length; i++)
                paresBtcUsdt[i].parBtc = paresBtcUsdt[i].parBtc.replace('USDT', 'BTC')
                

            for(let i = 0; i < paresBtcUsdt.length; i++)
            {
                // LAÇO PARA ATRASAR AS REQUISIÇÕES À API
                // for(let i = 0; i < 2000000000; i ++)
                // {
                //     let a = 1
                // }

                let reqBtc = await fetch(`${ base_ob_mercatox }${ paresBtcUsdt[i].parBtc }`)
                    obBtc = await reqBtc.json()
                
                // LAÇO PARA ATRASAR AS REQUISIÇÕES À API
                // for(let i = 0; i < 2000000000; i ++)
                // {
                //     let a = 1
                // }

                let reqUsdt = await fetch(`${ base_ob_mercatox }${ paresBtcUsdt[i].parUsdt }`),
                    obUsdt = await reqUsdt.json(),    

                    bidsCpEmBtc = obBtc.bids,
                    bidsCpEmUsdt = obUsdt.bids,
                    asksCpEmBtc = obBtc.asks,
                    asksCpEmUsdt = obUsdt.asks

                if(bidsCpEmBtc != null)
                {
                    pdCpMoBtc = obBtc.bids[0][0]
                    volPdCpMoBtc = obBtc.bids[0][1]
                }    
                
                if(bidsCpEmBtc == null)
                {
                    pdCpMoBtc = 0
                    volPdCpMoBtc = 0
                }    

                if(asksCpEmBtc != null)
                {
                    pdVdMoBtc = obBtc.asks[0][0]
                    volPdVdMoBtc = obBtc.asks[0][1]
                }
                
                if(asksCpEmBtc == null)
                {
                    pdVdMoBtc = 0
                    volPdVdMoBtc = 0
                }

                if(bidsCpEmUsdt != null)
                {
                    pdCpMoUsdt = obUsdt.bids[0][0]
                    volPdCpMoUsdt = obUsdt.bids[0][1]
                }
              
                if(bidsCpEmUsdt == null)
                {
                    pdCpMoUsdt = 0
                    volPdCpMoUsdt = 0
                }

                if(asksCpEmUsdt != null)
                {
                    pdVdMoUsdt = obUsdt.asks[0][0]
                    volPdVdMoUsdt = obUsdt.asks[0][1]
                }
                    
                if(asksCpEmUsdt == null)
                {
                    pdVdMoUsdt = 0
                    volPdVdMoUsdt = 0
                }

               //LUCRO COMPRANDO EM USDT 
               jEmUsdt = this.funcS.arbitCpEmUsdt(moUsdt, pdVdMoUsdt, volPdVdMoUsdt, pdCpMoBtc, volPdCpMoBtc, btcUsdtPdCp)
                    
            //    if(jEmUsdt.length > 0)
            //       console.log(jEmUsdt[0].symbol + ' pdVd: ' + jEmUsdt[0].pdVd + ' lucro: ' + jEmUsdt[0].lucro)

               if(jEmUsdt.length > 0)
               {
                    janelas.push(
                    {
                        symbol: jEmUsdt[0].symbol, exc: 'MERCATOX', pdVd: jEmUsdt[0].pdVd, volPdVd: jEmUsdt[0].volPdVd,
                        pdCp: jEmUsdt[0].pdCp, volPdCp: jEmUsdt[0].volPdCp, lucro: jEmUsdt[0].lucro
                    }) 
               }
                   
               //LUCRO COMPRANDO EM BTC
               jEmBtc = this.funcS.arbitCpEmBtc(moBtc, pdVdMoBtc, volPdVdMoBtc, pdCpMoUsdt, volPdCpMoUsdt, btcUsdtPdVd)
                
                if(jEmBtc.length > 0)
                {
                    janelas.push(
                    {
                        symbol: jEmBtc[0].symbol, exc: 'MERCATOX', pdVd: jEmBtc[0].pdVd, volPdVd: jEmBtc[0].volPdVd,
                        pdCp: jEmBtc[0].pdCp, volPdCp: jEmBtc[0].volPdCp, lucro: jEmBtc[0].lucro
                    }) 
               }

               this.funcS.testeEmBTC(moBtc, pdVdMoBtc, pdCpMoUsdt, btcUsdtPdVd)
               this.funcS.testeEmUsdt(moUsdt, pdVdMoUsdt, pdCpMoBtc, btcUsdtPdCp)


                // console.log('Janelas: ' + this.janelasMercatox)
                // console.log('Custo comprando em BTC: ' + btcUsdtPdCp)
                // console.log('PDVD: ' + paresBtcUsdt[i].parBtc + ' ' +  pdVdMoBtc)
                // console.log('moedaCustoBtcUsdt: ' + paresBtcUsdt[i].parBtc + ' ' +  moedaCustoBtcUsdt)
                // console.log('PDCP: ' + paresBtcUsdt[i].parUsdt + ' ' +  pdCpMoUsdt)
                // console.log(paresBtcUsdt[i].parBtc + ' -> lucro Comprando em BTC na Mercatox: ' + lucroCpEmBtc)
                // console.log(paresBtcUsdt[i].parUsdt + ' -> lucro Comprando em USDT na Mercatox: ' + lucroCpEmUsdt)

                // ARRAY PARA SER RENDERIZADO NO COMPONENTE HTML
            }

           if(janelas.length > 0) 
              console.log('janelas Mercatox: ' + janelas) 
           
         return janelas
    }

    async gateUsdtBtc()
    {
        let jEmBtc = [], // JANELAS COM USO DA FUNÇÃO
            jEmUsdt = [], // JANELAS COM USO DA FUNÇÃO
            janelas  = [],
            pb  = [], // PARES BTC
            pu  = [], // PARES USDT
            ba  = [], // bids e asks

            volPdCpMoBtc = null,
            volPdVdMoBtc = null,

            volPdCpMoUsdt = null,
            volPdVdMoUsdt = null, 

            btcUsdtOb = await this.excS.ob_gate('BTC_USDT'),
            tickers = await this.excS.tickers_gate(),
            listaBtcUsdt = await this.excS.moedas_gate()


            for(let i in listaBtcUsdt)
            {
                for(let j in tickers)
                {
                    if(listaBtcUsdt[i].pU == tickers[j].currency_pair)
                       pu.push({ par_usdt: listaBtcUsdt[i].pU, b_usdt: tickers[j].highest_bid, a_usdt: tickers[j].lowest_ask })

                    if(listaBtcUsdt[i].pB == tickers[j].currency_pair)
                       pb.push({ par_btc: listaBtcUsdt[i].pB, b_btc: tickers[j].highest_bid, a_btc: tickers[j].lowest_ask })   
                }
            }
            
            for(let i = 0; i < pb.length; i++)
            {
                for(let j = 0; j < pu.length; j++)
                {
                    if(i == j)
                        ba.push(
                        { 
                            par_usdt: pu[j].par_usdt, a_usdt: pu[j].a_usdt, b_usdt: pu[j].b_usdt,
                            par_btc: pb[i].par_btc, a_btc: pb[i].a_btc, b_btc: pb[i].b_btc
                        })
                    
                }
            }
           
            // //BUSCA AS janelasMexc CASO EXISTA
            for(let i = 0; i < ba.length; i++)
            {
               let  btcUsdtPdCp =  btcUsdtOb.bids[0][0],
                    btcUsdtPdVd = btcUsdtOb.asks[0][0],
                    
                    pdCpMoBtc = ba[i].b_btc,
                    pdVdMoBtc = ba[i].a_btc,
                    pdCpMoUsdt = ba[i].b_usdt,
                    pdVdMoUsdt = ba[i].a_usdt


               //LUCRO COMPRANDO EM USDT 
               jEmUsdt = this.funcS.arbitCpEmUsdt(ba[i].par_usdt, pdVdMoUsdt, volPdVdMoUsdt, pdCpMoBtc, volPdCpMoBtc, btcUsdtPdCp)

               if(jEmUsdt.length > 0)
               {
                   janelas.push(
                   {
                      symbol: jEmUsdt[0].symbol, exc: 'Gate', pdVd: jEmUsdt[0].pdVd, volPdVd: jEmUsdt[0].volPdVd,
                      pdCp: jEmUsdt[0].pdCp, volPdCp: jEmUsdt[0].volPdCp, cpEm: 'USDT', vdEm: 'BTC', lucro: jEmUsdt[0].lucro
                   }) 
               }
                   
               //LUCRO COMPRANDO EM BTC
                jEmBtc = this.funcS.arbitCpEmBtc(ba[i].par_btc, pdVdMoBtc, volPdVdMoBtc, pdCpMoUsdt, volPdCpMoUsdt, btcUsdtPdVd)
                
                if(jEmBtc.length > 0)
                {
                    janelas.push(
                    {
                        symbol: jEmBtc[0].symbol, exc: 'Gate', pdVd: jEmBtc[0].pdVd, volPdVd: jEmBtc[0].volPdVd,
                        pdCp: jEmBtc[0].pdCp, volPdCp: jEmBtc[0].volPdCp,  cpEm: 'BTC', vdEm: 'USDT', lucro: jEmBtc[0].lucro
                    }) 
               }

            }

            if(janelas.length > 0)
            {
                for(let i in janelas)
                    console.log('Janelas Gate: ' + janelas[i].symbol + ' pdVd: ' + janelas[i].pdVd + 
                    ' pdCp: ' + janelas[i].pdCp + ' lucro: ' + janelas[i].lucro)
            }
            
         return janelas   
    }

    async binanceUsdtBtc()
    {
        let jEmBtc = [], // JANELAS COM USO DA FUNÇÃO
            jEmUsdt = [], // JANELAS COM USO DA FUNÇÃO
            j  = [], // JANELAS

            btcUsdtOb = await this.excS.ob_binance('BTCUSDT'),
            t = await this.excS.tickers_binance() // TICKERS

            // //BUSCA AS janelasMexc CASO EXISTA
            for(let i = 0; i < t.length; i++)
            {
               let  btcUsdtPdCp =  btcUsdtOb.bids[0][0],
                    btcUsdtPdVd = btcUsdtOb.asks[0][0],
                    
                    pdCpMoBtc = t[i].b_btc,
                    pdVdMoBtc = t[i].a_btc,
                    pdCpMoUsdt = t[i].b_usdt,
                    pdVdMoUsdt = t[i].a_usdt,

                    volPdCpMoBtc = t[i].v_btcB,
                    volPdVdMoBtc = t[i].v_btcA,
        
                    volPdCpMoUsdt = t[i].v_usdtB,
                    volPdVdMoUsdt = t[i].v_usdtA 

                //    this.funcS.testeEmBTC(t[i].par_btc, pdVdMoBtc, pdCpMoUsdt, btcUsdtPdVd)
                //    this.funcS.testeEmUsdt(t[i].par_usdt, pdVdMoUsdt, pdCpMoBtc, btcUsdtPdCp)

               //LUCRO COMPRANDO EM USDT 
               jEmUsdt = this.funcS.arbitCpEmUsdt(t[i].par_usdt, pdVdMoUsdt, volPdVdMoUsdt, pdCpMoBtc, volPdCpMoBtc, btcUsdtPdCp)

               if(jEmUsdt.length > 0)
               {
                   j.push(
                   {
                      symbol: jEmUsdt[0].symbol, exc: 'Binance', pdVd: jEmUsdt[0].pdVd, volPdVd: jEmUsdt[0].volPdVd,
                      pdCp: jEmUsdt[0].pdCp, volPdCp: jEmUsdt[0].volPdCp, cpEm: 'USDT', vdEm: 'BTC', lucro: jEmUsdt[0].lucro
                   }) 
               }
                 
               //LUCRO COMPRANDO EM BTC
                jEmBtc = this.funcS.arbitCpEmBtc(t[i].par_btc, pdVdMoBtc, volPdVdMoBtc, pdCpMoUsdt, volPdCpMoUsdt, btcUsdtPdVd)
                
                if(jEmBtc.length > 0)
                {
                    j.push(
                    {
                        symbol: jEmBtc[0].symbol, exc: 'Binance', pdVd: jEmBtc[0].pdVd, volPdVd: jEmBtc[0].volPdVd,
                        pdCp: jEmBtc[0].pdCp, volPdCp: jEmBtc[0].volPdCp,  cpEm: 'BTC', vdEm: 'USDT', lucro: jEmBtc[0].lucro
                    }) 
               }

            }

            if(j.length > 0)
            {
                for(let i in j)
                    console.log('Compre ' + j[i].symbol + ' pdVd: ' + j[i].pdVd + 
                    ' pdCp: ' + j[i].pdCp + ' lucro: ' + j[i].lucro + ' na Binance')
            }
            
         return j
    }

    async poloniexUsdtBtc()
    {
        let jEmBtc = [], // JANELAS COM USO DA FUNÇÃO
            jEmUsdt = [], // JANELAS COM USO DA FUNÇÃO
            j  = [], // JANELAS

            btcUsdtOb = await this.excS.ob_poloniex('USDT_BTC'),
            t = await this.excS.tickers_poloniex() // TICKERS



            // //BUSCA AS janelasMexc CASO EXISTA
            for(let i = 0; i < t.length; i++)
            {
               let  btcUsdtPdCp =  btcUsdtOb.bids[0][0],
                    btcUsdtPdVd = btcUsdtOb.asks[0][0],
                    
                    pdCpMoBtc = t[i].b_btc,
                    pdVdMoBtc = t[i].a_btc,
                    pdCpMoUsdt = t[i].b_usdt,
                    pdVdMoUsdt = t[i].a_usdt,

                    volPdCpMoBtc = null,
                    volPdVdMoBtc = null,
        
                    volPdCpMoUsdt = null,
                    volPdVdMoUsdt = null

                //    this.funcS.testeEmBTC(t[i].par_btc, pdVdMoBtc, pdCpMoUsdt, btcUsdtPdVd)
                //    this.funcS.testeEmUsdt(t[i].par_usdt, pdVdMoUsdt, pdCpMoBtc, btcUsdtPdCp)

               //LUCRO COMPRANDO EM USDT 
               jEmUsdt = this.funcS.arbitCpEmUsdt(t[i].par_usdt, pdVdMoUsdt, volPdVdMoUsdt, pdCpMoBtc, volPdCpMoBtc, btcUsdtPdCp)

               if(jEmUsdt.length > 0)
               {
                   j.push(
                   {
                      symbol: jEmUsdt[0].symbol, exc: 'Poloniex', pdVd: jEmUsdt[0].pdVd, volPdVd: jEmUsdt[0].volPdVd,
                      pdCp: jEmUsdt[0].pdCp, volPdCp: jEmUsdt[0].volPdCp, cpEm: 'USDT', vdEm: 'BTC', lucro: jEmUsdt[0].lucro
                   }) 
               }
                 
               //LUCRO COMPRANDO EM BTC
                jEmBtc = this.funcS.arbitCpEmBtc(t[i].par_btc, pdVdMoBtc, volPdVdMoBtc, pdCpMoUsdt, volPdCpMoUsdt, btcUsdtPdVd)
                
                if(jEmBtc.length > 0)
                {
                    j.push(
                    {
                        symbol: jEmBtc[0].symbol, exc: 'Poloniex', pdVd: jEmBtc[0].pdVd, volPdVd: jEmBtc[0].volPdVd,
                        pdCp: jEmBtc[0].pdCp, volPdCp: jEmBtc[0].volPdCp,  cpEm: 'BTC', vdEm: 'USDT', lucro: jEmBtc[0].lucro
                    }) 
               }

            }

            if(j.length > 0)
            {
                for(let i in j)
                    console.log('Compre ' + j[i].symbol + ' pdVd: ' + j[i].pdVd + 
                    ' pdCp: ' + j[i].pdCp + ' lucro: ' + j[i].lucro + ' na Poloniex')
            }
            
         return j
    }

    async bitMartUsdtBtc()
    {
        let jEmBtc = [], // JANELAS COM USO DA FUNÇÃO
            jEmUsdt = [], // JANELAS COM USO DA FUNÇÃO
            j  = [], // JANELAS

            t = await this.excS.tickers_bitmart() // TICKERS

            // //BUSCA AS janelasMexc CASO EXISTA
            for(let i = 0; i < t.length; i++)
            {
               let  btcUsdtPdCp =  t[i].btcUsdtPdCp,
                    btcUsdtPdVd = t[i].btcUsdtPdVd,
                    
                    pdCpMoBtc = t[i].b_btc,
                    pdVdMoBtc = t[i].a_btc,
                    pdCpMoUsdt = t[i].b_usdt,
                    pdVdMoUsdt = t[i].a_usdt,

                    volPdCpMoBtc = t[i].v_btcB,
                    volPdVdMoBtc = t[i].v_btcA,
        
                    volPdCpMoUsdt = t[i].v_usdtB,
                    volPdVdMoUsdt = t[i].v_usdtA

            //    this.funcS.testeEmBTC(t[i].par_btc, pdVdMoBtc, pdCpMoUsdt, btcUsdtPdVd)
            //    this.funcS.testeEmUsdt(t[i].par_usdt, pdVdMoUsdt, pdCpMoBtc, btcUsdtPdCp)

               //LUCRO COMPRANDO EM USDT 
               jEmUsdt = this.funcS.arbitCpEmUsdt(t[i].par_usdt, pdVdMoUsdt, volPdVdMoUsdt, pdCpMoBtc, volPdCpMoBtc, btcUsdtPdCp)

               if(jEmUsdt.length > 0)
               {
                   j.push(
                   {
                      symbol: jEmUsdt[0].symbol, exc: 'BitMart', pdVd: jEmUsdt[0].pdVd, volPdVd: jEmUsdt[0].volPdVd,
                      pdCp: jEmUsdt[0].pdCp, volPdCp: jEmUsdt[0].volPdCp, cpEm: 'USDT', vdEm: 'BTC', lucro: jEmUsdt[0].lucro
                   }) 
               }
                 
               //LUCRO COMPRANDO EM BTC
                jEmBtc = this.funcS.arbitCpEmBtc(t[i].par_btc, pdVdMoBtc, volPdVdMoBtc, pdCpMoUsdt, volPdCpMoUsdt, btcUsdtPdVd)
                
                if(jEmBtc.length > 0)
                {
                    j.push(
                    {
                        symbol: jEmBtc[0].symbol, exc: 'BitMart', pdVd: jEmBtc[0].pdVd, volPdVd: jEmBtc[0].volPdVd,
                        pdCp: jEmBtc[0].pdCp, volPdCp: jEmBtc[0].volPdCp,  cpEm: 'BTC', vdEm: 'USDT', lucro: jEmBtc[0].lucro
                    }) 
               }

            }

            if(j.length > 0)
            {
                for(let i in j)
                    console.log('Compre ' + j[i].symbol + ' pdVd: ' + j[i].pdVd + 
                    ' pdCp: ' + j[i].pdCp + ' lucro: ' + j[i].lucro + ' na BitMart')
            }
            
         return j
    }

}