VSCODE-TODO-HIGHLIGHT
===

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)

[![Build Status](https://travis-ci.org/wayou/vscode-todo-highlight.svg?branch=master)](https://travis-ci.org/wayou/vscode-todo-highlight)

[![Version](http://vsmarketplacebadge.apphb.com/version-short/wayou.vscode-todo-highlight.svg)](https://marketplace.visualstudio.com/items?itemName=robertohuertasm.vscode-icons)
[![Installs](http://vsmarketplacebadge.apphb.com/installs-short/wayou.vscode-todo-highlight.svg)](https://marketplace.visualstudio.com/items?itemName=robertohuertasm.vscode-icons)
[![Ratings](http://vsmarketplacebadge.apphb.com/rating-short/wayou.vscode-todo-highlight.svg)](https://marketplace.visualstudio.com/items?itemName=robertohuertasm.vscode-icons)

Highlight `TODO`,`FIXME` or any other annotations within your code.

Sometimes you will forget to review the TODOs added while coding till publish the code to production.
So I've been long for an extension to highlight them and remind me know there're notes or things not done.

Hope this extension helps you as well.

### Config

`TODO:`,`FIXME:` are built in keywords. You can override the look by customizing the setting.

To custom the keywords and other stuff, <kbd>command</kbd> + <kbd>,</kbd> (Windows / Linux: File -> Preferences -> User Settings) open vscode `settings.json` file.

following is an example of configuration:

```js
{
    "todohighlight.isEnable": true, //toggle the highlight, default is true
    "todohighlight.isCaseSensitive": false, //whether the keywords are case sensitive or not
    "todohighlight.keywords": [
        "BUG:", // adding custom keywords without specifying the look, default color will be applied
        "REVIEW:", //another custom keyword
        {  //adding custom keywords with custom look
            "text": "NOTE:", // custom text to be highlighted
            "color": "#ff0000", // the text color, any css color identifier is valid
            "backgroundColor": "yellow", // the text background color
            "overviewRulerColor": "grey" //the color of the ruler mark on the scroll bar. use rgba() and define transparent colors to play well with other decorations.
        },
        {
            "text": "HACK:",
            "color": "#000"
        }
        ...
    ],
    "todohighlight.defaultStyle": { //specify the default style for custom keywords, if not specified, build in default style will be applied
        "color": "#0000ff",
        "backgroundColor": "yellow",
        "overviewRulerColor": "grey"
    }
}
```

**All settings are optional**

### Commands

This extension contributes the following commands to the Command palette.

- `Toggle highlight` : turn on/off the highlight

### Preview

- with `material night` color theme:
![](https://github.com/wayou/vscode-todo-highlight/raw/master/assets/material-night.png)

- with `material night eighties` color theme:
![](https://github.com/wayou/vscode-todo-highlight/raw/master/assets/material-night-eighties.png)
