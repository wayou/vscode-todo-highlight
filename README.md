Highlight `TODO`,`FIXME` or any other annotations within your code.

Sometimes you will forget to review the TODOs added while coding till publish the code to production.
So I've been long for an extension to highlight them and remind me know there're notes or things not done.

Hope this extension helps you as well.

### Config

Once installed, you can customize by tuning your settings.

To do so, <kbd>command</kbd> + <kbd>,</kbd> (Windows / Linux: File -> Preferences -> User Settings) open vscode `settings.json` file.

following is an example of Configuration:

```js
"todohighlight": {
        "isCaseSensitive":false,//whether the keywords are case sensitive or not, if true, only strict matched keywords will be highlighted
        "keywords": [
            "BUG:",// adding customized keywords without specifying the look, default color will be applied
            "REVIEW:", //another customized keyword
            {
                "text": "NOTE:", //adding customied keywords with customied look
                "color": "#ff0000", // the highlight color, any valid css color will do
                "backgroundColor": "yellow" // the background color for highlighted keyword, any valid css color will do
            },
            {
                "text": "HACK:",
                "color": "#000"
            }
            ...
        ],
        "defaultStyle": { //specify the default style for customied keywords
            "color": "rgba(99,99,99,.5)",
            "backgroundColor": "#EEE"
        }
    }
```

**All settings are optional**

### Preview

- with `material night` color theme:
![](https://github.com/wayou/vscode-todo-highlight/raw/master/assets/material-night.png)

- with `material night eighties` color theme:
![](https://github.com/wayou/vscode-todo-highlight/raw/master/assets/material-night-eighties.png)
