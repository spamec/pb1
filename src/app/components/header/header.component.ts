import {Component, OnInit} from '@angular/core';
import {WialonService} from '../../services/wialon.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  timezoneInfo: string;

  constructor(private wialonService: WialonService) {
  }

  ngOnInit() {
    this.timezoneInfo = this.wialonService.fillTimezoneInfo();
  }

}
