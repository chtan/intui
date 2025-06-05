import { Component, OnInit, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { environment } from "@environment/environment";

@Component({
  selector: 'app-default-component',
  template: `<div style="background: lightblue; color: white; padding: 10px;">Loading...</div>`,
  standalone: true
})
export class DefaultComponent {}

@Component({
  selector: 'app-taskpad',
  imports: [
    CommonModule,
  ],
  templateUrl: './taskpad.component.html',
  styleUrl: './taskpad.component.scss'
})
export class TaskpadComponent implements OnInit {
  taskid: string = '';

  component: Type<any> | null = null; // Store the resolved component

  constructor(
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const queryParams = this.route.snapshot.queryParamMap;
    this.taskid = queryParams.get('taskid') + '';
    this.getComponent(this.taskid);
  }

  async getComponent(name: string) {
    // https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
    // https://stackoverflow.com/questions/72115880/typescript-angular-dynamic-imports-module-build-failed
    // Need to have these lines in tsconfig.app.json
    //
    //  "include": [
    //    "src/**/*.d.ts",
    //    "src/app/task/tasks/*.ts"
    //  ],
    //  "exclude": [
    //    "**/*.spec.ts"
    //  ]
    //

    var componentName = `Task${name}Component`;

    try {
      //const { Task5Component } = await import(`./tasks/task-5.component`);
      //this.component = Task5Component;

      //const componentModule = await import(`./tasks/${name}.component.ts`);
      const componentModule = await import(`./tasks/task-${name}.component.ts`);
      const componentClass = componentModule[componentName];
      this.component = componentClass;

    } catch (error) {
      console.error(`Error loading component ${name}:`, error);

      this.component = DefaultComponent;
    }
  }
}
