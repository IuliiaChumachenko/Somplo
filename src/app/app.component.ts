import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

enum AnimationTypes {
  SlideInFromTop = "Slide in from top",
  SlideInFromBottom = "Slide in from bottom",
  ZoomInFromCenter = "Zoom in from top",
  FadeIn = "Fade in",
  FadeInAndRotate = "Fade in and rotate"
}

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.less'],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  public form: FormGroup;
  public imageFile?: File;
  public animationTypes = Object.entries(AnimationTypes);

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      imgFileName: ["", [Validators.required]],
      animationType: ["", [Validators.required]],
      containerWidth: [""],
      containerHeight: [""],
      positionX: [""],
      positionY: [""]
    });
  }

  public onDownloadBtnClick(): void {
    this.form?.markAllAsTouched();
    this.form?.updateValueAndValidity();

    if (this.form?.valid) {
      this.downloadHtmlFile();
    }
  }

  public onChangeFile(imageFile: any): void {
    if (imageFile) {
      this.imageFile = imageFile;
    }

    this.form?.controls['imgFileName'].setValue(imageFile?.name || "");
  }

  private downloadHtmlFile(): void {
    const formValue = this.form.value;
    const animation = formValue.animationType;
    const containerWidth = formValue.containerWidth;
    const containerHeight = formValue.containerHeight;
    const isAddedContainer = containerWidth && containerHeight;
    const positionX = formValue.positionX;
    const positionY = formValue.positionY;
    const reader = new FileReader();

    const containerStyles = isAddedContainer ? `
      width: ${containerWidth}px;
      height: ${containerHeight}px;
      box-shadow: 1px 2px 5px rgba(0, 0, 0, 0.25);
      margin-left: ${positionX || 0}px;
      margin-top: ${positionY || 0}px;
      animation: ${animation} 5s ease-in;
    ` : '';

    const imgStyles = isAddedContainer ? `
      width: 100%;
      height: 100%;
    ` : `
      max-height: 100%;
      max-width: 100%;
      animation: ${animation} 5s ease-in;
    `;

    reader.onload = (event: any) => {
      const imageDataUrl = event.target.result;

      const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Image Animation</title>
          <style>
            html * {
                box-sizing: border-box;
            }

            body {
                height: 100vh;
                overflow: auto;
                margin: 0;
            }

            .container {
              ${containerStyles}
            }

            img {
              ${imgStyles}
            }

            @keyframes SlideInFromTop {
              0% { transform: translateY(-100%); }
              100% { transform: translateY(0); }
            }

            @keyframes SlideInFromBottom {
              0% { transform: translateY(+100%); }
              100% { transform: translateY(0); }
            }

            @keyframes ZoomInFromCenter {
              0% { transform: scale(0);}
              100% { transform: scale(1); }
            }

            @keyframes FadeIn {
              0% { opacity: 0;}
              100% { opacity: 1; }
            }

            @keyframes FadeInAndRotate {
              0% { opacity: 0; transform: rotate(0deg);}
              100% { opacity: 1; transform: rotate(360deg);}
            }
          </style>
        </head>
        <body>
          ${isAddedContainer ? '<div class="container">' : ''}
            <img src="${imageDataUrl}">
          ${isAddedContainer ? '</div>' : ''}
        </body>
      </html>
    `;

      const element = document.createElement('a');
      const file = new Blob([htmlContent], {type: 'text/html'});
      element.href = URL.createObjectURL(file);
      element.download = 'image-animation.html';
      document.body.appendChild(element);
      element.click();
    };

    reader.readAsDataURL(this.imageFile as Blob);
  }
}
