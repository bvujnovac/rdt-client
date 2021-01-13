import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Setting } from 'src/app/models/setting.model';
import { SettingsService } from 'src/app/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  @Input()
  public get open(): boolean {
    return this.isActive;
  }

  public set open(val: boolean) {
    this.reset();
    this.isActive = val;
  }

  @Output()
  public openChange = new EventEmitter<boolean>();

  public isActive = false;

  public saving = false;
  public error: string;
  public testPathError: string;
  public testPathSuccess: boolean;

  public settingRealDebridApiKey: string;
  public settingDownloadPath: string;
  public settingMappedPath: string;
  public settingDownloadLimit: number;
  public settingUnpackLimit: number;
  public settingMinFileSize: number;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {}

  public reset(): void {
    this.saving = false;
    this.error = null;

    this.settingsService.get().subscribe(
      (results) => {
        this.settingRealDebridApiKey = this.getSetting(results, 'RealDebridApiKey');
        this.settingDownloadPath = this.getSetting(results, 'DownloadPath');
        this.settingMappedPath = this.getSetting(results, 'MappedPath');
        this.settingDownloadLimit = parseInt(this.getSetting(results, 'DownloadLimit'), 10);
        this.settingUnpackLimit = parseInt(this.getSetting(results, 'UnpackLimit'), 10);
        this.settingMinFileSize = parseInt(this.getSetting(results, 'MinFileSize'), 10);
      },
      (err) => {
        this.error = err.error;
        this.saving = true;
      }
    );
  }

  public ok(): void {
    this.saving = true;

    const settings: Setting[] = [
      {
        settingId: 'RealDebridApiKey',
        value: this.settingRealDebridApiKey,
      },
      {
        settingId: 'DownloadPath',
        value: this.settingDownloadPath,
      },
      {
        settingId: 'MappedPath',
        value: this.settingMappedPath,
      },
      {
        settingId: 'DownloadLimit',
        value: (this.settingDownloadLimit ?? 10).toString(),
      },
      {
        settingId: 'UnpackLimit',
        value: (this.settingUnpackLimit ?? 1).toString(),
      },
      {
        settingId: 'MinFileSize',
        value: (this.settingMinFileSize ?? 0).toString(),
      },
    ];

    this.settingsService.update(settings).subscribe(
      () => {
        this.isActive = false;
        this.openChange.emit(this.open);
      },
      (err) => {
        this.error = err;
      }
    );
  }

  public test(): void {
    this.saving = true;
    this.testPathError = null;
    this.testPathSuccess = false;

    this.settingsService.testPath(this.settingDownloadPath).subscribe(
      () => {
        this.saving = false;
        this.testPathSuccess = true;
      },
      (err) => {
        console.log(err);
        this.testPathError = err.error;
        this.saving = false;
      }
    );
  }

  public cancel(): void {
    this.isActive = false;
    this.openChange.emit(this.open);
  }

  private getSetting(settings: Setting[], key: string): string {
    const setting = settings.filter((m) => m.settingId === key);

    if (setting.length !== 1) {
      throw new Error(`Unable to find setting with key ${key}`);
    }

    return setting[0].value;
  }
}
