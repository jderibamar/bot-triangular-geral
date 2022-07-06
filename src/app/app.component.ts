import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core'
// import { LiveAnnouncer } from '@angular/cdk/a11y'
import { MexcService } from './servicos/mexc.service'
import { ExmoService } from './servicos/exmo.service'
import { BittrexService } from './servicos/bittrex.service'
import { TriangularServico } from './servicos/triangular.service'
import { Funcoes } from './servicos/funcoes.service'

import {} from '@angular/cdk/a11y'
import { MatSort, Sort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { fromEvent } from 'rxjs'


@Component(
{
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit
{
  constructor
  (
     private mexcS: MexcService, private btxS: BittrexService, private triS: TriangularServico,
     private exmoS: ExmoService, private funcS: Funcoes
  ) {}

    colunasTab: string[] = ['moeda', 'exc', 'comprar_em', 'vender_em', 'vol_cp', 'vol_vd', 'cp_por', 'vd_por', 'lucro']
    dataSource: any 

    @ViewChild(MatSort) sort: MatSort
    @ViewChild('filter',  {static: true}) filter: ElementRef

    ngOnInit(): void 
    {
        setInterval(() => this.gerarTabelaHTML() , 3000)
        setInterval(() => location.reload() , 300 * 1000)
        this.loadData()

        this.triS.mercatoxUsdtBtc()
    }

    // ngAfterViewInit() 
    // { 
    //     setInterval( () => { this.gerarTabelaHTML() }, 3000)
    // }   

    public loadData() 
    {
        fromEvent(this.filter.nativeElement, 'keyup').subscribe(() => 
        {
          if (!this.dataSource) 
          {
             return
          }
          this.dataSource.filter = this.filter.nativeElement.value
        })
    }


      //monta o ARRAY de fonte de dados para gerar a tabela que será renderizada
      //bc = Binance / Crex
      async gerarTabelaHTML()
      {          
          //arrary geral contendo todas as interesecções de todas as exchanges
          let todasExcs = [],
              mexc = await this.triS.mexcUsdtBtc(),
              fmfw = await this.triS.fmFwUsdtBtc(),
              bittrex = await this.triS.bittrexUsdtBtc(),
              gate = await this.triS.gateUsdtBtc(),
              binance = await this.triS.binanceUsdtBtc()
  
          todasExcs.push
          (
             ...fmfw, ...bittrex, ...mexc, ...gate, ...binance
          )
  
          this.dataSource = new MatTableDataSource(todasExcs)
          this.dataSource.sort = this.sort
  
          // console.log('Array geral: ' + todasExcs)
          // ...crexExmo, ...crexMexc, ...crexBittrex,  ...crexCoinex, ...crexChangellyPro, ...crexAscendex, ...crexZtb, ...crexFmfw,
      }
      
}
