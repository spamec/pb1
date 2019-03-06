import {Component} from '@angular/core';
import {BlockUI, BlockUIService, NgBlockUI} from 'ng-block-ui';
import {BlockNames, BlockUiTemplateComponent} from './components/block-uitemplate/block-ui-template.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @BlockUI() blockUI: NgBlockUI;
  blockTemplate = BlockUiTemplateComponent;
  blockName = BlockNames.MainBlock;
  constructor(private blockUIService: BlockUIService) {
    this.blockUI.name = BlockNames.MainBlock;
    // Start blocking

   /* setTimeout(() => {
      this.blockUIService.stop(BlockNames.MainBlock); // Stop blocking
    }, 10000);*/
  }
}
