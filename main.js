const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

//SET ENV to Prod
process.env.NODE_ENV = "production";

let mainWindow;
let addWindow;

//Listen for app to be ready
app.on('ready', function(){
    //Create new window
    mainWindow = new BrowserWindow({});
    //Load the html file into the window 
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "mainWindow.html"),
        protocol: "file:",
        slashes: true
    }));

    //Quit app when closed
    mainWindow.on("closed", function(){
        app.quit();
    });

    //Build the menu from the template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu
    Menu.setApplicationMenu(mainMenu);
});


//Handle add window function
function createAddWindow()
{
    //Create add new window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title:"Add Shopping List Item"
    });
    //Load the html file into the window 
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, "addWindow.html"),
        protocol: "file:",
        slashes: true  
    }));

    //Garbage collection handle
    addWindow.on("close", function()
    {
        addWindow = null;
    })
}

//Catch item:add from AddWindowHTML
ipcMain.on("item:add", function(e, item){
    console.log(item);
    mainWindow.webContents.send("item:add", item);
    addWindow.close();
})

//Create menu template
const mainMenuTemplate = [
    {
        label:"File",
        submenu:[
            {
                label:"Add Item",
                click(){
                    createAddWindow();
                }
            },
            {
                label:"Clear Items",
                click()
                {
                    mainWindow.webContents.send("item:clear");
                }
            },
            {
                label:"Quit",
                accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
                click(){
                    app.quit();
                }
            }
        ]
    }
];

//If mac, add empty object to menu
if(process.platform == "darwin")
{
    mainMenuTemplate.unshift({});
}

//add developer tools if not in production
if(process.env.NODE_ENV !== "production")
{
    mainMenuTemplate.push({
        label: "Developer Tools",
        submenu:[
            {
                label: "Toggle DevTools",
                accelerator: process.platform == "darwin" ? "Command+i" : "Ctrl+i",
                click(item, focusWindow)
                {
                    focusWindow.toggleDevTools(); 
                }
            },
            {
                role:"reload"
            }
        ]
    });
}
