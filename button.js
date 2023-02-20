const { EventEmitter } = require('events');
const { app, BrowserWindow, nativeImage } = require('electron');

class Button extends EventEmitter {
    constructor(options) {
        super();
        this.options = options;
        this.browserWindow = BrowserWindow.getAllWindows()[0];
        this.image = nativeImage.createFromPath(this.options.icon);

        this.browserWindow.webContents.on('did-finish-load', () => {
            this.init();
        });
    }

    init() {
        const buttonId = `button-${Math.floor(Math.random() * 1000)}`;
        this.browserWindow.webContents.insertCSS(`
      #${buttonId} {
        background-image: url(${this.image.toDataURL()});
        background-size: 16px 16px;
        background-repeat: no-repeat;
        background-position: center;
        height: 100%;
        width: 28px;
        cursor: pointer;
        margin-right: 4px;
      }
      #${buttonId}:hover {
        opacity: 0.7;
      }
    `);

        this.browserWindow.webContents.executeJavaScript(`
      const div = document.createElement('div');
      div.setAttribute('id', '${buttonId}');
      div.addEventListener('click', () => {
        ${this.options.click.toString()}();
      });
      document.querySelector('.toolbar').appendChild(div);
    `);
    }
}

module.exports = Button;
