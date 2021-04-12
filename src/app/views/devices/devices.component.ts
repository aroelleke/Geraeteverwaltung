import { Component, OnInit } from '@angular/core';

import { ApiService } from 'src/app/service/api.service';
import { Device } from '../../interfaces/device.interface';

@Component({
    selector: 'app-devices',
    templateUrl: './devices.component.html',
    styleUrls: ['./devices.component.scss']
})
export class DevicesComponent implements OnInit {

    public deviceList: Array<Device> = [];
    public mutableFilteredDeviceList: Array<Device> = [];

    public filterValue: string = '';

    public newDevice: Device = this.clearDevice();

    constructor(private apiService: ApiService) { }

    ngOnInit(): void {
        this.prepareDeviceList();
    }

    private clearDevice(): Device {
        return {
            ID: 0,
            Label: '',
            DescriptiveInformation: '',
            SerialNumber: '',
            Manufacturer: '',
            Model: '',
            RentStart: '',
            ExpectedReturn: '',
            LocationID: 0,
            PersonID: 0,
        };
    }

    private prepareDeviceList(): void {
        this.apiService.getDeviceList().toPromise()
            .then((deviceList: Array<Device>) => {
                if (deviceList && deviceList.length != 0) {
                    this.deviceList = deviceList;
                    this.mutableFilteredDeviceList = deviceList;
                }
            })
            .catch((err: any) => {
                window.alert('Geräte Liste konnte nicht abgefragt werden!')
            });
    }

    public async createDevice(device: Device): Promise<void> {
        if (device.RentStart != '') {
            device.RentStart = this.converDateToYMD(new Date(device.RentStart));
        }
        if (device.ExpectedReturn != '') {
            device.ExpectedReturn = this.converDateToYMD(new Date(device.ExpectedReturn));
        }
        await this.apiService.createDevice(device).toPromise()
            .then((result: any) => {
                window.alert('Gerät wurder erstellt!');
                this.newDevice = this.clearDevice();
            })
            .catch((err: any) => {
                window.alert('Gerät konnte nicht erstellt werden!')
            });
        await this.apiService.getDeviceID(device).toPromise()
            .then((result: any) => {
                device.ID = result.ID;
                this.deviceList.push(device);
                this.doFilter(this.filterValue);
            })
            .catch((err: any) => {
                window.alert('Gerät konnte nicht erstellt werden!')
            });
    }

    private converDateToYMD(date: Date) {
        var year: string = date.getFullYear().toString();
        var month: string = (date.getMonth() + 1).toString();
        if (month.length == 1) {
            month = "0" + month;
        }
        var day: string = date.getDate().toString();
        if (day.length == 1) {
            day = "0" + day;
        }
        return `${year}-${month}-${day}`;
    }

    public prepareFilter(event: any): void {
        this.doFilter(event.target.value);
    }

    private doFilter(filterValue: string): void {
        if (filterValue == '') {
            this.mutableFilteredDeviceList = this.deviceList;
            return;
        }
        var regex: RegExp = new RegExp(`/${filterValue}/i`);
        this.mutableFilteredDeviceList = this.deviceList.filter((value: any) => {
            var keys: Array<string> = Object.keys(value);
            var matchAny: boolean = false;
            for (let index: number = 0; index < keys.length; index++) {
                matchAny = regex.test(value[keys[index]]);
                if (matchAny) {
                    break;
                }
            }
            return matchAny;
        })
    }

    public cancel(index: number) {
        this.mutableFilteredDeviceList[index] = this.deviceList.filter((value: Device) => {
            return value.ID == this.mutableFilteredDeviceList[index].ID;
        })[0];
    }

    public deleteDevice(deviceID: number): void {
        this.apiService.deleteDevice(deviceID.toString()).toPromise()
            .then((result: any) => {
                window.alert('Gerät wurde gelöscht!');
                var index: number;
                index = this.deviceList.findIndex((value: Device) => { return value.ID == deviceID; });
                if (index != -1) { this.deviceList.splice(index, 1); }
                index = this.mutableFilteredDeviceList.findIndex((value: Device) => { return value.ID == deviceID; });
                if (index != -1) { this.mutableFilteredDeviceList.splice(index, 1); }

            })
            .catch((err: any) => {
                window.alert('Gerät konnte nicht gelöscht werden!')
            });
    }

    public updateDevice(deviceID: number): void {
        var device: Device = this.mutableFilteredDeviceList.filter((value) => {
            return value.ID == deviceID;
        })[0];
        this.apiService.updateDevice(device).toPromise()
            .then((result: any) => {
                window.alert('Änderungen wurde gespeichert!');
            })
            .catch((err: any) => {
                window.alert('Änderungen konnten nicht gespeichert werden!')
            });
    }
}