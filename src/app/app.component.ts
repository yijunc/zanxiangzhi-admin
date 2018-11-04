import { Component, Inject } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


export interface PeriodicElement {
  id: number;
  name: string;
  left: number;
}

export interface DialogData {
  tag: number;
  reset_value: number;
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {


  displayedColumns: string[] = [
    "id",
    "name",
    "left",
    "is_operating",
    "action"
  ];

  all_device: PeriodicElement[];
  response_data: any;

  dataSource: PeriodicElement[];

  constructor(private http: HttpClient, public snackBar: MatSnackBar, public dialog: MatDialog) {
    this.all_device = [];
  }

  ngOnInit() {
    this.refresh_all_device();

  }

  get_all_device(): any {
    return this.http.get("http://www.zanxiangzhi.com/api/device/get_all");
  }

  refresh_all_device() {
    this.all_device = [];
    this.get_all_device().subscribe((data: any) => {
      this.response_data = data['data'];
      // console.log(this.response_data);
      this.response_data.forEach(element => {
        let temp_element_is_operating = '上线'
        if (element.is_operating == 0) {
          temp_element_is_operating = '下线'
        }
        let temp =
        {
          id: element.id,
          name: '...' + element.tag.substring(8, element.tag.length),
          left: element.left_segment_count,
          is_operating: temp_element_is_operating
        };
        this.all_device.push(temp);
      });
      // console.log(this.all_device)
      this.dataSource = this.all_device;
    });
  }

  reset(id: number): void {
    this.openDialog(id);
  }

  offline(id: number): void {
    this.http.get("http://www.zanxiangzhi.com/api/device/offline_device?device_id=" + id).subscribe((response: any) => {
      if (response['code'] == 200) {
        let snackBarRef = this.snackBar.open('ID 为 ' + id + ' 的机器已下线！');
        this.refresh_all_device();
      }
      else {
        let snackBarRef = this.snackBar.open('ID 为 ' + id + ' 的机器下线失败！');
      }
    });
  }

  openDialog(id: number): void {
    const dialogRef = this.dialog.open(DialogResetDialog, {
      width: '250px',
      data: { tag: id, reset_value: 5000 }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
      if (result != undefined) {
        this.http.get("http://www.zanxiangzhi.com/api/device/reset_device?device_id="
          + id + "&reset_amount=" + result).subscribe((response: any) => {
            if (response['code'] == 200) {
              let snackBarRef = this.snackBar.open('ID 为 ' + id + ' 的机器已重置成功！');
              this.refresh_all_device();
            }
            else {
              let snackBarRef = this.snackBar.open('ID 为 ' + id + ' 的机器重置失败！');
            }
          });
      }
    });
  }
}

@Component({
  selector: 'dialog-reset-dialog',
  templateUrl: 'dialog-reset-dialog.html',
})
export class DialogResetDialog {

  constructor(
    public dialogRef: MatDialogRef<DialogResetDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}