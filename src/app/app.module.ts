import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IonicModule } from '@ionic/angular';
import { HomeComponent } from './components/home/home.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BackComponent } from './components/back/back.component';
import { FrontComponent } from './components/front/front.component';
import { BackcameraiosComponent } from './components/ios/backcameraios/backcameraios.component';
import { FrontcameraiosComponent } from './components/ios/frontcameraios/frontcameraios.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FrontComponent,
    BackComponent,
    FrontcameraiosComponent,
    BackcameraiosComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
