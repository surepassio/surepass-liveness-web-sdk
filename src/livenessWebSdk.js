import EventEmitter from "events";

class surepassLivenessWebSdk extends EventEmitter {
  constructor() {
    super();
    this.bindMessageEvent = this.bindMessageEvent.bind(this);
    this.isMobile = this.isMobile.bind(this);
    this.LivenessWebSdkMessage = this.LivenessWebSdkMessage.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleSuccess = this.handleSuccess.bind(this);
    this.checkForWindowStatus = this.checkForWindowStatus.bind(this);
    this.startCheckingWinStatus = this.startCheckingWinStatus.bind(this);
    this.popupCenter = this.popupCenter.bind(this);
    this.popup = false;
    this.defaultOptions = {
      dimension: { height: 850, width: 450 },
      toolbar: "no",
      location: "no",
      directories: "no",
      status: "no",
      menubar: "no",
      copyhistory: "no",
    };
    this.userCompletedSteps = false;
  }

  startCheckingWinStatus() {
    const intervalFunction = this.checkForWindowStatus;
    this.handle = setInterval(intervalFunction, 5000);
  }

  checkForWindowStatus() {
    const intervalFunction = this.handle;
    if (this.popup.closed) {
      clearInterval(intervalFunction);
      if (!this.userCompletedSteps) {
        const message = {
          data: {
            error: "POPUP_CLOSED",
          },
          status_code: 433,
          message: "User closed the popup window before process completed",
          success: false,
        };
        this.emit("error", message);
      }
    }
  }

  isMobile() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }
  handleSuccess(response) {
    this.userCompletedSteps = true;
    this.popup.close()
    this.emit("success", response);
  }

  handleError(response) {
    this.userCompletedSteps = true;
    this.popup.close();
    this.emit("error", response);
  }

  LivenessWebSdkMessage(event) {
    try {
      const data = JSON.parse(event.data);
      // console.log(data);
      if (data.status_code === 200) {
        this.handleSuccess(data);
      } else {
        this.handleError(data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  bindMessageEvent() {
    const LivenessWebSdkMessage = this.LivenessWebSdkMessage;
    window.addEventListener("message", LivenessWebSdkMessage, false);
  }

  popupCenter(url, parameters) {
    const left = window.screen.width / 2 - parameters.dimension.width / 2;
    const top = window.screen.height / 2 - parameters.dimension.height / 2;
    this.popup = window.open(
      url,
      parameters.window_name,
      `toolbar=${parameters.toolbar},location=${parameters.location},directories=${parameters.directories},
      status=${parameters.status},menubar=${parameters.menubar},copyhistory=${parameters.copyhistory},
      width=${parameters.dimension.width},height=${parameters.dimension.height},top=${top},left=${left}`
    );
    // Puts focus on the newWindow
    if (window.focus) this.popup.focus();
  }

  openWindow(url, options) {
    const parameters = { ...this.defaultOptions, ...options }; //options ? options : this.defaultOptions;
    if (!this.popup && !this.popup.closed) {
      if (!url) {
        this.emit("error", "Please provide a valid url");
      } else {
        if (this.isMobile()) {
          try {
            this.popup = window.open(url + "&mobile=true");
            this.bindMessageEvent();
            this.startCheckingWinStatus();
          } catch (error) {
            this.emit("error", "Couldn't open new Window");
          }
        } else {
          this.popupCenter(url, parameters);

          this.bindMessageEvent();
          this.startCheckingWinStatus();
        }
      }
    } else {
      this.popup.focus();
    }
  }
}

class LivenessWebSdkPopUpOpener {
  constructor(options) {
    this.LivenessWebSdk = new surepassLivenessWebSdk();
    this.token = options.token;
    this.options = options;
  }

  openWindow(onSuccess, onError) {
    const token = this.token;
    const options = this.options;
    const url = `https://liveness-web-sdk-dot-neopt-capture.el.r.appspot.com/?liveness_token=${token}&window_name=${options.window_name?options.window_name:'Surepass Livemess SDK'}`;
    this.LivenessWebSdk.openWindow(url, options);
    this.LivenessWebSdk.on("error", (response) => onError(response));
    this.LivenessWebSdk.on("success", (response) => onSuccess(response));
  }
}

export default LivenessWebSdkPopUpOpener;
export { LivenessWebSdkPopUpOpener as OpenLivenessWebSdkPopUP };
