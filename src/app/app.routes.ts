import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { TaskControlComponent } from './workspace/task-control/task-control.component';
import { TaskspaceComponent } from './workspace/taskspace/taskspace.component';
import { TaskComponent } from './task/task.component';


export const routes: Routes = [
  	{ path: '', component: HomeComponent, pathMatch: 'full' },

  	{ 
  		path: 'workspace/:uid', 
  		component: WorkspaceComponent,
	  	children: [
	  		{ path: '', component: TaskspaceComponent },
	    	{ path: 'task/:tid', component: TaskControlComponent },
	  	]
  	},

  	{ path: 'task/:tid', component: TaskComponent },

  	{ path: '404', component: NotFoundComponent },
  	{ path: '**', redirectTo: '/404' },
];
