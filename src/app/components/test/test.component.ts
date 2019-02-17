import {Component, OnInit} from '@angular/core';
import {ObjectsService} from '../../services/objects.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  data: any;

  constructor(private objectsService: ObjectsService) {
  }

  ngOnInit() {
    this.data = this.objectsService.getObjectData();
    // this.objectsService.getObjectData().then((data) => {
    //   console.log(data);
    // });
  }

}
