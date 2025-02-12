import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  	{ path: '', component: HomeComponent, pathMatch: 'full' },

  	{ path: '404', component: NotFoundComponent },
  	{ path: '**', redirectTo: '/404' },
];
