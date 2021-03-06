import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AboutComponent } from './pages/about/about.component';
import { BlogComponent } from './pages/blog/blog.component';
import { HomeComponent } from './pages/home/home.component';
import { ImprintComponent } from './pages/imprint/imprint.component';
import { ShopComponent } from './pages/shop/shop.component';
import { SidenavComponent } from './shared/sidenav/sidenav.component';

const routes: Routes = [
  {
    path: '',
    component: SidenavComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'shop', redirectTo: 'shop/', pathMatch: 'full' },
      { path: 'shop/:_id', component: ShopComponent },
      { path: 'blog', redirectTo: 'blog/', pathMatch: 'full' },
      { path: 'blog/:_id', component: BlogComponent },
      { path: 'imprint', component: ImprintComponent },
      { path: 'about', component: AboutComponent }
    ]
  },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
