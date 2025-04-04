import { Routes } from '@angular/router';
import { BotsPageComponent } from './pages/bots-page/bots-page.component';
import { BotsConfigurePageComponent } from './pages/bots-configure-page/bots-configure-page.component';
import { CreatePostPageComponent } from './pages/create-post-page/create-post-page.component';
import { ViewPostPageComponent } from './pages/view-post-page/view-post-page.component';
import { ExplorePostPageComponent } from './pages/explore-post-page/explore-post-page.component';
import { RankingPageComponent } from './pages/ranking-page/ranking-page.component';
import { MintBotsPageComponent } from './pages/mint-bots-page/mint-bots-page.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { ClaimPageComponent } from './pages/claim-page/claim-page.component';
import { ExperimentPageComponent } from './pages/experiment-page/experiment-page.component';
import { BotsPageV2Component } from './pages/bots-page-v2/bots-page-v2.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
  },
  {
    path: 'bots',
    component: BotsPageComponent,
  },
  {
    path: 'bots-v2',
    component: BotsPageV2Component,
  },
  {
    path: 'configure',
    component: BotsConfigurePageComponent,
  },
  {
    path: 'create',
    component: CreatePostPageComponent,
  },
  {
    path: 'post/:id',
    component: ViewPostPageComponent,
  },
  {
    path: 'explore',
    component: ExplorePostPageComponent,
  },
  {
    path: 'ranking',
    component: RankingPageComponent,
  },
  {
    path: 'mint',
    component: MintBotsPageComponent,
  },
  {
    path: 'mint/:id',
    component: MintBotsPageComponent,
  },
  {
    path: 'claim',
    component: ClaimPageComponent,
  },
  {
    path: 'experiment',
    component: ExperimentPageComponent,
  },
];
