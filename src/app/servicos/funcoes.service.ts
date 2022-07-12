import { Injectable } from '@angular/core'

const percent = 2

@Injectable()
export class Funcoes
{
    arbitCpEmUsdt(moUsdt, pdVd, volPdVd, pdCp, volPdCp, btcUsdtPdCp)
    {
       let janelas = []

       if(pdVd < pdCp && pdVd > 0)
       {
          let apuradoBtcUsdt = pdCp * btcUsdtPdCp,

          lucro = (apuradoBtcUsdt - pdVd) / pdVd * 100

          if(lucro > percent)
          {
            janelas.push(
            { 
               symbol: moUsdt, pdVd: pdVd, volPdVd: volPdVd, pdCp: pdCp, volPdCp: volPdCp,
               lucro: lucro.toFixed(2)
            })
          }
          
       }

       return janelas
    }

    arbitCpEmBtc(moBtc, pdVd, volPdVd, pdCp, volPdCp, btcUsdtPdVd)
    {
        let janelas = []

        if(pdVd < pdCp && pdVd > 0)
        {
           let custoBtcUsdt = pdVd * btcUsdtPdVd,
               lucro = (pdCp - custoBtcUsdt) / custoBtcUsdt * 100

           if(lucro > percent)
           {
              janelas.push(
              { 
                 symbol: moBtc, pdVd: pdVd, volPdVd: volPdVd, pdCp: pdCp, volPdCp: volPdCp,
                 lucro: lucro.toFixed(2)
              })
           }
        }

        return janelas
    }

    arbitCpEmEth(par, pdVd, volPdVd, pdCp, volPdCp, btcEthPdVd)
    {
        let janelas = []

        if(pdVd < pdCp && pdVd > 0)
        {
           let custoBtcEth = pdVd * btcEthPdVd,
               lucro = (pdCp - custoBtcEth) / custoBtcEth * 100

           if(lucro > percent)
           {
              janelas.push(
              { 
                 symbol: par, pdVd: pdVd, volPdVd: volPdVd, pdCp: pdCp, volPdCp: volPdCp,
                 lucro: lucro.toFixed(2)
              })
           }
        }

        return janelas
    }

    testeEmBTC(symbol, pdVd, pdCp, btcUsdtPdVd)
    {
        if(pdVd < pdCp && pdVd > 0)
        {
           let custoBtcUsdt = pdVd * btcUsdtPdVd
           let lucro = (pdCp - custoBtcUsdt) / custoBtcUsdt * 100

           if(lucro > 0)
               console.log(symbol + ' a: ' + custoBtcUsdt + ' b: ' +  pdCp + 
             ' lucro: '+ lucro)
         }
    }
    
    testeEmUsdt(symbol, pdVd, pdCp, btcUsdtPdCp)
    {
        if(pdVd < pdCp && pdVd > 0)
        {
           let apuradoBtcUsdt = pdCp * btcUsdtPdCp
           let lucro = (apuradoBtcUsdt - pdVd) / pdVd * 100

           if(lucro > 0)
                  console.log(symbol + 'a: ' + pdVd + ' b: ' +  apuradoBtcUsdt + 
            ' lucro: '+ lucro)
         }
    }

}

// ondeComprar(mCom = [], excPdCp = '', excPdVd = '', excPdCp2 = '', excPdVd2 = '') //Identifica a pedra de Compra e Venda
//     {
//         let pdCpEx1 = 0, volPdCpEx1 = 0,
//             pdVdEx1 = 0, volPdVdEx1 = 0,
//             pdCpEx2 = 0, volPdCpEx2 = 0,
//             pdVdEx2 = 0, volPdVdEx2 = 0,

//             lucro = 0,
//             janelas = [],
//             maLucro = 0 //para garantir o maior lucro quando houver

//         for(let i in mCom)
//         {
//             pdCpEx1 = mCom[i].pdCpEx1 
//             volPdCpEx1 = mCom[i].volPdCpEx1
//             pdVdEx1 = mCom[i].pdVdEx1
//             volPdVdEx1 = mCom[i].volPdVdEx1
//             pdCpEx2 = mCom[i].pdCpEx2
//             volPdCpEx2 = mCom[i].volPdCpEx2
//             pdVdEx2 = mCom[i].pdVdEx2
//             volPdVdEx2 = mCom[i].volPdVdEx2

//             if(pdCpEx1 > pdVdEx2 && pdVdEx2 > 0)
//             {
//                 lucro = (pdCpEx1 - pdVdEx2) / pdVdEx2 * 100
//                 maLucro = lucro
//                 if(lucro >= percent)
//                 {
//                     janelas.push(
//                     { 
//                       symbol: mCom[i].symbol, pdCp: pdCpEx1, volPdCp: volPdCpEx1, pdVd: pdVdEx2, 
//                       volPdVd: volPdVdEx2, excPdCp: excPdCp, excPdVd: excPdVd, lucro: lucro 
//                     })
//                 }
//             }
            
//             if(pdCpEx2 > pdVdEx1 && pdVdEx1 > 0) 
//             {
//                 lucro = (pdCpEx2 - pdVdEx1) / pdVdEx1 * 100

//                 if(lucro >= percent && lucro > maLucro)
//                 {
//                    janelas.push(
//                    { 
//                      symbol: mCom[i].symbol, pdCp: pdCpEx2, volPdCp: volPdCpEx2,  pdVd: pdVdEx1, 
//                      volPdVd: volPdVdEx1, excPdCp: excPdCp2, excPdVd: excPdVd2, lucro: lucro 
//                    })
//                 }                    
//             }
//         }

//         return janelas
//     }