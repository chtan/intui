import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { TaskControlComponent } from './workspace/task-control/task-control.component';
import { TaskspaceComponent } from './workspace/taskspace/taskspace.component';
import { TaskComponent } from './task/task.component';
import { AuthGuard } from './auth/auth.guard';
import { TaskTokenGuard } from './guards/task-token.guard';
import { GoTaskComponent } from './go-task/go-task.component';
import { LoginComponent } from './login/login.component';
import { TempviewComponent } from './tempview/tempview.component';

export const routes: Routes = [
  	{ path: '', component: HomeComponent, pathMatch: 'full' },

  	{ 
  		//path: 'workspace/:uid',
  		path: 'workspace',
  		component: WorkspaceComponent,
	  	children: [
	  		{ path: '', component: TaskspaceComponent },
	    	{ path: 'task/:tid', component: TaskControlComponent },
	  	],
	  	canActivate: [ AuthGuard ],
  	},

  	{ path: 'task', component: GoTaskComponent },
  	{ path: 'task/:tid', component: TaskComponent },

  	{ path: 'login', component: LoginComponent },
  	{ path: 'tempview', component: TempviewComponent, canActivate: [TaskTokenGuard] },

  	{ path: '404', component: NotFoundComponent },
  	{ path: '**', redirectTo: '/404' },
];
