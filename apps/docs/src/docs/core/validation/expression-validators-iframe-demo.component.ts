import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgDocNotifyIframeComponent } from '@ng-doc/app';

@Component({
  selector: 'expression-validators-iframe-demo',
  imports: [NgDocNotifyIframeComponent],
  template: `<ng-doc-notify-iframe src="http://localhost:4201/expression-validators-demo" height="900px" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExpressionValidatorsIframeDemoComponent {}
